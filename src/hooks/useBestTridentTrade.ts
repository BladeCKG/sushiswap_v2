import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, Currency, CurrencyAmount, Pair, Trade as LegacyTrade, TradeType, WNATIVE } from '@sushiswap/core-sdk'
import { MultiRoute, RouteStatus } from '@sushiswap/tines'
import {
  ConstantProductPool,
  convertTinesSingleRouteToLegacyRoute,
  findMultiRouteExactIn,
  findMultiRouteExactOut,
  findSingleRouteExactIn,
  findSingleRouteExactOut,
  Trade,
} from '@sushiswap/trident-sdk'
import { PoolUnion } from 'app/features/trident/types'
import { toShareCurrencyAmount } from 'app/functions'
import { useBentoRebase } from 'app/hooks/useBentoRebases'
import { ConstantProductPoolState } from 'app/hooks/useConstantProductPools'
import { PairState, useV2Pairs } from 'app/hooks/useV2Pairs'
import { useActiveWeb3React } from 'app/services/web3'
import { useBlockNumber } from 'app/state/application/hooks'
import { useEffect, useMemo, useState } from 'react'
import { atom, useSetRecoilState } from 'recoil'

import { useAllCurrencyCombinations } from './useAllCurrencyCombinations'
import { useConstantProductPoolsPermutations } from './useConstantProductPools'

export function useAllCommonPools(currencyA?: Currency, currencyB?: Currency): (PoolUnion | Pair)[] {
  const currencyCombinations = useAllCurrencyCombinations(currencyA, currencyB)
  const constantProductPools = useConstantProductPoolsPermutations(currencyCombinations)
  const allPairs = useV2Pairs(currencyCombinations)

  // concentratedPools
  // hybridPools
  // indexPools

  const pools = useMemo(() => [...constantProductPools, ...allPairs], [allPairs, constantProductPools])
  return useMemo(
    () => [
      ...Object.values(
        pools.reduce<(PoolUnion | Pair)[]>((acc, result) => {
          if (!Array.isArray(result) && result.state === ConstantProductPoolState.EXISTS && result.pool) {
            acc.push(result.pool)
          }

          if (Array.isArray(result) && result[0] === PairState.EXISTS && result[1]) {
            acc.push(result[1])
          }

          return acc
        }, [])
      ),
    ],
    [pools]
  )
}

export type UseBestTridentTradeOutput = {
  trade?:
    | Trade<Currency, Currency, TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT>
    | LegacyTrade<Currency, Currency, TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT>
  priceImpact?: number
}

export type RoutingInfo = {
  chainId?: ChainId
  allowedPools?: (PoolUnion | Pair)[]
  mode?: 'single' | 'multiple'
  route?: MultiRoute
}

export const routingInfo = atom<RoutingInfo | undefined>({
  key: 'routingInfo',
  default: undefined,
})

/**
 * Returns best trident trade for a desired swap.
 * @param tradeType whether we request an exact output amount or we provide an exact input amount
 * @param amountSpecified the exact amount to swap in/out
 * @param mainCurrency the desired input/payment currency
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTridentTrade(
  tradeType: TradeType.EXACT_INPUT | TradeType.EXACT_OUTPUT,
  amountSpecified?: CurrencyAmount<Currency>,
  mainCurrency?: Currency,
  otherCurrency?: Currency
): UseBestTridentTradeOutput {
  const { chainId, library } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const setRoutingInfo = useSetRecoilState(routingInfo)
  const [trade, setTrade] = useState<UseBestTridentTradeOutput>({ trade: undefined, priceImpact: undefined })
  const { rebase } = useBentoRebase(amountSpecified?.currency)
  const [gasPrice, setGasPrice] = useState<number>()
  const [currencyIn, currencyOut] = useMemo(
    () => (tradeType === TradeType.EXACT_INPUT ? [mainCurrency, otherCurrency] : [otherCurrency, mainCurrency]),
    [tradeType, mainCurrency, otherCurrency]
  )
  const allowedPools = useAllCommonPools(currencyIn, currencyOut)
  const shareSpecified = useMemo(() => {
    if (!amountSpecified || !rebase) return
    return CurrencyAmount.fromRawAmount(
      amountSpecified.currency,
      toShareCurrencyAmount(rebase, amountSpecified.wrapped).quotient.toString()
    )
  }, [amountSpecified, rebase])

  useEffect(() => {
    if (!library) return

    const main = async () => {
      const gas = await library.getGasPrice()
      return gas.toNumber()
    }

    main().then((gasPrice) => setGasPrice(gasPrice))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber, library])

  useEffect(() => {
    const bestTrade = async () => {
      if (
        gasPrice &&
        currencyIn &&
        currencyOut &&
        currencyIn.wrapped.address !== currencyOut.wrapped.address &&
        chainId &&
        shareSpecified &&
        amountSpecified &&
        otherCurrency &&
        allowedPools.length > 0
      ) {
        const tridentPools = allowedPools.filter((pool) => pool instanceof ConstantProductPool) as ConstantProductPool[]
        const legacyPools = allowedPools.filter((pair) => pair instanceof Pair) as Pair[]

        if (tradeType === TradeType.EXACT_INPUT) {
          const tridentRoute = findMultiRouteExactIn(
            currencyIn.wrapped,
            currencyOut.wrapped,
            BigNumber.from(shareSpecified.quotient.toString()),
            tridentPools,
            WNATIVE[shareSpecified.currency.chainId],
            chainId === ChainId.KOVAN ? 750 * 1e9 : gasPrice
          )

          const legacyRoute = findSingleRouteExactIn(
            currencyIn.wrapped,
            currencyOut.wrapped,
            BigNumber.from(amountSpecified.quotient.toString()),
            legacyPools,
            WNATIVE[amountSpecified.currency.chainId],
            chainId === ChainId.KOVAN ? 750 * 1e9 : gasPrice
          )

          if (tridentRoute.amountOutBN.gt(legacyRoute.amountOutBN)) {
            if (tridentRoute.status === RouteStatus.Success) {
              const priceImpact = tridentRoute.priceImpact
              setRoutingInfo({ chainId, allowedPools: tridentPools, route: tridentRoute, mode: 'multiple' })
              return {
                trade: Trade.bestTradeExactIn(tridentRoute, shareSpecified, currencyOut),
                priceImpact,
              }
            }
          } else {
            if (legacyRoute.status === RouteStatus.Success) {
              const priceImpact = legacyRoute.priceImpact
              setRoutingInfo({ chainId, allowedPools: legacyPools, route: legacyRoute, mode: 'single' })
              return {
                trade: LegacyTrade.exactIn(
                  convertTinesSingleRouteToLegacyRoute(legacyRoute, legacyPools, currencyIn, currencyOut),
                  amountSpecified
                ),
                priceImpact,
              }
            }
          }
        } else {
          const tridentRoute = findMultiRouteExactOut(
            currencyIn.wrapped,
            currencyOut.wrapped,
            BigNumber.from(shareSpecified.quotient.toString()),
            tridentPools,
            WNATIVE[shareSpecified.currency.chainId],
            chainId === ChainId.KOVAN ? 750 * 1e9 : gasPrice
          )

          const legacyRoute = findSingleRouteExactOut(
            currencyIn.wrapped,
            currencyOut.wrapped,
            BigNumber.from(amountSpecified.quotient.toString()),
            legacyPools,
            WNATIVE[amountSpecified.currency.chainId],
            chainId === ChainId.KOVAN ? 750 * 1e9 : gasPrice
          )

          if (tridentRoute.amountInBN.lt(legacyRoute.amountInBN)) {
            if (tridentRoute.status === RouteStatus.Success) {
              const priceImpact = tridentRoute.priceImpact
              setRoutingInfo({ chainId, allowedPools: tridentPools, route: tridentRoute, mode: 'multiple' })
              return {
                trade: Trade.bestTradeExactOut(tridentRoute, currencyIn, shareSpecified),
                priceImpact,
              }
            }
          } else {
            if (legacyRoute.status === RouteStatus.Success) {
              const priceImpact = legacyRoute.priceImpact
              setRoutingInfo({ chainId, allowedPools: legacyPools, route: legacyRoute, mode: 'single' })
              return {
                trade: LegacyTrade.exactOut(
                  convertTinesSingleRouteToLegacyRoute(legacyRoute, legacyPools, currencyIn, currencyOut),
                  amountSpecified
                ),
                priceImpact,
              }
            }
          }
        }
      }

      return {
        trade: undefined,
        priceImpact: undefined,
      }
    }

    bestTrade().then((trade) => {
      setTrade(trade)
    })
  }, [
    allowedPools,
    amountSpecified,
    chainId,
    currencyIn,
    currencyOut,
    gasPrice,
    otherCurrency,
    setRoutingInfo,
    shareSpecified,
    tradeType,
  ])

  return trade
}
