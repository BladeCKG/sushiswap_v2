import React, { FC, memo, ReactNode, useEffect, useState } from 'react'
import Button from '../../components/Button'
import { useActiveWeb3React, ApprovalState, useApproveCallback, useTridentRouterContract } from '../../hooks'
import useBentoMasterApproveCallback, { BentoApprovalState } from '../../hooks/useBentoMasterApproveCallback'
import { t } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@sushiswap/core-sdk'
import { useLingui } from '@lingui/react'
import { useWalletModalToggle } from '../../state/application/hooks'

interface TokenApproveButtonProps {
  inputAmount: CurrencyAmount<Currency> | undefined
  onStateChange: React.Dispatch<React.SetStateAction<any>>
  tokenApproveOn: string | undefined
}

const TokenApproveButton: FC<TokenApproveButtonProps> = memo(({ inputAmount, onStateChange, tokenApproveOn }) => {
  const { i18n } = useLingui()
  const [approveState, approveCallback] = useApproveCallback(inputAmount?.wrapped, tokenApproveOn)

  useEffect(() => {
    if (!inputAmount?.currency.wrapped.address) return

    onStateChange((prevState) => ({
      ...prevState,
      [inputAmount?.currency.wrapped.address]: approveState,
    }))
  }, [approveState, inputAmount?.currency.wrapped.address, onStateChange])

  if ([ApprovalState.NOT_APPROVED, ApprovalState.PENDING].includes(approveState))
    return (
      <Button.Dotted pending={approveState === ApprovalState.PENDING} color="blue" onClick={approveCallback}>
        {approveState === ApprovalState.PENDING
          ? i18n._(t`Approving ${inputAmount?.currency.symbol}`)
          : i18n._(t`Approve ${inputAmount?.currency.symbol}`)}
      </Button.Dotted>
    )

  return <></>
})

interface TridentApproveGateProps {
  inputAmounts: (CurrencyAmount<Currency> | undefined)[]
  children: ({ approved, loading }: { approved: boolean; loading: boolean }) => ReactNode
  tokenApproveOn: string | undefined
}

const TridentApproveGate: FC<TridentApproveGateProps> = ({ inputAmounts, tokenApproveOn, children }) => {
  const { account } = useActiveWeb3React()
  const { i18n } = useLingui()
  const [status, setStatus] = useState({})
  const router = useTridentRouterContract()
  const toggleWalletModal = useWalletModalToggle()

  const { approve: bApproveCallback, approvalState: bApprove } = useBentoMasterApproveCallback(router?.address, {})

  const loading =
    Object.values(status).some((el) => el === ApprovalState.UNKNOWN) || bApprove === BentoApprovalState.UNKNOWN
  const approved =
    Object.values(status).every((el) => el === ApprovalState.APPROVED) && bApprove === BentoApprovalState.APPROVED

  return (
    <div className="flex flex-col gap-3">
      {[BentoApprovalState.NOT_APPROVED, BentoApprovalState.PENDING].includes(bApprove) && (
        <Button.Dotted pending={bApprove === BentoApprovalState.PENDING} color="blue" onClick={bApproveCallback}>
          {bApprove === BentoApprovalState.PENDING
            ? i18n._(t`Approving BentoBox to spend tokens`)
            : i18n._(t`Approve BentoBox to spend tokens`)}
        </Button.Dotted>
      )}
      {inputAmounts.map((amount, index) => (
        <TokenApproveButton
          inputAmount={amount}
          key={index}
          onStateChange={setStatus}
          tokenApproveOn={tokenApproveOn}
        />
      ))}
      {!account ? (
        <Button color="gradient" onClick={toggleWalletModal}>
          {i18n._(t`Connect Wallet`)}
        </Button>
      ) : (
        children({ approved, loading })
      )}
    </div>
  )
}

export default TridentApproveGate
