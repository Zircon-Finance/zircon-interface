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
import { useActiveWeb3React } from '../../../../hooks'

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
  margin-bottom: 10px;
  padding: 10px;
  .swiper {
    max-width: 100%;
    margin-left: 0px;
  }
  .swiper-pagination-bullet {
    display: none;
  }
  .swiper-slide {
    width: auto !important;
    padding-right: 10px;
    margin-right: 10px !important;
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
  const {chainId} = useActiveWeb3React()
  const theme = useTheme()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { stakingToken, contractAddress } = farm
  const { allowance } = farm.userData || {}
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const dispatch = useDispatch()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const toggleWalletModal = useWalletModalToggle()
  const sousChefContract = useSousChef(contractAddress)
  const { callWithGasPrice } = useCallWithGasPrice()
  const { pools, userDataLoaded } = usePools()
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
      dispatch(fetchPoolsUserDataAsync({chainId, account, pools}))
      dispatch(updateUserAllowance({ contractAddress, account, chainId, pools }))
    }
  }, [ 
      dispatch, 
      account, 
      contractAddress, 
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
      <ActionContainer style={{borderBottom: `1px solid ${theme.opacitySmall}`}}>
          <Text  fontSize="16px" fontWeight={500} color={theme.text1}>
            {t('STAKED')}
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
        <ActionContainer style={{borderBottom: `1px solid ${theme.opacitySmall}`, borderTop: `1px solid ${theme.opacitySmall}`}}>
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
