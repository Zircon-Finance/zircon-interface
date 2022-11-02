import React, {useEffect, useState} from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
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
import { deserializeToken } from '../../../../state/user/hooks'
import { getBalanceAmount } from '../../../../utils/formatBalance'
import { Field } from '../../../../state/burn/actions'

interface FarmCardActionsProps extends DeserializedPool {
    lpLabel?: string
    addLiquidityUrl?: string
    displayApr?: string
}

const IconButtonWrapper = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  padding-bottom: 20px;
`

const StakeAction: React.FC<FarmCardActionsProps> = ({
                                                         isAnchor,
                                                         isClassic,
                                                         isFinished,
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
                        summary: 'Stake '+amount+' '+pool.token1.symbol+"-"+pool.token2.symbol+' LP to farm',
                    }
                },
                receipt.transactionHash
            )
            dispatch(fetchPoolsUserDataAsync(account))
        }
    }

    const handleUnstake = async (amount: string) => {
        const receipt = await fetchWithCatchTxError(() => {
            return onUnstake(amount, token1.decimals).then((response) => {
                addTransaction(response, {
                    summary: 'Unstake '+ amount+ ' ' + pool.token1.symbol+ "-" +pool.token2.symbol+' LP tokens'
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
                        summary: 'Unstake '+amount+' LP tokens from farm',
                    }
                },
                receipt.transactionHash
            )
            dispatch(fetchPoolsUserDataAsync(account))
        }
    }
    const staked = parseFloat(getBalanceAmount(stakedBalance).toFixed(6))
    const maxStake = parseFloat(getBalanceAmount(tokenBalance).toFixed(6))
    const percentage = (staked*100/(staked + maxStake)).toString()


    const [rewardTokens, setRewardTokens] = useState("")

    useEffect(() => {
        let r = ''
        earningToken.forEach((token) => r += ` ${token.symbol} &`)
        setRewardTokens(r.slice(0, -1))
    }, [])

    const renderStakingButtons = () => {
        return stakedBalance.eq(0) ? (
            <StakeAdd row={true} isFinished={isFinished} />
        ) : (
            <IconButtonWrapper>
                <IconButton
                    style={{background: '#B05D98', width: '29px', height: '28px', borderRadius: '100%', marginRight: '5px'}}
                    variant="tertiary" onClick={()=>setShowModalWithdraw(true)} mr="6px">
                    <MinusIcon />
                </IconButton>
                <IconButton
                    style={{background: '#B05D98', width: '29px', height: '28px', borderRadius: '100%', marginRight: '5px'}}
                    variant="tertiary"
                    onClick={()=>setShowModalDeposit(true)}
                    disabled={pool.isFinished}
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
                    addLiquidityUrl={'#/add-pro/'+token1.address+'/'+token2.address + '/' + isAnchor ? 'stable' : 'float' }
                    token={stakingToken}
                    pool={pool}
                />
                }

                {showModalWithdraw &&
                <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={'ZPT'} onDismiss={()=>setShowModalWithdraw(false)} token={stakingToken} />
                }
            </ModalContainer>
            }
            <Flex justifyContent="space-between" alignItems="center">
                <StakedLP
                    stakedRatio={pool.stakedRatio}
                    staked={pool.staked}
                    price={pool.quotingPrice}
                    stakedBalancePool={pool.stakedBalancePool}
                    stakingToken = {stakingToken}
                    percentage={percentage}
                    field={Field.LIQUIDITY_PERCENT}
                    max={tokenBalance}
                    isClassic={isClassic}
                    isAnchor={isAnchor}
                    token1={deserializeToken(token1)}
                    token2={deserializeToken(token2)}
                    stakedBalance={stakedBalance}
                    lpSymbol={'lpSymbol'}
                    quoteTokenSymbol={stakingToken.symbol}
                    tokenSymbol={`${rewardTokens}`}
                    lpTotalSupply={1 as unknown as BigNumber}
                    tokenAmountTotal={1 as unknown as BigNumber}
                />
                {renderStakingButtons()}
            </Flex>
        </>
    )
}

export default StakeAction
