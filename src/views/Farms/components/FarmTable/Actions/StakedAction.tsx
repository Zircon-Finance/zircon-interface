import React, { useState } from 'react'
import { Button, IconButton, Skeleton, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
// import ConnectWalletButton from 'components/ConnectWalletButton'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { useTranslation } from 'react-i18next'

import { useERC20 } from '../../../../../hooks/useContract'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
// import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from '../../../../../state/farms'
import { useFarmUser, useLpTokenPrice } from '../../../../../state/farms/hooks'
import styled, { useTheme } from 'styled-components'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import useApproveFarm from '../../../hooks/useApproveFarm'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useUnstakeFarms from '../../../hooks/useUnstakeFarms'
import WithdrawModal from '../../WithdrawModal'
import { ActionContainer, ActionContent, ActionTitles } from './styles'
import { FarmWithStakedValue } from '../../types'
import StakedLP from '../../StakedLP'
import PlusIcon from '../../PlusIcon'
import MinusIcon from '../../MinusIcon'
import BigNumber from 'bignumber.js'
import { useAddPopup } from '../../../../../state/application/hooks'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { modalTopDeposit } from './ActionPanel'
import Portal from '@reach/portal'
import { ModalContainer } from '../../../Farms'

const IconButtonWrapper = styled.div`
  display: flex;
  svg {
    background: ${({ theme }) => theme.questionMarks};
    border-radius: 100%;
  }
`

interface StackedActionProps extends FarmWithStakedValue {
  userDataReady: boolean
  lpLabel?: string
  displayApr?: string
}

const Staked: React.FunctionComponent<StackedActionProps> = ({
  pid,
  apr,
  multiplier,
  lpSymbol,
  lpLabel,
  lpAddress,
  quoteToken,
  token,
  userDataReady,
  displayApr,
  lpTotalSupply,
  tokenAmountTotal,
  quoteTokenAmountTotal,
}) => {
  const { t } = useTranslation()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { account } = useWeb3React()
  const { allowance, tokenBalance, stakedBalance } = useFarmUser(pid)
  const { onStake } = useStakeFarms(pid)
  const { onUnstake } = useUnstakeFarms(pid)
  // const router = useRouter()
  const lpPrice = useLpTokenPrice(lpSymbol)
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

  const handleStake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount).then((response) => {
        addTransaction(response, {
          summary: `Stake ${token.symbol}-${quoteToken.symbol} tokens`
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
            summary: 'Stake '+amount+' '+token.symbol+"-"+quoteToken.symbol+' LP to farm',
          }
        },
        receipt.transactionHash
      )  
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }

  const handleUnstake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onUnstake(amount).then((response) => {
        addTransaction(response, {
          summary: 'Unstake '+ amount+ ' ' + token.symbol+ "-" +quoteToken.symbol+' tokens'
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
            summary: 'Removed '+amount+' '+token.symbol+"-"+quoteToken.symbol+' LP from farm',
          }
        },
        receipt.transactionHash
      )  
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }
  const lpContract = useERC20(lpAddress)
  const dispatch = useDispatch()
  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove().then(response => {
        addTransaction(response, {
          summary: `Enable ${token.symbol}-${quoteToken.symbol} stake contract`
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
  }, [onApprove, dispatch, account, pid, addPopup, fetchWithCatchTxError, addTransaction, token.symbol, quoteToken.symbol])
  const theme = useTheme()

  if (!account) {
    return (
      <ActionContainer style={{background: theme.bg6}}>
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
        modalTopDeposit(tokenBalance, lpPrice, lpLabel, apr, () => setshowModalDeposit(false), '1', stakedBalance, handleStake, lpSymbol, multiplier, 
        `#/add-pro/${token.address}/${quoteToken.address}`,1 as unknown as BigNumber)
        }

        {showModalWithdraw &&
        <Portal>
          <ModalContainer>
            <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={lpSymbol} onDismiss={()=>setshowModalWithdraw(false)} />
          </ModalContainer>
        </Portal>
          
        }
        <ActionContainer style={{background: theme.bg6}}>
          <ActionTitles>
            <Text color={theme.text1} fontSize="13px">
              {t('Staked')}
            </Text>
          </ActionTitles>
          <ActionContent>
            <StakedLP
              stakedBalance={stakedBalance}
              lpSymbol={lpSymbol}
              quoteTokenSymbol={quoteToken.symbol}
              tokenSymbol={token.symbol}
              lpTotalSupply={lpTotalSupply}
              tokenAmountTotal={tokenAmountTotal}
              quoteTokenAmountTotal={quoteTokenAmountTotal}
            />
            <IconButtonWrapper>
            <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary" onClick={()=>setshowModalWithdraw(true)} mr="6px">
              <MinusIcon />
            </IconButton>
              <IconButton
                style={{background: 'transparent', width: 'auto', border:'none'}} 
                variant="secondary"
                onClick={()=>{setshowModalDeposit(true)}}
                disabled={['history', 'archived'].some((item) => window.location.pathname.includes(item))}
              >
                <PlusIcon/>
              </IconButton>
            </IconButtonWrapper>
          </ActionContent>
        </ActionContainer>
        </>
      )
    }

    return (
      <ActionContainer style={{background: theme.bg6}}>
        <ActionTitles>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px" pr="4px">
            {t('Stake')}
          </Text>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px">
            {lpSymbol}
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
      <ActionContainer style={{background: theme.bg6}}>
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
        <Button style={{backgroundColor: theme.questionMarks, boxShadow: 'none'}} width="100%" disabled={pendingTx} onClick={handleApprove} variant="primary">
          {t('Enable')}
        </Button>
      </ActionContent>
    </ActionContainer>
  )
}

export default Staked
