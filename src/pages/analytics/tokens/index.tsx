import Search from 'app/components/Search'
import AnalyticsContainer from 'app/features/analytics/AnalyticsContainer'
import Background from 'app/features/analytics/Background'
import TokenList from 'app/features/analytics/Tokens/TokenList'
import useFuse from 'app/hooks/useFuse'
import { useBlock, useNativePrice, useTokens } from 'app/services/graph'
import { useActiveWeb3React } from 'app/services/web3'
import { useMemo } from 'react'

export default function Tokens() {
  const { chainId } = useActiveWeb3React()

  const block1d = useBlock({ daysAgo: 1, chainId })
  const block1w = useBlock({ daysAgo: 7, chainId })

  const nativePrice = useNativePrice({ chainId })
  const nativePrice1d = useNativePrice({ block: block1d, chainId })
  const nativePrice1w = useNativePrice({ block: block1w, chainId })

  const tokens = useTokens({ chainId })
  const tokens1d = useTokens({ block: block1d, shouldFetch: !!block1d, chainId })
  const tokens1w = useTokens({ block: block1w, shouldFetch: !!block1w, chainId })

  const tokensFormatted = useMemo(
    () =>
      tokens?.map((token) => {
        const token1d = tokens1d?.find((p) => token.id === p.id) ?? token
        const token1w = tokens1w?.find((p) => token.id === p.id) ?? token

        return {
          token: {
            address: token.id,
            symbol: token.symbol,
            name: token.name,
          },
          liquidity: token.liquidity * token.derivedETH * nativePrice,
          volume1d: token.volumeUSD - token1d.volumeUSD,
          volume1w: token.volumeUSD - token1w.volumeUSD,
          price: token.derivedETH * nativePrice,
          change1d: ((token.derivedETH * nativePrice) / (token1d.derivedETH * nativePrice1d)) * 100 - 100,
          change1w: ((token.derivedETH * nativePrice) / (token1w.derivedETH * nativePrice1w)) * 100 - 100,
          graph: token.dayData
            .slice(0)
            .reverse()
            .map((day, i) => ({ x: i, y: Number(day.priceUSD) })),
        }
      }),
    [tokens, tokens1d, tokens1w, nativePrice, nativePrice1d, nativePrice1w]
  )

  const options = {
    keys: ['token.address', 'token.symbol', 'token.name'],
    threshold: 0.4,
  }

  const {
    result: tokensSearched,
    term,
    search,
  } = useFuse({
    data: tokensFormatted,
    options,
  })

  return (
    <AnalyticsContainer>
      <Background background="tokens">
        <div className="grid items-center justify-between grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
          <div>
            <div className="text-3xl font-bold text-high-emphesis">Tokens</div>
            <div>Click on the column name to sort tokens by it&apos;s price or trading volume.</div>
          </div>
          <Search
            term={term}
            search={search}
            inputProps={{ className: 'placeholder-primary bg-opacity-50 w-full py-3 pl-4 pr-14 rounded bg-dark-900' }}
            className="border shadow-2xl border-dark-800"
          />
        </div>
      </Background>
      <div className="px-4 pt-4 lg:px-14">
        <TokenList tokens={tokensSearched} />
      </div>
    </AnalyticsContainer>
  )
}
