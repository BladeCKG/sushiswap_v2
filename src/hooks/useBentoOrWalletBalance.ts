import { Currency, CurrencyAmount, JSBI, Rebase, Token } from '@sushiswap/core-sdk'
import { toAmountCurrencyAmount } from 'app/functions'
import { useBoringHelperContract } from 'app/hooks/useContract'
import { useActiveWeb3React } from 'app/services/web3'
import { useSingleCallResult } from 'app/state/multicall/hooks'
import { useCurrencyBalances } from 'app/state/wallet/hooks'
import { useMemo } from 'react'

export const useBentoBalances = (tokens?: Token[]) => {
  const { account } = useActiveWeb3React()
  const boringHelperContract = useBoringHelperContract()
  const tokenAddresses = tokens ? tokens.map((el) => el.address) : undefined
  const balanceData = useSingleCallResult(boringHelperContract, 'getBalances', [account, tokenAddresses])

  return useMemo(() => {
    if (!tokens || !tokenAddresses || !balanceData.result) return []

    return tokenAddresses.reduce<CurrencyAmount<Token>[]>((acc, cur, index) => {
      acc.push(
        toAmountCurrencyAmount(
          {
            elastic: JSBI.BigInt(balanceData.result[0][index].bentoAmount.toString()),
            base: JSBI.BigInt(balanceData.result[0][index].bentoShare.toString()),
          } as Rebase,
          CurrencyAmount.fromRawAmount(tokens[index], balanceData.result[0][index].bentoBalance)
        )
      )
      return acc
    }, [])
  }, [balanceData.result, tokenAddresses, tokens])
}

export const useBentoOrWalletBalances = (
  account: string | undefined,
  currencies: (Currency | Token | undefined)[],
  walletOrBento?: (boolean | undefined)[]
) => {
  const tokens = useMemo(
    () => (currencies.every((el) => el) ? currencies.map((el: Currency) => el.wrapped) : undefined),
    [currencies]
  )

  const balance = useCurrencyBalances(account, currencies)
  const bentoBalance = useBentoBalances(tokens)

  return useMemo(() => {
    if (!currencies.every((el) => !!el) || !bentoBalance) {
      return []
    }

    return currencies.map((cur, index) => {
      if (!cur) {
        return undefined
      }

      let element: CurrencyAmount<Currency> | undefined
      const tokenBalanceFromWallet = walletOrBento?.[index]
      if (tokenBalanceFromWallet === false) {
        element = bentoBalance.find((el) => el?.currency.wrapped.address === cur.wrapped.address)
      } else {
        element = balance.find((el) => el?.currency.wrapped.address === cur.wrapped.address)
      }

      if (!element) {
        element = CurrencyAmount.fromRawAmount(cur.wrapped, '0')
      }

      return element
    }, [])
  }, [currencies, bentoBalance, walletOrBento, balance])
}

export const useBentoOrWalletBalance = (account?: string, currency?: Currency, walletOrBento?: boolean) => {
  const balances = useBentoOrWalletBalances(account, [currency], [walletOrBento])
  return useMemo(() => (balances && currency ? balances[0] : undefined), [balances, currency])
}
