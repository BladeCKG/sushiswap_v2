import { t } from '@lingui/macro'
import { Trans, useLingui } from '@lingui/react'
import Form from 'app/components/Form'
import FormFieldHelperText from 'app/components/Form/FormFieldHelperText'
import AuctionPaymentCurrencyField from 'app/features/miso/AuctionAdminForm/AuctionPaymentCurrencyField'
import { AuctionCreationFormInput } from 'app/features/miso/AuctionCreationForm'
import AuctionCreationFormTokenAmount from 'app/features/miso/AuctionCreationForm/AuctionCreationFormGeneralDetails/AuctionCreationFormTokenAmount'
import { AuctionTemplate } from 'app/features/miso/context/types'
import { useActiveWeb3React } from 'app/services/web3'
import React, { FC, Fragment } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import AuctionCreationFormBatchAuction from './AuctionCreationFormBatchAuction'
import AuctionCreationFormCrowdsale from './AuctionCreationFormCrowdsale'
import AuctionCreationFormDutchAuction from './AuctionCreationFormDutchAuction'

interface AuctionCreationFormGeneralDetailsProps {}

const AuctionCreationFormGeneralDetails: FC<AuctionCreationFormGeneralDetailsProps> = () => {
  const { account } = useActiveWeb3React()
  const { i18n } = useLingui()
  const auctionType = useWatch({ name: 'auctionType' })
  const { setValue } = useFormContext<AuctionCreationFormInput>()

  let formSection
  if (auctionType === AuctionTemplate.DUTCH_AUCTION) {
    formSection = <AuctionCreationFormDutchAuction />
  }

  if (auctionType === AuctionTemplate.BATCH_AUCTION) {
    formSection = <AuctionCreationFormBatchAuction />
  }

  if (auctionType === AuctionTemplate.CROWDSALE) {
    formSection = <AuctionCreationFormCrowdsale />
  }

  if (!formSection) throw new Error('Template unknown')

  const link = (
    <a href={'/miso/token'} target="_blank" className="text-blue underline" rel="noreferrer">
      {i18n._(t`Create it now`)}
    </a>
  )

  return (
    <>
      <Form.Section
        columns={4}
        className="pt-8"
        header={
          <Form.Section.Header
            header={i18n._(t`General Details`)}
            subheader={i18n._(t`Set up required auction parameters`)}
          />
        }
      >
        <div className="col-span-4 lg:col-span-2">
          <Form.TextField
            name="token"
            label={i18n._(t`Token*`)}
            helperText={
              <FormFieldHelperText>
                <Trans id="Don’t have a token? {link}" values={{ link }} components={Fragment} />
              </FormFieldHelperText>
            }
            placeholder={i18n._(t`Search by symbol or Enter the address of the token you would like to auction.`)}
          />
        </div>
        <AuctionCreationFormTokenAmount />
        <div className="col-span-4">
          <AuctionPaymentCurrencyField name="paymentCurrencyAddress" label={i18n._(t`Auction Payment Currency*`)} />
        </div>
        <div className="col-span-4">
          <Form.TextField
            name="fundWallet"
            label={i18n._(t`Fund Wallet*`)}
            placeholder={i18n._(t`Enter the wallet address where raised funds will be sent to`)}
            helperText={
              <FormFieldHelperText
                className="underline cursor-pointer"
                onClick={() => setValue('fundWallet', account || '')}
              >
                {i18n._(t`Use my address`)}
              </FormFieldHelperText>
            }
          />
        </div>
        <div className="col-span-4 md:col-span-2 xl:col-span-1">
          <Form.TextField
            className="inline-flex"
            type="datetime-local"
            name="startDate"
            label={i18n._(t`Start Date*`)}
            placeholder={i18n._(t`Selected a start date for your auction`)}
            helperText={i18n._(t`Please enter your auction start date`)}
          />
        </div>
        <div className="col-span-4 md:col-span-2 xl:col-span-1">
          <Form.TextField
            className="inline-flex"
            type="datetime-local"
            name="endDate"
            label={i18n._(t`End Date*`)}
            placeholder={i18n._(t`Selected an end date for your auction`)}
            helperText={i18n._(t`Please enter your auction end date`)}
          />
        </div>
      </Form.Section>
      {formSection}
    </>
  )
}

export default AuctionCreationFormGeneralDetails
