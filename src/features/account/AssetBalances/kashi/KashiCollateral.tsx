import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, CurrencyAmount } from '@sushiswap/core-sdk'
import Typography from 'app/components/Typography'
import { Fraction } from 'app/entities'
import { useCollateralPositionAmounts } from 'app/features/account/AssetBalances/kashi/hooks'
import { useCollateralTableConfig } from 'app/features/account/AssetBalances/kashi/useCollateralTableConfig'
import AssetBalances from 'app/features/portfolio/AssetBalances/AssetBalances'
import { useRouter } from 'next/router'
import React from 'react'

export interface CollateralData {
  collateral: CurrencyAmount<Currency>
  value: CurrencyAmount<Currency>
  limit: Fraction
  pair: any
}

const useGetCollateralTableData = (): CollateralData[] =>
  useCollateralPositionAmounts().map((p) => ({
    collateral: p.amount,
    value: p.amount,
    limit: p.pair.health.string as Fraction,
    pair: p.pair,
  }))

export const KashiCollateral = () => {
  const { i18n } = useLingui()
  const router = useRouter()

  const data = useGetCollateralTableData()
  const config = useCollateralTableConfig(data)

  return (
    <div className="flex flex-col w-full gap-3">
      <div className="flex items-center gap-2">
        <Typography weight={700} variant="lg" className="text-high-emphesis">
          {i18n._(t`Kashi`)}
        </Typography>
        <Typography weight={700} variant="sm" className="text-low-emphesis">
          {i18n._(t`(collateral on borrows)`)}
        </Typography>
      </div>
      <AssetBalances config={config} onSelect={(row) => router.push(`/borrow/${row.original.pair.address}`)} />
    </div>
  )
}
