import { t } from '@lingui/macro'
import { Trans, useLingui } from '@lingui/react'
import { ChainId } from '@sushiswap/core-sdk'
import HeadlessUIModal from 'app/components/Modal/HeadlessUIModal'
import NavLink from 'app/components/NavLink'
import Typography from 'app/components/Typography'
import { NETWORK_ICON, NETWORK_LABEL } from 'app/config/networks'
import { SUPPORTED_NETWORKS } from 'app/modals/NetworkModal'
import { useActiveWeb3React } from 'app/services/web3'
import cookie from 'cookie-cutter'
import Image from 'next/image'
import React, { FC, Fragment } from 'react'

interface NetworkGuardProps {
  networks: ChainId[]
}

const Component: FC<NetworkGuardProps> = ({ children, networks = [] }) => {
  const { i18n } = useLingui()
  const { chainId, library, account } = useActiveWeb3React()

  const link = (
    <NavLink href="/swap">
      <a className="text-blue focus:outline-none">{i18n._(t`home page`)}</a>
    </NavLink>
  )

  return (
    <>
      <HeadlessUIModal.Controlled
        isOpen={!!account && !networks.includes(chainId)}
        onDismiss={() => null}
        className="transparent"
      >
        <div className="flex flex-col gap-7 justify-center p-4 mt-10 lg:mt-0">
          <Typography variant="h1" className="max-w-2xl text-white text-center" weight={700}>
            {i18n._(t`Roll it back - this feature is not yet supported on ${NETWORK_LABEL[chainId]}.`)}
          </Typography>
          <Typography className="text-center">
            <Trans
              id="Either return to the {link}, or change to an available network."
              values={{ link }}
              components={Fragment}
            />
          </Typography>
          <Typography className="uppercase text-white text-center text-lg tracking-[.2rem]" weight={700}>
            {i18n._(t`Available Networks`)}
          </Typography>
          <div className="flex gap-5 md:gap-10 justify-center">
            {networks.map((key: ChainId, idx: number) => (
              <button
                className="text-primary hover:text-white flex items-center flex-col gap-2 justify-start"
                key={idx}
                onClick={() => {
                  const params = SUPPORTED_NETWORKS[key]
                  cookie.set('chainId', key)
                  if (key === ChainId.ETHEREUM) {
                    library?.send('wallet_switchEthereumChain', [{ chainId: '0x1' }, account])
                  } else if (key === ChainId.KOVAN) {
                    library?.send('wallet_switchEthereumChain', [{ chainId: '0x2A' }, account])
                  } else {
                    library?.send('wallet_addEthereumChain', [params, account])
                  }
                }}
              >
                <div className="w-[40px] h-[40px]">
                  <Image
                    src={NETWORK_ICON[key]}
                    alt="Switch Network"
                    className="rounded-md filter drop-shadow-currencyLogo"
                    width="40px"
                    height="40px"
                  />
                </div>
                <Typography className="text-sm">{NETWORK_LABEL[key]}</Typography>
              </button>
            ))}
          </div>
        </div>
      </HeadlessUIModal.Controlled>
      {children}
    </>
  )
}

const NetworkGuard = (networks: ChainId[]) => {
  return ({ children }) => <Component networks={networks}>{children}</Component>
}

export default NetworkGuard
