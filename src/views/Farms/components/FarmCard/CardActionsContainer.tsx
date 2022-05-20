import React from 'react'
import { Text } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from '../../../../components/Toast'
import { useTranslation } from 'react-i18next'
import { useERC20 } from '../../../../hooks/useContract'
import useToast from '../../../../hooks/useToast'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from '../../../../state/farms'
import styled, {useTheme} from 'styled-components'
import { getAddress } from '../../../../utils/addressHelpers'
import { FarmWithStakedValue } from '../types'
import useApproveFarm from '../../hooks/useApproveFarm'
import HarvestAction from './HarvestAction'
import StakeAction from './StakeAction'
import StakeAdd from './StakeAdd'
import BigNumber from 'bignumber.js'
import { ButtonOutlined } from '../../../../components/Button'

const Action = styled.div`
  padding: 0px;
  height: 270px;
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
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { pid, lpAddresses } = farm
  const { allowance, earnings } = farm.userData || {}
  const lpAddress = getAddress(lpAddresses)
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const dispatch = useDispatch()

  const lpContract = useERC20(lpAddress)

  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove()
    })
    if (receipt?.status) {
      toastSuccess(t('Contract Enabled'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }, [onApprove, dispatch, account, pid, t, toastSuccess, fetchWithCatchTxError])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <ActionContainer style={{backgroundColor: theme.cardExpanded}}>
          <Text  fontSize="13px" fontWeight={300}>
            {t('Staked')}
          </Text>
          <StakeAction {...farm} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr} />
        </ActionContainer>
    ) : (
      <ButtonOutlined mt='10px' mb='50px' width="100%" disabled={pendingTx} onClick={handleApprove}>
        {t('Enable Contract')}
      </ButtonOutlined>
    )
  }

  return (
    <Action>
      {allowance <= new BigNumber(0) ? (
        <StakeAdd row={false} width={'70%'} />
      ) : (
        <>
        <ActionContainer style={{backgroundColor: theme.cardExpanded}}>
        <Text fontSize="13px" fontWeight={300}>
          {t('Earned')}
        </Text>
        <HarvestAction earnings={earnings} pid={pid} />
        </ActionContainer>
        </>)}
      {!account ? <p>{'Connect wallet placeholder'}</p> : renderApprovalOrStakeButton()}
    </Action>
  )
}

export default CardActions
