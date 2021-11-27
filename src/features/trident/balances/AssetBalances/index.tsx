import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/solid'
import { Currency, CurrencyAmount, NATIVE, Token, ZERO } from '@sushiswap/core-sdk'
import { BentoActionsModal, WalletActionsModal } from 'app/features/trident/balances/ActionsModal'
import { Assets, TableInstance } from 'app/features/trident/balances/AssetBalances/types'
import { useLPTableConfig } from 'app/features/trident/balances/AssetBalances/useLPTableConfig'
import { classNames } from 'app/functions'
import { useLiquidityPositions } from 'app/services/graph'
import { useActiveWeb3React } from 'app/services/web3'
import { useBentoBalances } from 'app/state/bentobox/hooks'
import { useAllTokenBalances, useCurrencyBalance } from 'app/state/wallet/hooks'
import React, { useMemo, useState } from 'react'
import { useFlexLayout, usePagination, useSortBy, useTable } from 'react-table'

import { useTableConfig } from './useTableConfig'

export const LiquidityPositionsBalances = () => {
  const [selected, setSelected] = useState<Currency>()
  const { account, chainId } = useActiveWeb3React()

  // TODO ramin: wait for new agnostic subgraph hooks
  const userPairs = useLiquidityPositions({ user: account ?? undefined, chainId: Number(chainId) })
  const { config } = useLPTableConfig([])

  return <_AssetBalances config={config} onSelect={(currency) => setSelected(currency)} />
}

export const BentoBalances = () => {
  const [selected, setSelected] = useState<Currency>()
  const { chainId } = useActiveWeb3React()
  const bentoBalances = useBentoBalances()
  const balances = useMemo(
    () =>
      chainId
        ? bentoBalances.reduce<Assets[]>((acc, { address, decimals, name, symbol, balance }) => {
            const token = new Token(chainId, address, decimals, symbol, name)
            const cur = CurrencyAmount.fromRawAmount(token, balance)
            if (cur.greaterThan(ZERO)) acc.push({ asset: cur })

            return acc
          }, [])
        : [],
    [bentoBalances, chainId]
  )
  const { config } = useTableConfig(balances)

  return (
    <>
      <_AssetBalances config={config} onSelect={(currency) => setSelected(currency)} />
      <BentoActionsModal currency={selected} onClose={() => setSelected(undefined)} />
    </>
  )
}

export const WalletBalances = () => {
  const [selected, setSelected] = useState<Currency>()
  const { chainId, account } = useActiveWeb3React()
  const _balances = useAllTokenBalances()
  const ethBalance = useCurrencyBalance(account ? account : undefined, chainId ? NATIVE[chainId] : undefined)
  const balances = useMemo(() => {
    const res = Object.values(_balances).reduce<Assets[]>((acc, cur) => {
      if (cur.greaterThan(ZERO)) acc.push({ asset: cur })

      return acc
    }, [])

    if (ethBalance) {
      res.push({ asset: ethBalance })
    }
    return res
  }, [_balances, ethBalance])
  const { config } = useTableConfig(balances)

  return (
    <>
      <_AssetBalances config={config} onSelect={(currency) => setSelected(currency)} />
      <WalletActionsModal currency={selected} onClose={() => setSelected(undefined)} />
    </>
  )
}

const _AssetBalances = ({ config, onSelect }) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page }: TableInstance = useTable(
    config,
    useSortBy,
    usePagination,
    useFlexLayout
  )

  return (
    <>
      <table {...getTableProps()} className="w-full">
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={i}>
              {headerGroup.headers.map((column, i) => (
                <th
                  key={i}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={classNames(column.className, `font-normal`)}
                >
                  {column.render('Header')}
                  <span className="inline-block ml-1 align-middle">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <ArrowDownIcon width={12} />
                      ) : (
                        <ArrowUpIcon width={12} />
                      )
                    ) : (
                      ''
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr
                {...row.getRowProps()}
                key={i}
                onClick={() => onSelect(row.values.asset.currency)}
                className="cursor-pointer"
              >
                {row.cells.map((cell, i) => {
                  return (
                    <td key={i} {...cell.getCellProps()} className="py-4 flex items-center">
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
