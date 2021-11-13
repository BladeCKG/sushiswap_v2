import { Currency } from '@sushiswap/core-sdk'
import classNames from 'classnames'
import Typography from 'components/Typography'
import { formatPercent } from 'functions'
import Link from 'next/link'
import { FC, useMemo } from 'react'
import { ChevronRight } from 'react-feather'
import { useRecoilValue } from 'recoil'

import { poolAtom } from './context/atoms'
import useCurrenciesFromURL from './context/hooks/useCurrenciesFromURL'
import { PoolUnion } from './types'

export type BreadcrumbTuple = { link?: string; label: string }
export type BreadcrumbItem =
  | ((currencies: (Currency | undefined)[], pool?: PoolUnion) => BreadcrumbTuple)
  | BreadcrumbTuple

export const BREADCRUMBS: Record<string, BreadcrumbItem> = {
  pools: { link: '/trident/pools', label: 'Pools' },
  add_classic: ([a, b]) => ({
    link: `/trident/add/classic/${a ? a.symbol : ''}/${b ? b.symbol : ''}`,
    label: `Add Liquidity`,
  }),
  remove_classic: ([a, b]) => ({
    link: `/trident/add/classic/${a ? a.symbol : ''}/${b ? b.symbol : ''}`,
    label: `Remove Liquidity`,
  }),
  pool_classic: ([a, b], pool) => ({
    link: `/trident/pool/classic/${a ? a.symbol : ''}/${b ? b.symbol : ''}`,
    label: pool
      ? `${pool.token0.symbol}-${pool.token1.symbol} - Classic - ${formatPercent(pool.fee.valueOf() / 100)}`
      : 'Pool not found',
  }),
}

interface BreadcrumbProps {
  breadcrumbs: BreadcrumbItem[]
}

const Breadcrumb: FC<BreadcrumbProps> = ({ breadcrumbs }) => {
  const { pool } = useRecoilValue(poolAtom)
  const { currencies } = useCurrenciesFromURL()

  const formatted = useMemo(() => {
    return breadcrumbs.map((el) => {
      if (typeof el === 'function') {
        return el(currencies, pool)
      }

      return el
    }) as BreadcrumbTuple[]
  }, [breadcrumbs, currencies, pool])

  return (
    <div className="flex w-full px-6 py-2 border-b border-dark-900 bg-gradient-to-r from-transparent-blue to-transparent-pink">
      {formatted
        .map(({ label, link }, index) => (
          <Typography
            variant="xs"
            weight={400}
            key={label}
            className={classNames(
              'capitalize',
              index === breadcrumbs.length - 1 ? 'text-high-emphesis' : 'text-secondary'
            )}
          >
            {link ? <Link href={link}>{label}</Link> : label}
          </Typography>
        ))
        .reduce(
          (acc, x) =>
            acc === null ? (
              x
            ) : (
              <>
                {acc}{' '}
                <div className="px-1 text-secondary flex flex-col justify-center">
                  <ChevronRight width={12} height={12} strokeWidth={4} />
                </div>{' '}
                {x}
              </>
            ),
          null
        )}
    </div>
  )
}

export default Breadcrumb
