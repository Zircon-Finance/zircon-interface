import React from 'react'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { useERC20, useSousChef } from '../../../../hooks/useContract'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { MaxUint256 } from '@ethersproject/constants'
import styled, {useTheme} from 'styled-components'
import HarvestAction from './HarvestAction'
import StakeAction from './StakeAction'
import BigNumber from 'bignumber.js'
import { ButtonPinkGamma } from '../../../../components/Button'
import { useAddPopup, useWalletModalToggle } from '../../../../state/application/hooks'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { DeserializedPool } from '../../../../state/types'
import { fetchPoolsUserDataAsync, updateUserAllowance } from '../../../../state/pools'
import { useCallWithGasPrice } from '../../../../hooks/useCallWithGasPrice'
import { usePools } from '../../../../state/pools/hooks'

const Action = styled.div`
  padding: 0px;
  min-height: 245px;
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
  .swiper {
    max-width: 100%;
  }
  .swiper-pagination-bullet {
    display: none;
  }
  .swiper-slide {
    border-right: 1px solid rgba(255,255,255,0.1);
    text-align: center;
  }
`

interface FarmCardActionsProps {
  farm: DeserializedPool
  account?: string
  addLiquidityUrl?: string
  lpLabel?: string
  displayApr?: string
}

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, account, addLiquidityUrl, lpLabel, displayApr }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { sousId, stakingToken } = farm
  const { allowance } = farm.userData || {}
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const toggleWalletModal = useWalletModalToggle()
  const sousChefContract = useSousChef(sousId)
  const { callWithGasPrice } = useCallWithGasPrice()
  const { userDataLoaded } = usePools()
  const userDataReady = !!account || (!!account && !userDataLoaded)

  

  const lpContract = useERC20(stakingToken.address)

  const handleApproval = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256]).then(response => {
        addTransaction(response, {
          summary:  `Enable ${farm.token1.symbol}-${farm.token2.symbol} stake contract`
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
      dispatch(fetchPoolsUserDataAsync(account))
      dispatch(updateUserAllowance({ sousId, account }))
    }
  }, [ 
      dispatch, 
      account, 
      sousId, 
      fetchWithCatchTxError, 
      addPopup, 
      addTransaction, 
      lpContract,
      callWithGasPrice,
      farm.token1.symbol,
      farm.token2.symbol,
      sousChefContract.address,
    ])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <ActionContainer style={{backgroundColor: theme.farmPoolCardsBg}}>
          <Text  fontSize="13px" fontWeight={300} color={theme.text1}>
            {t('Staked')}
          </Text>
          <StakeAction {...farm} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr} />
        </ActionContainer>
    ) : (
      <ButtonPinkGamma width="100%" disabled={pendingTx || farm.isFinished} onClick={account ? handleApproval : toggleWalletModal}>
        {account ? 'Enable Contract' : 'Connect Wallet'}
      </ButtonPinkGamma>
    )
  }

  return (
    <Action>
      {allowance <= new BigNumber(0) ? (
        <span/>
      ) : (
        <>
        <ActionContainer style={{backgroundColor: theme.farmPoolCardsBg}}>
        <HarvestAction {...farm} userDataReady={userDataReady} />
        </ActionContainer>
        </>)}
      {!account ? 
      <ButtonPinkGamma m="auto" width="100%" disabled={pendingTx} onClick={toggleWalletModal}>
        {'Connect Wallet'}
      </ButtonPinkGamma>
       : renderApprovalOrStakeButton()}
    </Action>
  )
}

export default CardActions
