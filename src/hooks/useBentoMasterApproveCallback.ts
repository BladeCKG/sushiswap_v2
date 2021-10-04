import { useBentoMasterContractAllowed } from '../state/bentobox/hooks'
import { useActiveWeb3React, useBentoBoxContract } from './index'
import { useAllTransactions, useTransactionAdder } from '../state/transactions/hooks'
import { useCallback, useMemo, useState } from 'react'
import { signMasterContractApproval } from '../entities/KashiCooker'
import { Contract } from '@ethersproject/contracts'
import { AddressZero, HashZero } from '@ethersproject/constants'
import { splitSignature } from '@ethersproject/bytes'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export enum BentoApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  FAILED,
  APPROVED,
}

export enum BentoApproveOutcome {
  SUCCESS,
  REJECTED,
  FAILED,
  NOT_READY,
}

const useBentoHasPendingApproval = (
  masterContract: string | undefined,
  account: string | undefined,
  contractName?: string
) => {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof masterContract === 'string' &&
      typeof account === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const summary = tx.summary
          if (!summary) return false
          return summary === `Approving ${contractName} Master Contract`
        }
      }),
    [allTransactions, account, masterContract, contractName]
  )
}

export interface BentoPermit {
  outcome: BentoApproveOutcome
  signature?: { v: number; r: string; s: string }
  data?: string
}

export interface BentoMasterApproveCallback {
  approvalState: BentoApprovalState
  approve: () => Promise<void>
  getPermit: () => Promise<BentoPermit | undefined>
  permit: BentoPermit | undefined
}

export interface BentoMasterApproveCallbackOptions {
  otherBentoBoxContract?: Contract | null
  contractName?: string
  functionFragment?: string
}

const useBentoMasterApproveCallback = (
  masterContract: string | undefined,
  { otherBentoBoxContract, contractName, functionFragment }: BentoMasterApproveCallbackOptions
): BentoMasterApproveCallback => {
  const { i18n } = useLingui()
  const { account, chainId, library } = useActiveWeb3React()
  const bentoBoxContract = useBentoBoxContract()
  const addTransaction = useTransactionAdder()
  const currentAllowed = useBentoMasterContractAllowed(masterContract, account || AddressZero)
  const pendingApproval = useBentoHasPendingApproval(masterContract, account ? account : undefined, contractName)
  const [permit, setPermit] = useState<BentoPermit | undefined>()

  const approvalState: BentoApprovalState = useMemo(() => {
    if (permit) return BentoApprovalState.APPROVED
    if (pendingApproval) return BentoApprovalState.PENDING

    // We might not have enough data to know whether or not we need to approve
    if (currentAllowed === undefined) return BentoApprovalState.UNKNOWN
    if (!masterContract || !account) return BentoApprovalState.UNKNOWN
    if (!currentAllowed) return BentoApprovalState.NOT_APPROVED

    return BentoApprovalState.APPROVED
  }, [account, currentAllowed, masterContract, pendingApproval, permit])

  const getPermit = useCallback(async () => {
    if (approvalState !== BentoApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }

    if (!masterContract) {
      console.error('masterContract is null')
      return
    }

    if (!account) {
      console.error('no account')
      return
    }

    try {
      const signature = await signMasterContractApproval(
        bentoBoxContract,
        masterContract,
        account,
        library,
        true,
        chainId
      )

      const { v, r, s } = splitSignature(signature)
      const permit = {
        outcome: BentoApproveOutcome.SUCCESS,
        signature: { v, r, s },
        data: (otherBentoBoxContract || bentoBoxContract)?.interface?.encodeFunctionData(
          functionFragment || 'setMasterContractApproval',
          [account, masterContract, true, v, r, s]
        ),
      }

      setPermit(permit)
      return permit
    } catch (e) {
      return {
        outcome: e.code === 4001 ? BentoApproveOutcome.REJECTED : BentoApproveOutcome.FAILED,
      }
    }
  }, [
    account,
    approvalState,
    bentoBoxContract,
    chainId,
    functionFragment,
    library,
    masterContract,
    otherBentoBoxContract,
  ])

  const approve = useCallback(async () => {
    try {
      const tx = await bentoBoxContract?.setMasterContractApproval(account, masterContract, true, 0, HashZero, HashZero)

      return addTransaction(tx, {
        summary: contractName
          ? i18n._(t`Approving ${contractName} Master Contract`)
          : i18n._(t`Approving Master Contract`),
      })
    } catch (e) {}
  }, [account, addTransaction, bentoBoxContract, contractName, i18n, masterContract])

  return {
    approvalState,
    approve,
    getPermit,
    permit,
  }
}

export default useBentoMasterApproveCallback
