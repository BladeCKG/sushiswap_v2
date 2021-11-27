import { SwitchHorizontalIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Typography from 'app/components/Typography'
import ActionItem from 'app/features/trident/balances/ActionsModal/ActionItem'
import { ActiveModal } from 'app/features/trident/balances/context/types'
import DepositToBentoBoxModal from 'app/features/trident/balances/DepositToBentoBoxModal'
import { useRouter } from 'next/router'
import React, { FC, useCallback } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { ActiveModalAtom, SelectedCurrencyAtom } from '../context/atoms'
import _ActionsModal from './_ActionsModal'

const WalletActionsModal: FC = () => {
  const [activeModal, setActiveModal] = useRecoilState(ActiveModalAtom)
  const currency = useRecoilValue(SelectedCurrencyAtom)
  const { i18n } = useLingui()
  const router = useRouter()

  const swapActionHandler = useCallback(async () => {
    if (currency?.isNative) return router.push('/trident/swap')
    return router.push(`/trident/swap?tokens=ETH&tokens=${currency?.wrapped.address}`)
  }, [currency?.isNative, currency?.wrapped.address, router])

  return (
    <>
      <_ActionsModal>
        <div className="flex flex-col bg-dark-900 p-5 pt-7 gap-5">
          <div className="flex flex-col gap-3">
            <Typography variant="lg" weight={700} className="text-high-emphesis">
              {i18n._(t`Available Actions`)}
            </Typography>
            <ActionItem svg={<SwitchHorizontalIcon width={24} />} label={i18n._(t`Swap`)} onClick={swapActionHandler} />
            <ActionItem
              svg={
                <svg width="20" height="20" viewBox="0 0 42 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M41.2889 30.3349L39.2614 1.09591C39.2232 0.533741 38.7295 0.111781 38.1797 0.149292C37.6465 0.187037 37.2385 0.632858 37.2367 1.1625C37.2343 0.601106 36.7719 0.146973 36.2024 0.146973C35.6314 0.146973 35.168 0.603511 35.168 1.16696V30.406C35.168 30.9694 35.6314 31.426 36.2024 31.426C36.7734 31.426 37.2367 30.9694 37.2367 30.406V1.17169C37.2369 1.19366 37.2377 1.21577 37.2392 1.23801L39.2667 30.477C39.3037 31.0149 39.7492 31.426 40.2765 31.426C40.8692 31.4259 41.3296 30.922 41.2889 30.3349ZM11.9733 0.146973H27.1704C29.4558 0.146973 31.315 2.00617 31.3149 4.29161V17.6465H20.2626V13.5019C20.2626 11.2164 18.4034 9.35723 16.1179 9.35723H11.9733V0.146973ZM16.1179 12.1205H11.9733V17.6467H17.4995V13.5021C17.4995 12.7403 16.8797 12.1205 16.1179 12.1205ZM0 27.3174V20.4097H14.7365V31.462H4.14463C1.8592 31.462 0 29.6028 0 27.3174ZM17.4995 20.4097V31.462H27.1704C29.4558 31.462 31.315 29.6028 31.315 27.3174V20.4097H17.4995ZM0 4.29161C0 2.00617 1.8592 0.146973 4.14463 0.146973H9.21026V17.6465H0V4.29161Z"
                    fill="currentColor"
                  />
                </svg>
              }
              label={i18n._(t`Deposit to BentoBox`)}
              onClick={() => setActiveModal(ActiveModal.DEPOSIT)}
            />
            <Typography variant="sm" className="text-blue text-center mb-5 mt-2 cursor-pointer">
              What is BentoBox?
            </Typography>
          </div>
        </div>
      </_ActionsModal>
      <DepositToBentoBoxModal
        open={activeModal === ActiveModal.DEPOSIT}
        onClose={() => setActiveModal(ActiveModal.MENU)}
      />
    </>
  )
}

export default WalletActionsModal
