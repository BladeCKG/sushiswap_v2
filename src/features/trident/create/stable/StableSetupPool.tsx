import { PlusIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import AssetSelect from 'app/components/AssetSelect'
import Button from 'app/components/Button'
import ToggleButtonGroup from 'app/components/ToggleButton'
import Typography from 'app/components/Typography'
import { useIndependentAssetInputs } from 'app/features/trident/context/hooks/useIndependentAssetInputs'
import { StablePoolState, useTridentStablePool } from 'app/hooks/useTridentStablePools'
import { useActiveWeb3React } from 'app/services/web3'
import React, { FC, useCallback } from 'react'
import { useRecoilState } from 'recoil'

import { poolCreationPageAtom } from '../../context/atoms'
import { selectedFeeTierAtom } from '../context/atoms'

const StableSetupPool: FC = () => {
  const { account } = useActiveWeb3React()
  const { i18n } = useLingui()
  const [page, setPage] = useRecoilState(poolCreationPageAtom)
  const [feeTier, setFeeTier] = useRecoilState(selectedFeeTierAtom)

  const {
    currencies: [currencies, setCurrencies],
    numberOfInputs: [numberOfInputs, setNumberOfInputs],
  } = useIndependentAssetInputs()

  // TODO ramin a = null
  const [poolState] = useTridentStablePool(currencies[0], currencies[1], feeTier, null)

  const handleSelectedPoolTokens = useCallback(
    (currency, index) => {
      const copy = [...currencies]
      copy[index] = currency
      setCurrencies(copy)
    },
    [currencies, setCurrencies]
  )

  const error = !account
    ? i18n._(t`Connect Wallet`)
    : !currencies.every((el) => el)
    ? i18n._(t`Select tokens`)
    : !feeTier
    ? i18n._(t`Select fee tier`)
    : poolState === StablePoolState.EXISTS
    ? i18n._(t`Pool already exists`)
    : ''

  return (
    <div className="flex flex-col gap-10 p-5">
      <div className="flex flex-col mt-4">
        <Typography variant="h3" className="mb-1 text-high-emphesis" weight={700}>
          {i18n._(t`Select Pool Tokens`)}
        </Typography>
        <div className="z-10 flex flex-col gap-2">
          {currencies.map((cur, index) => (
            <div className="relative flex flex-col" key={index}>
              <AssetSelect
                value={currencies[index]}
                onSelect={(cur) => handleSelectedPoolTokens(cur, index)}
                header={
                  <Typography variant="xs" className="text-secondary tracking-[2.04px] mb-2 ml-4" weight={700}>
                    {i18n._(t`POOL TOKEN ${index + 1}`)}
                  </Typography>
                }
              />
              <div className="absolute z-0 right-2" style={{ bottom: index === currencies.length - 1 ? -58 : -56 }}>
                <div className="border-[3px] border-dark-900 bg-dark-800 rounded-full w-[64px] h-[64px] flex items-center justify-center text-high-emphesis">
                  <PlusIcon width={46} height={46} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-2 px-3 py-3 cursor-pointer" onClick={() => setNumberOfInputs(numberOfInputs + 1)}>
            <Typography className="text-blue" weight={700} variant="sm">
              {i18n._(t`Add Another Token`)}
            </Typography>
            <Typography className="text-secondary" weight={700} variant="sm">
              {i18n._(t`(${10 - currencies.length}/10 Remaining)`)}
            </Typography>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Typography variant="h3" className="mb-2 text-high-emphesis" weight={700}>
          {i18n._(t`Select Fee Tier`)}
        </Typography>
        <ToggleButtonGroup value={feeTier} onChange={setFeeTier} variant="outlined">
          <ToggleButtonGroup.Button value={5}>0.05%</ToggleButtonGroup.Button>
          <ToggleButtonGroup.Button value={10}>0.1%</ToggleButtonGroup.Button>
          <ToggleButtonGroup.Button value={50}>0.5%</ToggleButtonGroup.Button>
          <ToggleButtonGroup.Button value={100}>1%</ToggleButtonGroup.Button>
        </ToggleButtonGroup>
        {feeTier === 50 && (
          <Typography variant="sm" className="italic text-center">
            * This is suggested for most pairs
          </Typography>
        )}
        <Button disabled={error.length > 0} color="gradient" onClick={() => setPage(page + 1)}>
          {error ? error : i18n._(t`Continue`)}
        </Button>
      </div>
    </div>
  )
}

export default StableSetupPool
