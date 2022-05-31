import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { Flex, IconButton } from '@pancakeswap/uikit'
import useCatchTxError from '../../../../hooks/useCatchTxError'

import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from '../../../../state/farms'
import { useLpTokenPrice, useFarmUser, usePriceCakeBusd } from '../../../../state/farms/hooks'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'
import useUnstakeFarms from '../../hooks/useUnstakeFarms'
import useStakeFarms from '../../hooks/useStakeFarms'
import { FarmWithStakedValue } from '../types'
import StakedLP from '../StakedLP'
import MinusIcon from '../MinusIcon'
import PlusIcon from '../PlusIcon'
import { useAddPopup } from '../../../../state/application/hooks'
import { ModalContainer } from '../../Farms'
import StakeAdd from './StakeAdd'
import { useTransactionAdder } from '../../../../state/transactions/hooks'

interface FarmCardActionsProps extends FarmWithStakedValue {
  lpLabel?: string
  addLiquidityUrl?: string
  displayApr?: string
}

const IconButtonWrapper = styled.div`
  display: flex;
`

const StakeAction: React.FC<FarmCardActionsProps> = ({
  quoteToken,
  token,
  lpSymbol,
  pid,
  multiplier,
  apr,
  displayApr,
  addLiquidityUrl,
  lpLabel,
  lpTotalSupply,
  tokenAmountTotal,
  quoteTokenAmountTotal,
}) => {
  const { onStake } = useStakeFarms(pid)
  const { onUnstake } = useUnstakeFarms(pid)
  const { tokenBalance, stakedBalance } = useFarmUser(pid)
  const cakePrice = usePriceCakeBusd()
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const lpPrice = useLpTokenPrice(lpSymbol)
  const { fetchWithCatchTxError } = useCatchTxError()
  const addPopup = useAddPopup()
  const [showModalDeposit, setShowModalDeposit] = useState(false)
  const [showModalWithdraw, setShowModalWithdraw] = useState(false)
  const addTransaction = useTransactionAdder()

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
            summary: 'Stake succesful'
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
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }

  const renderStakingButtons = () => {
    return stakedBalance.eq(0) ? (
      <StakeAdd row={true} />
    ) : (
      <IconButtonWrapper>
        <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary" onClick={()=>setShowModalWithdraw(true)} mr="6px">
          <MinusIcon />
        </IconButton>
        <IconButton
          style={{background: 'transparent', width: 'auto'}} 
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
          lpPrice={lpPrice}
          lpLabel={lpLabel}
          apr={apr}
          onDismiss={() => setShowModalDeposit(false)}
          displayApr={'111'}
          stakedBalance={stakedBalance}
          onConfirm={handleStake}
          tokenName={lpSymbol}
          multiplier={multiplier}
          addLiquidityUrl={'#/add-pro/'+token.address+'/'+quoteToken.address}
          cakePrice={cakePrice}/>
        }

        {showModalWithdraw &&
          <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={lpSymbol} onDismiss={()=>setShowModalWithdraw(false)} />
        }
        </ModalContainer>
        }
    <Flex justifyContent="space-between" alignItems="center">
      <StakedLP
        stakedBalance={stakedBalance}
        lpSymbol={lpSymbol}
        quoteTokenSymbol={quoteToken.symbol}
        tokenSymbol={token.symbol}
        lpTotalSupply={lpTotalSupply}
        tokenAmountTotal={tokenAmountTotal}
        quoteTokenAmountTotal={quoteTokenAmountTotal}
      />
      {renderStakingButtons()}
    </Flex>
    </>
  )
}

export default StakeAction
