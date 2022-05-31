import React from 'react'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { useERC20 } from '../../../../hooks/useContract'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from '../../../../state/farms'
import styled, {useTheme} from 'styled-components'
import { FarmWithStakedValue } from '../types'
import useApproveFarm from '../../hooks/useApproveFarm'
import HarvestAction from './HarvestAction'
import StakeAction from './StakeAction'
import StakeAdd from './StakeAdd'
import BigNumber from 'bignumber.js'
import { ButtonOutlined } from '../../../../components/Button'
import { useAddPopup, useWalletModalToggle } from '../../../../state/application/hooks'
import { useTransactionAdder } from '../../../../state/transactions/hooks'

const Action = styled.div`
  padding: 0px;
  height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 7px;
  margin-bottom: 10px;
  padding: 10px;
`

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  account?: string
  addLiquidityUrl?: string
  lpLabel?: string
  displayApr?: string
}

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, account, addLiquidityUrl, lpLabel, displayApr }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { pid, lpAddress } = farm
  const { allowance, earnings } = farm.userData || {}
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const toggleWalletModal = useWalletModalToggle()

  const lpContract = useERC20(lpAddress)

  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove().then(response => {
        addTransaction(response, {
          summary:  `Enable ${farm.token.symbol}-${farm.quoteToken.symbol} stake contract`
        })
        return response
      })
    })
    if (receipt?.status) {
      addPopup(
        {
          txn: {
            hash: receipt.transactionHash,
            success: true,
            summary: 'Contract enabled!',
          }
        },
        receipt.transactionHash
      )
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }, [onApprove, dispatch, account, pid, fetchWithCatchTxError, addPopup, addTransaction, farm.quoteToken.symbol, farm.token.symbol])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <ActionContainer style={{backgroundColor: theme.cardExpanded}}>
          <Text  fontSize="13px" fontWeight={300}>
            {t('Staked')}
          </Text>
          <StakeAction {...farm} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr} />
        </ActionContainer>
    ) : (
      <ButtonOutlined mt='10px' mb='50px' width="100%" disabled={pendingTx} onClick={account ? handleApprove : toggleWalletModal}>
        {account ? 'Enable Contract' : 'Connect Wallet'}
      </ButtonOutlined>
    )
  }

  return (
    <Action>
      {allowance <= new BigNumber(0) ? (
        <StakeAdd disabled={!isApproved} row={false} width={'70%'} />
      ) : (
        <>
        <ActionContainer style={{backgroundColor: theme.cardExpanded}}>
        <Text fontSize="13px" fontWeight={300}>
          {t('Earned')}
        </Text>
        <HarvestAction earnings={earnings} pid={pid} />
        </ActionContainer>
        </>)}
      {!account ? 
      <ButtonOutlined m="auto" mb='15px' width="100%" disabled={pendingTx} onClick={toggleWalletModal}>
        {'Connect Wallet'}
      </ButtonOutlined>
       : renderApprovalOrStakeButton()}
    </Action>
  )
}

export default CardActions
