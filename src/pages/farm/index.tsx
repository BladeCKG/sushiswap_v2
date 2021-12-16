import { InformationCircleIcon } from '@heroicons/react/solid'
import { ChainId, SUSHI_ADDRESS, MINICHEF_ADDRESS } from '@sushiswap/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { Chef, PairType } from '../../features/farm/enum'
import { useActiveWeb3React, useFuse } from '../../hooks'

import Alert from '../../components/Alert'
import Container from '../../components/Container'
import ExternalLink from '../../components/ExternalLink'
import FarmList from '../../features/farm/FarmList'
import Head from 'next/head'
import Menu from '../../features/farm/FarmMenu'
import React from 'react'
import Search from '../../components/Search'
import Typography from '../../components/Typography'
import { classNames } from '../../functions'
import useFarmRewards from '../../hooks/useFarmRewards'
import { usePositions } from '../../features/farm/hooks'
import useContractTokenBalance from '../../hooks/useContractTokenBalance'
import { useRouter } from 'next/router'
import Provider from '../../features/lending/context'

export default function Farm(): JSX.Element {
  const { chainId } = useActiveWeb3React()

  const router = useRouter()
  const type = router.query.filter == null ? 'all' : (router.query.filter as string)

  const positions = usePositions(chainId)

  const miniChefBalances = useContractTokenBalance(SUSHI_ADDRESS[chainId], MINICHEF_ADDRESS[chainId])
  const miniOutOfRewards = miniChefBalances.value > BigNumber.from('0x3635C9ADC5DEA00000') ? false : true

  const FILTER = {
    all: (farm) => farm.allocPoint !== '0' && farm.chef !== Chef.OLD_FARMS,
    portfolio: (farm) => farm?.amount && !farm.amount.isZero(),
    sushi: (farm) => farm.pair.type === PairType.SWAP && farm.allocPoint !== '0',
    kashi: (farm) => farm.pair.type === PairType.KASHI && farm.allocPoint !== '0',
    '2x': (farm) =>
      (farm.chef === Chef.MASTERCHEF_V2 || farm.chef === Chef.MINICHEF) &&
      farm.rewards.length > 1 &&
      farm.allocPoint !== '0',
    old: (farm) => farm.chef === Chef.OLD_FARMS,
  }

  const rewards = useFarmRewards()

  const data = rewards.filter((farm) => {
    return type in FILTER ? FILTER[type](farm) : true
  })

  const options = {
    keys: ['pair.id', 'pair.token0.symbol', 'pair.token1.symbol'],
    threshold: 0.4,
  }

  const { result, term, search } = useFuse({
    data,
    options,
  })

  return (
    <Container id="farm-page" className="grid h-full grid-cols-4 py-4 mx-auto md:py-8 lg:py-12 gap-9" maxWidth="7xl">
      <Head>
        <title>Farm | Sushi</title>
        <meta key="description" name="description" content="Farm SUSHI" />
      </Head>
      <div className={classNames('sticky top-0 hidden lg:block md:col-span-1')} style={{ maxHeight: '40rem' }}>
        <Menu positionsLength={positions.length} />
      </div>
      <div className={classNames('space-y-6 col-span-4 lg:col-span-3')}>
        {chainId && chainId === ChainId.CELO && (
          <div className="bg-[rgba(255,255,255,0.04)] p-4 py-2 rounded flex flex-row items-center gap-4">
            <InformationCircleIcon width={28} height={28} color="pink" />
            <Typography variant="xs" weight={700}>
              <ExternalLink id={`celo-optics-info-link`} href="https://app.optics.xyz/" className="text-high-emphesis">
                {`Click for more info on Optics V1 Migration.`}
              </ExternalLink>
            </Typography>
          </div>
        )}
        {[chainId && chainId !== ChainId.MAINNET && miniOutOfRewards] && (
          <div className="bg-[rgba(255,255,255,0.04)] p-4 py-2 rounded flex flex-row items-center gap-4">
            <InformationCircleIcon width={28} height={28} color="pink" />
            <Typography variant="xs" weight={700}>
              {`MiniChef is low or out of Sushi Rewards. Withdraw & Harvests may temporarily revert until MiniChef is refilled.`}
            </Typography>
          </div>
        )}
        <Search
          search={search}
          term={term}
          inputProps={{
            className:
              'relative w-full bg-transparent border border-transparent focus:border-gradient-r-blue-pink-dark-900 rounded placeholder-secondary focus:placeholder-primary font-bold text-base px-6 py-3.5',
          }}
        />
        {/* <div className="flex items-center text-lg font-bold text-high-emphesis whitespace-nowrap">
            Ready to Stake{' '}
            <div className="w-full h-0 ml-4 font-bold bg-transparent border border-b-0 border-transparent rounded text-high-emphesis md:border-gradient-r-blue-pink-dark-800 opacity-20"></div>
          </div>
          <FarmList farms={filtered} term={term} /> */}
        <div className="flex items-center text-lg font-bold text-high-emphesis whitespace-nowrap">
          Farms{' '}
          <div className="w-full h-0 ml-4 font-bold bg-transparent border border-b-0 border-transparent rounded text-high-emphesis md:border-gradient-r-blue-pink-dark-800 opacity-20"></div>
        </div>

        <FarmList farms={result} term={term} />
      </div>
    </Container>
  )
}

Farm.Provider = Provider
