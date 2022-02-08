import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { CurrencyAmount, Percent } from '@sushiswap/core-sdk'
import { CurrencyLogoArray } from 'app/components/CurrencyLogo'
import Typography from 'app/components/Typography'
import { TABLE_TBODY_TD_CLASSNAME, TABLE_TBODY_TR_CLASSNAME } from 'app/features/trident/constants'
import { classNames, currencyFormatter, formatNumber, formatPercent } from 'app/functions'
import { useCurrency } from 'app/hooks/Tokens'
import { useUSDCValueWithLoadingIndicator } from 'app/hooks/useUSDCPrice'
import React, { FC } from 'react'

interface KashiMarketListItem {
  market: any
}
const KashiMarketListItem: FC<KashiMarketListItem> = ({ market }) => {
  const { i18n } = useLingui()
  const asset = useCurrency(market.asset.token.address) ?? undefined
  const collateral = useCurrency(market.collateral.token.address) ?? undefined

  // @ts-ignore
  const currentAllAssets = CurrencyAmount.fromRawAmount(asset, market.currentAllAssets)
  const { value: currentAllAssetsUSD, loading: currentAllAssetsUSDLoading } =
    useUSDCValueWithLoadingIndicator(currentAllAssets)

  // @ts-ignore
  const currentBorrowAmount = CurrencyAmount.fromRawAmount(asset, market.currentBorrowAmount)
  const { value: currentBorrowAmountUSD, loading: currentBorrowAmountUSDLoading } =
    useUSDCValueWithLoadingIndicator(currentBorrowAmount)

  // @ts-ignore
  const totalAssetAmount = CurrencyAmount.fromRawAmount(asset, market.totalAssetAmount)
  const { value: totalAssetAmountUSD, loading: totalAssetAmountLoading } =
    useUSDCValueWithLoadingIndicator(totalAssetAmount)

  const currentSupplyAPR = new Percent(market.currentSupplyAPR, 1e18)

  const currentInterestPerYear = new Percent(market.currentInterestPerYear, 1e18)

  console.log({ currentAllAssetsUSDLoading, currentBorrowAmountUSDLoading, totalAssetAmountLoading })

  return (
    <div className={classNames(TABLE_TBODY_TR_CLASSNAME, 'grid grid-cols-6')} onClick={() => {}}>
      <div className={classNames('flex gap-2', TABLE_TBODY_TD_CLASSNAME(0, 6))}>
        {asset && collateral && <CurrencyLogoArray currencies={[asset, collateral]} dense size={32} />}
        <div className="flex flex-col items-start">
          <Typography weight={700} className="flex gap-1 text-high-emphesis">
            {market.asset.token.symbol}
            <span className="text-low-emphesis">/</span>
            {market.collateral.token.symbol}
          </Typography>
          <Typography variant="xs" className="text-low-emphesis">
            {market.oracle.name}
          </Typography>
        </div>
      </div>
      <div className={classNames('flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME(1, 6))}>
        <Typography weight={700} className="text-high-emphesis">
          {formatNumber(currentAllAssets.toSignificant(6))} {market.asset.token.symbol}
        </Typography>
        <Typography variant="xs" className="text-low-emphesis">
          {currentAllAssetsUSD && !currentAllAssetsUSDLoading
            ? currencyFormatter.format(Number(currentAllAssetsUSD?.toExact()))
            : '-'}
        </Typography>
      </div>
      <div className={classNames('flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME(2, 6))}>
        <Typography weight={700} className="text-high-emphesis">
          {formatNumber(currentBorrowAmount.toSignificant(6))} {market.asset.token.symbol}
        </Typography>
        <Typography variant="xs" className="text-low-emphesis">
          {/* {currencyFormatter.format(Number(market.currentBorrowAmount.usd))} */}
          {currentBorrowAmountUSD && !currentBorrowAmountUSDLoading
            ? currencyFormatter.format(Number(currentBorrowAmountUSD?.toExact()))
            : '-'}
        </Typography>
      </div>
      <div className={classNames('flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME(3, 6))}>
        <Typography weight={700} className="text-high-emphesis">
          {formatNumber(totalAssetAmount.toSignificant(6))} {market.asset.token.symbol}
        </Typography>
        <Typography variant="xs" className="text-low-emphesis">
          {totalAssetAmountUSD && !totalAssetAmountLoading
            ? currencyFormatter.format(Number(totalAssetAmountUSD?.toExact()))
            : '-'}
        </Typography>
      </div>
      <div className={classNames('flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME(4, 6))}>
        <Typography weight={700} className="text-high-emphesis">
          {formatPercent(currentSupplyAPR.toFixed(2))}
        </Typography>
        <Typography variant="xs" className="text-low-emphesis">
          {i18n._(t`annualized`)}
        </Typography>
      </div>
      <div className={classNames('flex flex-col !items-end', TABLE_TBODY_TD_CLASSNAME(5, 6))}>
        <Typography weight={700} className="text-high-emphesis">
          {formatPercent(currentInterestPerYear.toFixed(2))}
        </Typography>
        <Typography variant="xs" className="text-low-emphesis">
          {i18n._(t`annualized`)}
        </Typography>
      </div>
    </div>
  )
}

export default KashiMarketListItem
