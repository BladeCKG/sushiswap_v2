import { ArrowDownIcon } from '@heroicons/react/outline'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, Percent, Trade, TradeType, ZERO } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import ListPanel from 'app/components/ListPanel'
import { HeadlessUiModal } from 'app/components/Modal'
import Typography from 'app/components/Typography'
import useLimitOrderExecute from 'app/features/legacy/limit-order/useLimitOrderExecute'
import TradePrice from 'app/features/legacy/swap/TradePrice'
import { useAppDispatch } from 'app/state/hooks'
import { setLimitOrderShowReview } from 'app/state/limit-order/actions'
import { useLimitOrderDerivedLimitPrice, useLimitOrderState } from 'app/state/limit-order/hooks'
import React, { FC, useCallback, useMemo, useState } from 'react'

interface LimitOrderReviewModal {
  trade?: Trade<Currency, Currency, TradeType>
}

const LimitOrderReviewModal: FC<LimitOrderReviewModal> = ({ trade }) => {
  const [inverted, setInverted] = useState(false)
  const { showReview, orderExpiration, recipient, attemptingTxn } = useLimitOrderState()
  const limitPrice = useLimitOrderDerivedLimitPrice()
  const dispatch = useAppDispatch()
  const { i18n } = useLingui()
  const { execute } = useLimitOrderExecute()

  const _execute = useCallback(() => {
    if (trade) {
      execute({
        orderExpiration: orderExpiration.value,
        recipient,
        outputAmount: trade.outputAmount,
        inputAmount: trade.inputAmount,
      })
    }
  }, [execute, orderExpiration.value, recipient, trade])

  const deviation = useMemo(() => {
    if (limitPrice && trade) {
      const { numerator, denominator } = limitPrice.subtract(trade.executionPrice).divide(trade.executionPrice)
      return new Percent(numerator, denominator)
    }
  }, [limitPrice, trade])

  return (
    <HeadlessUiModal.Controlled
      isOpen={showReview}
      onDismiss={() => dispatch(setLimitOrderShowReview(false))}
      maxWidth="sm"
    >
      <div className="flex flex-col gap-4">
        <HeadlessUiModal.Header
          header={i18n._(t`Confirm order`)}
          onClose={() => dispatch(setLimitOrderShowReview(false))}
        />
        <HeadlessUiModal.BorderedContent className="flex flex-col gap-2 bg-dark-1000/40">
          <Typography weight={700} variant="sm" className="text-secondary">
            {i18n._(t`You'll pay`)}
          </Typography>
          <ListPanel items={[<ListPanel.CurrencyAmountItem amount={trade?.inputAmount} key={0} />]} />
          <div className="flex justify-center mt-2 -mb-2">
            <ArrowDownIcon width={14} className="text-secondary" />
          </div>
          <Typography weight={700} variant="sm" className="text-secondary justify-end">
            {i18n._(t`You'll receive`)}
          </Typography>
          <ListPanel items={[<ListPanel.CurrencyAmountItem amount={trade?.outputAmount} key={0} />]} />
        </HeadlessUiModal.BorderedContent>
        <HeadlessUiModal.BorderedContent className="flex flex-col gap-1 !py-1 bg-dark-1000/40 divide-y divide-dark-900">
          <div className="flex justify-between py-2">
            <Typography variant="sm" weight={700}>
              {i18n._(t`Expiration`)}
            </Typography>
            <Typography variant="sm" weight={700}>
              {orderExpiration.label}
            </Typography>
          </div>
          <div className="flex flex-col gap-1 py-2">
            <div className="flex justify-between">
              <Typography variant="sm" weight={700}>
                {i18n._(t`Rate`)}
              </Typography>
              <TradePrice
                price={trade?.executionPrice}
                showInverted={inverted}
                setShowInverted={setInverted}
                className="justify-end text-primary"
              />
            </div>
            {deviation && (
              <div className="flex justify-end">
                <Typography
                  variant="xs"
                  weight={700}
                  className={deviation?.greaterThan(ZERO) ? 'text-green' : 'text-red'}
                >
                  {deviation.toSignificant(2)}% {deviation?.greaterThan(ZERO) ? 'above' : 'below'} market rate
                </Typography>
              </div>
            )}
          </div>
        </HeadlessUiModal.BorderedContent>
        <Typography variant="xs" className="text-secondary text-center">
          {i18n._(t`Please note that after order execution, your tokens will be received in your BentoBox`)}
        </Typography>
        <Button loading={attemptingTxn} color="gradient" disabled={attemptingTxn} onClick={_execute}>
          {i18n._(t`Create Limit Order`)}
        </Button>
      </div>
    </HeadlessUiModal.Controlled>
  )
}

export default LimitOrderReviewModal
