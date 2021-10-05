import Alert from '../../../../components/Alert'
import { t } from '@lingui/macro'
import Button from '../../../../components/Button'
import { useLingui } from '@lingui/react'
import Typography from '../../../../components/Typography'
import ListPanel from '../../../../components/ListPanel'
import AssetInput from '../../../../components/AssetInput'
import { NATIVE } from '@sushiswap/core-sdk'
import TransactionDetails from '../TransactionDetails'
import React from 'react'
import { useActiveWeb3React, useBentoBoxContract } from '../../../../hooks'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { attemptingTxnAtom, noLiquiditySelector, poolAtom, showReviewAtom } from '../../context/atoms'
import TridentApproveGate from '../../TridentApproveGate'
import Lottie from 'lottie-react'
import loadingCircle from '../../../../animation/loading-circle.json'
import Dots from '../../../../components/Dots'
import { useZapAssetInput } from '../../context/hooks/useZapAssetInput'

const HybridZapMode = () => {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const bentoBox = useBentoBoxContract()

  const [, pool] = useRecoilValue(poolAtom)
  const {
    zapInputAmount: [zapInputAmount, setZapInputAmount],
    zapCurrency: [zapCurrency, setZapCurrency],
    error,
    parsedAmount,
    parsedSplitAmounts,
  } = useZapAssetInput()

  const setShowReview = useSetRecoilState(showReviewAtom)
  const noLiquidity = useRecoilValue(noLiquiditySelector)
  const attemptingTxn = useRecoilValue(attemptingTxnAtom)

  return (
    <div className="flex flex-col gap-6 px-5">
      <Alert
        dismissable={false}
        type="information"
        showIcon
        message={i18n._(t`In Zap mode, your selected asset will be split and rebalanced into the corresponding tokens and their weights
          automatically.`)}
      />
      <div className="flex flex-col gap-5">
        <AssetInput
          value={zapInputAmount}
          currency={zapCurrency}
          onChange={(val) => setZapInputAmount(val || '')}
          onSelect={setZapCurrency}
          disabled={noLiquidity}
          currencies={[NATIVE[chainId], pool?.token0, pool?.token1]}
        />
        <div className="flex flex-col gap-3">
          <TridentApproveGate inputAmounts={[parsedAmount]} tokenApproveOn={bentoBox?.address}>
            {({ loading, approved }) => (
              <Button
                {...(loading && {
                  startIcon: (
                    <div className="w-5 h-5 mr-1">
                      <Lottie animationData={loadingCircle} autoplay loop />
                    </div>
                  ),
                })}
                color={zapInputAmount ? 'gradient' : 'gray'}
                disabled={!!error || !approved || attemptingTxn}
                className="font-bold text-sm"
                onClick={() => setShowReview(true)}
              >
                {attemptingTxn ? <Dots>Depositing</Dots> : loading ? '' : !error ? i18n._(t`Confirm Deposit`) : error}
              </Button>
            )}
          </TridentApproveGate>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-5 mt-8">
        <Typography weight={700} className="text-high-emphesis">
          {zapCurrency
            ? i18n._(t`Your ${zapCurrency.symbol} will be split into:`)
            : i18n._(t`Your selected token will be split into:`)}
        </Typography>
        <ListPanel
          items={parsedSplitAmounts.map((amount, index) => (
            <ListPanel.CurrencyAmountItem amount={amount} key={index} />
          ))}
        />
      </div>
      {!error && (
        <div className="mt-6 px-5">
          <TransactionDetails />
        </div>
      )}
    </div>
  )
}

export default HybridZapMode
