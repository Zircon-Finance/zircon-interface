import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import styled, { useTheme } from 'styled-components'
import { Flex, IconButton } from '@pancakeswap/uikit'
import useCatchTxError from '../../../../hooks/useCatchTxError'

import { useDispatch } from 'react-redux'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'
import useUnstakeFarms from '../../hooks/useUnstakeFarms'
import useStakeFarms from '../../hooks/useStakeFarms'
import StakedLP from '../StakedLP'
import MinusIcon from '../MinusIcon'
import PlusIcon from '../PlusIcon'
import { useAddPopup } from '../../../../state/application/hooks'
import { ModalContainer } from '../../Farms'
import StakeAdd from './StakeAdd'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { usePool } from '../../../../state/pools/hooks'
import { DeserializedPool } from '../../../../state/types'
import { fetchPoolsUserDataAsync } from '../../../../state/pools'
import BigNumber from 'bignumber.js'

interface FarmCardActionsProps extends DeserializedPool {
  lpLabel?: string
  addLiquidityUrl?: string
  displayApr?: string
}

const IconButtonWrapper = styled.div`
  display: flex;
`

const StakeAction: React.FC<FarmCardActionsProps> = ({
  token1,
  token2,
  earningToken,
  stakingToken,
  sousId,
  apr,
  displayApr,
  addLiquidityUrl,
  lpLabel,
}) => {
  const { onStake } = useStakeFarms(sousId)
  const { onUnstake } = useUnstakeFarms(sousId)
  const { pool } = usePool(sousId)
  const tokenBalance = pool.userData.stakingTokenBalance
  const stakedBalance = pool.userData.stakedBalance
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const { fetchWithCatchTxError } = useCatchTxError()
  const addPopup = useAddPopup()
  const [showModalDeposit, setShowModalDeposit] = useState(false)
  const [showModalWithdraw, setShowModalWithdraw] = useState(false)
  const addTransaction = useTransactionAdder()

  const handleStake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount, pool.stakingToken.decimals).then((response) => {
        addTransaction(response, {
          summary: `Stake ${token1.symbol}-${token2.symbol} LP tokens`
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
            summary: 'Stake succesful'
          }
        },
        receipt.transactionHash
      )
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }

  const handleUnstake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onUnstake(amount, earningToken.decimals).then((response) => {
        addTransaction(response, {
          summary: 'Unstake '+ amount+ ' ' + earningToken.symbol+ "-" +stakingToken.symbol+' tokens'
        })
        return response
      })
    })
    if (receipt?.status) {
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }
  const theme = useTheme()

  const renderStakingButtons = () => {
    return stakedBalance.eq(0) ? (
      <StakeAdd row={true} />
    ) : (
      <IconButtonWrapper>
        <IconButton 
        style={{background: theme.poolPinkButton, width: '29px', height: '28px', borderRadius: '100%', marginRight: '5px'}} 
        variant="tertiary" onClick={()=>setShowModalWithdraw(true)} mr="6px">
          <MinusIcon />
        </IconButton>
        <IconButton
          style={{background: theme.poolPinkButton, width: '29px', height: '28px', borderRadius: '100%', marginRight: '5px'}} 
          variant="tertiary"
          onClick={()=>setShowModalDeposit(true)}
          disabled={['history', 'archived'].some((item) => window.location.pathname.includes(item))}
        >
          <PlusIcon/>
        </IconButton>
      </IconButtonWrapper>
    )
  }

  return (
    <>
        {(showModalDeposit || showModalWithdraw) && 
          <ModalContainer>
        
        {showModalDeposit &&
          <DepositModal
          max={tokenBalance}
          lpLabel={lpLabel}
          apr={apr}
          onDismiss={() => setShowModalDeposit(false)}
          displayApr={'111'}
          stakedBalance={stakedBalance}
          onConfirm={handleStake}
          tokenName={'lpSymbol'}
          addLiquidityUrl={'#/add-pro/'+earningToken.address+'/'+stakingToken.address}
          token={earningToken}
          />
        }

        {showModalWithdraw &&
          <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={'lpSymbol'} onDismiss={()=>setShowModalWithdraw(false)} token={earningToken} />
        }
        </ModalContainer>
        }
    <Flex justifyContent="space-between" alignItems="center">
      <StakedLP
        stakedBalance={stakedBalance}
        lpSymbol={'lpSymbol'}
        quoteTokenSymbol={stakingToken.symbol}
        tokenSymbol={earningToken.symbol}
        lpTotalSupply={10000000000000000000 as unknown as BigNumber}
        tokenAmountTotal={100 as unknown as BigNumber}
        quoteTokenAmountTotal={1 as unknown as BigNumber}
      />
      {renderStakingButtons()}
    </Flex>
    </>
  )
}

export default StakeAction
