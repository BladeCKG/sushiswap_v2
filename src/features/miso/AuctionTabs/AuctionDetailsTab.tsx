import { DocumentDuplicateIcon } from '@heroicons/react/outline'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Token } from '@sushiswap/core-sdk'
import Typography from 'app/components/Typography'
import { Auction } from 'app/features/miso/context/Auction'
import { classNames, shortenAddress } from 'app/functions'
import { useTotalSupply } from 'app/hooks/useTotalSupply'
import { FC } from 'react'

interface AuctionDetailsTabStatProps {
  label: string
  value?: any
}

const AuctionDetailsTabStat: FC<AuctionDetailsTabStatProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1">
      <Typography className="text-secondary">{label}</Typography>
      <Typography weight={700} className="text-high-emphesis">
        {value}
      </Typography>
    </div>
  )
}

interface AuctionDetailsTabProps {
  auction: Auction<Token, Token>
  active: boolean
}

const AuctionDetailsTab: FC<AuctionDetailsTabProps> = ({ auction, active }) => {
  const { i18n } = useLingui()
  const totalSupply = useTotalSupply(auction.auctionToken)

  return (
    <div className={classNames(active ? 'block' : 'hidden', 'grid grid-cols-2 gap-6')}>
      <AuctionDetailsTabStat
        label={i18n._(t`Token Address`)}
        value={
          <div className="flex gap-2 items-center">
            {shortenAddress(auction.auctionToken.address)}
            <DocumentDuplicateIcon width={20} />
          </div>
        }
      />
      <AuctionDetailsTabStat
        label={i18n._(t`Auction Address`)}
        value={
          <div className="flex gap-2 items-center">
            {shortenAddress(auction.auctionInfo.addr)}
            <DocumentDuplicateIcon width={20} />
          </div>
        }
      />
      <AuctionDetailsTabStat
        label={i18n._(t`Tokens Available For Sale`)}
        value={
          <div className="flex gap-1">
            {auction.totalTokens?.toSignificant(6)}{' '}
            <Typography variant="sm" weight={700}>
              {auction.totalTokens?.currency.symbol}
            </Typography>
          </div>
        }
      />
      <AuctionDetailsTabStat
        label={i18n._(t`Total Token Supply`)}
        value={
          <div className="flex gap-1">
            {totalSupply?.toSignificant(6)}{' '}
            <Typography variant="sm" weight={700}>
              {totalSupply?.currency.symbol}
            </Typography>
          </div>
        }
      />
      {auction.minimumPrice && (
        <AuctionDetailsTabStat
          label={i18n._(t`Minimum Price`)}
          value={
            <div className="flex gap-1">
              {auction.minimumPrice.toSignificant(6)}{' '}
              <Typography variant="sm" weight={700}>
                {auction.minimumPrice.quoteCurrency.symbol}
              </Typography>
            </div>
          }
        />
      )}
      {auction.startPrice && (
        <AuctionDetailsTabStat
          label={i18n._(t`Maximum Price`)}
          value={
            <div className="flex gap-1">
              {auction.startPrice.toSignificant(6)}{' '}
              <Typography variant="sm" weight={700}>
                {auction.startPrice.quoteCurrency.symbol}
              </Typography>
            </div>
          }
        />
      )}
      {auction.minimumTargetRaised && (
        <AuctionDetailsTabStat
          label={i18n._(t`Minimum Raised Target`)}
          value={
            <div className="flex gap-1">
              {auction.minimumTargetRaised.toSignificant(6)}{' '}
              <Typography variant="sm" weight={700}>
                {auction.minimumTargetRaised.currency.symbol}
              </Typography>
            </div>
          }
        />
      )}
      {auction.maximumTargetRaised && (
        <AuctionDetailsTabStat
          label={i18n._(t`Maximum Raised Target`)}
          value={
            <div className="flex gap-1">
              {auction.maximumTargetRaised.toSignificant(6)}{' '}
              <Typography variant="sm" weight={700}>
                {auction.maximumTargetRaised.currency.symbol}
              </Typography>
            </div>
          }
        />
      )}
      {auction.auctionInfo.startTime && (
        <AuctionDetailsTabStat
          label={i18n._(t`Auction Starts On`)}
          value={
            <>
              {new Date(auction.auctionInfo.endTime.mul('1000').toNumber()).toLocaleString('en-uS', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                timeZone: 'UTC',
              })}{' '}
              UTC
            </>
          }
        />
      )}
      {auction.auctionInfo.endTime && (
        <AuctionDetailsTabStat
          label={i18n._(t`Auction Ends On`)}
          value={
            <>
              {new Date(auction.auctionInfo.endTime.mul('1000').toNumber()).toLocaleString('en-uS', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                timeZone: 'UTC',
              })}{' '}
              UTC
            </>
          }
        />
      )}
    </div>
  )
}

export default AuctionDetailsTab
