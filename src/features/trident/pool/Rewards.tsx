import React, { FC } from 'react'
import { useLingui } from '@lingui/react'
import ListPanel from '../../../components/ListPanel'
import { SUSHI } from '../../../config/tokens'
import { ChainId } from '@sushiswap/core-sdk'
import { tryParseAmount } from '../../../functions'
import { t } from '@lingui/macro'
import Typography from '../../../components/Typography'
import { useRecoilValue } from 'recoil'
import { poolAtom } from '../context/atoms'
import useDesktopMediaQuery from '../../../hooks/useDesktopMediaQuery'
import CurrencyLogo from '../../../components/CurrencyLogo'
import { useActiveWeb3React } from '../../../hooks'

const Rewards: FC = () => {
  const { chainId } = useActiveWeb3React()
  const isDesktop = useDesktopMediaQuery()
  const { i18n } = useLingui()
  const { pool } = useRecoilValue(poolAtom)

  // TODO ramin:
  const rewardCurrency = SUSHI[chainId]

  return (
    <>
      <div className="flex flex-col gap-3">
        {isDesktop && (
          <div className="flex flex-row justify-between">
            <Typography variant="h3" className="text-high-emphesis" weight={700}>
              {i18n._(t`Rewards`)}
            </Typography>
            <div className="hidden lg:flex lg:flex-col">
              <Typography variant="sm" className="text-high-emphesis">
                Farm APR: <b>12%</b>
              </Typography>
            </div>
          </div>
        )}

        {isDesktop ? (
          <ListPanel
            header={
              <div className="px-5 flex justify-between h-[56px] items-center">
                <Typography className="text-high-emphesis">Token</Typography>
                <Typography className="text-high-emphesis">Amount</Typography>
              </div>
            }
            items={[
              <ListPanel.Item
                key={0}
                left={
                  <div className="flex flex-row gap-4 items-center">
                    <CurrencyLogo size={30} currency={rewardCurrency} className="rounded-full" />
                    <Typography weight={700} className="text-high-emphesis">
                      {rewardCurrency?.symbol}
                    </Typography>
                  </div>
                }
                right={
                  <div className="flex flex-row gap-1 justify-end">
                    <Typography weight={700} className="text-high-emphesis">
                      69.74 SUSHI per Day
                    </Typography>
                  </div>
                }
              />,
            ]}
          />
        ) : (
          <ListPanel
            header={<ListPanel.Header title={i18n._(t`Rewards`)} />}
            items={[
              <ListPanel.Item
                left={<ListPanel.Item.Left amount={tryParseAmount('401.34', SUSHI[ChainId.MAINNET])} />}
                right={
                  <div className="flex flex-row gap-1 justify-end">
                    <Typography variant="sm" weight={700}>
                      SUSHI
                    </Typography>
                    <Typography variant="sm" className="text-secondary" weight={700}>
                      {i18n._(t`PER DAY`)}
                    </Typography>
                  </div>
                }
                key={0}
              />,
            ]}
          />
        )}
      </div>
    </>
  )
}

export default Rewards
