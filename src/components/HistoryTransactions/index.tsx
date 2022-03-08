import React, { useRef, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { AutoColumn } from '../Column'
import { useSettingsTransactionsOpen, useToggleTransactionsMenu } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import HistoryIcon from '../HistoryIcon'
import { TransactionDetails } from '../../state/transactions/reducer'
import Transaction from '../AccountDetails/Transaction'
import { AutoRow } from '../Row'
import { TYPE } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { clearAllTransactions } from '../../state/transactions/actions'
import { ButtonPositionsMobile } from '../Button'

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.bg1};
  margin-right: 10px;
  height: 100%;
  padding: 5px 10px;
  border-radius: 11px;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg9};
  }

  svg {
    margin-top: 2px;
  }
`

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: max-content;
  background-color: ${({ theme }) => theme.bg14};
  border-radius: 20px;
  box-shadow: 0px 0px 30px rgba(34, 18, 55, 0.5);
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 60px;
  left: -270px;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 18.125rem;
  `};
`

const LowerSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  padding: 1.5rem;
  flex-grow: 1;
  overflow: auto;
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 20px;

  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.text3};
  }
`

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`

function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

function renderTransactions(transactions: string[]) {
  return (
    <TransactionListWrapper>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />
      })}
    </TransactionListWrapper>
  )
}



export default function HistoryTransactions() {
  const node = useRef<HTMLDivElement>()
  const open = useSettingsTransactionsOpen()
  const toggle = useToggleTransactionsMenu()

  const dispatch = useDispatch<AppDispatch>()

  const { chainId } = useActiveWeb3React()

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  useOnClickOutside(node, open ? toggle : undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pendingTransactions = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmedTransactions = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  return (
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <HistoryIcon />
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="sm" style={{padding: '5px'}} >
          {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <AutoRow mb={'1rem'} style={{ justifyContent: 'space-between' }}>
            <TYPE.body>Recent Transactions</TYPE.body>
            <ButtonPositionsMobile style={{width: 'auto', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', padding: '9px 12px 10px'}} 
              onClick={clearAllTransactionsCallback}>Clear all
            </ButtonPositionsMobile>
          </AutoRow>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)}
        </LowerSection>
      ) : (
        <LowerSection>
          <TYPE.body color={'white'}>Your transactions will appear here...</TYPE.body>
        </LowerSection>
      )}
            

          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
