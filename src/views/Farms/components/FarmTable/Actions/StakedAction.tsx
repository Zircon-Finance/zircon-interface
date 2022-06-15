import React, { useState } from 'react'
import { Button, IconButton, Skeleton, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
// import ConnectWalletButton from 'components/ConnectWalletButton'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { useTranslation } from 'react-i18next'

import { useERC20, useSousChef } from '../../../../../hooks/useContract'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
// import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import styled, { useTheme } from 'styled-components'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useUnstakeFarms from '../../../hooks/useUnstakeFarms'
import WithdrawModal from '../../WithdrawModal'
import { ActionContainer, ActionContent, ActionTitles } from './styles'
import StakedLP from '../../StakedLP'
import { MaxUint256 } from '@ethersproject/constants'
import PlusIcon from '../../PlusIcon'
import MinusIcon from '../../MinusIcon'
import BigNumber from 'bignumber.js'
import { useAddPopup } from '../../../../../state/application/hooks'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { ModalTopDeposit } from './ActionPanel'
import Portal from '@reach/portal'
import { ModalContainer } from '../../../Farms'
import { Flex } from 'rebass'
import { DeserializedPool } from '../../../../../state/types'
import { Token } from 'zircon-sdk'
import { usePool } from '../../../../../state/pools/hooks'
import { fetchPoolsUserDataAsync } from '../../../../../state/pools'
import { useCallWithGasPrice } from '../../../../../hooks/useCallWithGasPrice'

const IconButtonWrapper = styled.div`
  display: flex;
  svg {
    border-radius: 100%;
  }
`

interface StackedActionProps extends DeserializedPool {
  userDataReady: boolean
  lpLabel?: string
  displayApr?: string
}

const Staked: React.FunctionComponent<StackedActionProps> = ({
  sousId,
  apr,
  lpLabel,
  contractAddress,
  earningToken,
  stakingToken,
  userDataReady,
  displayApr,
}) => {
  const { t } = useTranslation()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { account } = useWeb3React()
  const { pool } = usePool(sousId)
  const allowance = pool.userData.allowance
  const tokenBalance = pool.userData.stakingTokenBalance
  const stakedBalance = pool.userData.stakedBalance
  const { onStake } = useStakeFarms(sousId)
  const { onUnstake } = useUnstakeFarms(sousId)
  // const router = useRouter()
  const [showModalDeposit, setshowModalDeposit] = useState(false)
  const [showModalWithdraw, setshowModalWithdraw] = useState(false)
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()

  const isApproved = account && allowance && allowance.isGreaterThan(0)

  // const liquidityUrlPathParts = 'placeholder'
  // getLiquidityUrlPathParts({
  //   quoteTokenAddress: quoteToken.address,
  //   tokenAddress: token.address,
  // })
  // `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`

  const handleStake = async (amount: string, token: Token) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount, token.decimals).then((response) => {
        addTransaction(response, {
          summary: `Stake ${earningToken.symbol}-${stakingToken.symbol} tokens`
        })
        return response
      })
    })
    if (receipt?.status) {
      addPopup(
        {
          txn: {
            hash: receipt.transactionHash,
            success: receipt.status === 1,
            summary: 'Stake '+amount+' '+earningToken.symbol+"-"+stakingToken.symbol+' LP to farm',
          }
        },
        receipt.transactionHash
      )  
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }

  const handleUnstake = async (amount: string, token: Token) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onUnstake(amount, token.decimals).then((response) => {
        addTransaction(response, {
          summary: 'Unstake '+ amount+ ' ' + earningToken.symbol+ "-" +stakingToken.symbol+' tokens'
        })
        return response
      })
    })
    if (receipt?.status) {
      addPopup(
        {
          txn: {
            hash: receipt.transactionHash,
            success: receipt.status === 1,
            summary: 'Removed '+amount+' '+earningToken.symbol+"-"+stakingToken.symbol+' LP from farm',
          }
        },
        receipt.transactionHash
      )  
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }
  const lpContract = useERC20(contractAddress)
  const dispatch = useDispatch()
  const sousChefContract = useSousChef(sousId)
  const { callWithGasPrice } = useCallWithGasPrice()

  const handleApproval = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256]).then(response => {
        addTransaction(response, {
          summary:  `Enable ${pool.token1.symbol}-${pool.token2.symbol} stake contract`
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
    }
  }, [ 
      dispatch, 
      account, 
      addPopup, 
      fetchWithCatchTxError, 
      addTransaction, 
      lpContract,
      sousChefContract.address,
      callWithGasPrice,
      pool.token1.symbol,
      pool.token2.symbol
    ])

  const theme = useTheme()

  if (!account) {
    return (
      <ActionContainer style={{background: theme.farmPoolCardsBg}}>
        <ActionTitles>
          <Text fontSize="13px">
            {t('Start Farming')}
          </Text>
        </ActionTitles>
        <ActionContent>
          {/* <ConnectWalletButton width="100%" /> */}
        </ActionContent>
      </ActionContainer>
    )
  }

  if (isApproved) {
    if (stakedBalance.gt(0)) {
      return (
        <>
        
        {showModalDeposit &&
        <ModalTopDeposit
        max={tokenBalance }
        lpLabel={'lpLabel'}
        apr = {apr}
        onDismiss = {() => setshowModalDeposit(false)}
        displayApr = '1'
        stakedBalance = {stakedBalance}
        onConfirm = {handleStake}
        tokenName = {earningToken.name}
        addLiquidityUrl = {`#/add-pro/${earningToken.address}/${stakingToken.address}`}
        cakePrice = {1 as unknown as BigNumber}
        token = {earningToken}
        />
        }

        {showModalWithdraw &&
        <Portal>
          <ModalContainer>
            <WithdrawModal 
            max={stakedBalance} 
            onConfirm={handleUnstake} 
            tokenName={pool.stakingToken.symbol} 
            onDismiss={()=>setshowModalWithdraw(false)} 
            token={pool.stakingToken} />
          </ModalContainer>
        </Portal>
          
        }
        <ActionContainer style={{background: theme.farmPoolCardsBg}}>
          <ActionTitles>
            <Text color={theme.text1} fontSize="13px">
              {t('Staked')}
            </Text>
          </ActionTitles>
          <ActionContent>
            <StakedLP
              stakedBalance={stakedBalance}
              lpSymbol={pool.token1.symbol+'-'+pool.token2.symbol}
              quoteTokenSymbol={pool.earningToken.symbol}
              tokenSymbol={pool.stakingToken.symbol}
              lpTotalSupply={1 as unknown as BigNumber}
              tokenAmountTotal={1 as unknown as BigNumber}
              quoteTokenAmountTotal={1 as unknown as BigNumber}
            />
            <IconButtonWrapper>
            <IconButton 
              style={{background: theme.poolPinkButton, width: '29px', height: '28px', borderRadius: '100%', marginRight: '5px'}} 
              variant="tertiary" 
              onClick={()=>setshowModalWithdraw(true)} mr="6px">
              <Flex>
                <MinusIcon />
              </Flex>
            </IconButton>
              <IconButton
                style={{background: theme.poolPinkButton, width: '29px', height: '28px', borderRadius: '100%'}} 
                variant="tertiary"
                onClick={()=>{setshowModalDeposit(true)}}
                disabled={['history', 'archived'].some((item) => window.location.pathname.includes(item))}
              >
                <Flex>
                  <PlusIcon />
                </Flex>
              </IconButton>
            </IconButtonWrapper>
          </ActionContent>
        </ActionContainer>
        </>
      )
    }

    return (
      <ActionContainer style={{background: theme.farmPoolCardsBg}}>
        <ActionTitles>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px" pr="4px">
            {t('Stake')}
          </Text>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px">
            {'lpSymbol'}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Button
            width="100%"
            onClick={()=>{setshowModalDeposit(true)}}
            variant="secondary"
            disabled={['history', 'archived'].some((item) => window.location.pathname.includes(item))}
          >
            {t('Stake LP')}
          </Button>
        </ActionContent>
      </ActionContainer>
    )
  }

  if (!userDataReady) {
    return (
      <ActionContainer style={{background: theme.farmPoolCardsBg}}>
        <ActionTitles>
          <Text fontSize="13px">
            {t('Start Farming')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Skeleton width={180} marginBottom={28} marginTop={14} />
        </ActionContent>
      </ActionContainer>
    )
  }

  return (
    <ActionContainer style={{background: theme.bg6}}>
      <ActionTitles>
        <Text fontSize="13px">
          {t('Enable Farm')}
        </Text>
      </ActionTitles>
      <ActionContent>
        <Button style={{backgroundColor: theme.questionMarks, boxShadow: 'none'}} width="100%" disabled={pendingTx} onClick={handleApproval} variant="primary">
          {t('Enable')}
        </Button>
      </ActionContent>
    </ActionContainer>
  )
}

export default Staked
