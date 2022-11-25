import React, {useEffect, useState} from 'react'
import { Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Balance from '../../../../../components/Balance'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
import { useDispatch } from 'react-redux'
import { BIG_ZERO } from '../../../../../utils/bigNumber'
import {getBalanceAmount, getBalanceUSD} from '../../../../../utils/formatBalance'
import useHarvestFarm from '../../../hooks/useHarvestFarm'
import { ActionContainer, ActionContent, HarvestButton } from './styles'
import { useTheme } from 'styled-components'
import { DeserializedPool } from '../../../../../state/types'
import { useAddPopup } from '../../../../../state/application/hooks'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { fetchPoolsUserDataAsync } from '../../../../../state/pools'
import { Pagination, FreeMode } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'
import ReactGA from 'react-ga4'
import 'swiper/swiper.min.css'
import 'swiper/modules/pagination/pagination.min.css'
import { Flex } from 'rebass'
import { useWindowDimensions } from '../../../../../hooks'
import { Token } from 'zircon-sdk'
import CurrencyLogo from '../../../../../components/CurrencyLogo'
import { usePool } from '../../../../../state/pools/hooks'

export const Shader = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient( to right, rgba(0,0,0,0) 0%, ${({ theme }) => theme.opacitySmall} 100%);
  width: 20%;
  height: 100%;
  z-index: 1;
`

interface HarvestActionProps extends DeserializedPool {
    userDataReady: boolean
}


const HarvestAction: React.FunctionComponent<HarvestActionProps> = ({ earningToken ,sousId, userData, userDataReady, vaultAddress, earningTokenInfo }) => {
    const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
    const earningsBigNumber = new BigNumber(userData.pendingReward)
    let earnings = BIG_ZERO
    let earningsBusd = getBalanceUSD(earningsBigNumber, earningTokenInfo?.map(t => t.currentPrice))

    // If user didn't connect wallet default balance will be 0
    if (!earningsBigNumber.isZero()) {
        earnings = getBalanceAmount(earningsBigNumber)
    }

    const {pool} = usePool(sousId)
    const { onReward, onCompound } = useHarvestFarm(sousId, userData.pendingReward.toFixed(0))
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { account } = useWeb3React()
    const theme = useTheme()
    const addPopup = useAddPopup()
    const addTransaction = useTransactionAdder()

    const [rewardTokens, setRewardTokens] = useState("")

    useEffect(() => {
        let r = ''
        earningToken.forEach((token) => r += ` ${token.symbol} &`)
        setRewardTokens(r.slice(0, -1))
    }, [])


    const { width } = useWindowDimensions()

    const TokenRow = ({ token, index }: { token: Token; index: number }) => {

        let currentBalance = earningTokenInfo ? getBalanceAmount(earningsBigNumber.times(earningTokenInfo[index].current)) : 0
        let currentPrice = earningTokenInfo ? getBalanceAmount(earningsBigNumber.times(earningTokenInfo[index].currentPrice)) : 0
        return (
            <Flex justifyContent={'space-between'} style={{borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 0', alignItems: 'center'}}>
                <Flex>
                    <CurrencyLogo style={{marginRight: '3px'}} currency={token} />
                    <Text color={theme.text1} fontSize='16px'>
                        {`${currentBalance?.toFixed(6)} ${token.symbol}`}
                    </Text>
                </Flex>
                <Balance fontSize="13px" color={theme.whiteHalf} decimals={2} value={currentPrice} unit=" USD" prefix="~" />
            </Flex>
        )
    }

    const SwipeTokenCard = ({ token, index }: { token: Token; index: number }) => {

        let currentBalance = earningTokenInfo ? getBalanceAmount(earningsBigNumber.times(earningTokenInfo[index].current)) : 0
        let currentPrice = earningTokenInfo ? getBalanceAmount(earningsBigNumber.times(earningTokenInfo[index].currentPrice)) : 0

        return (
            <>
                <Flex style={{marginBottom: '10px'}}>
                    <Text color={theme.text1} fontSize={'24px'} >{`${currentBalance.toFixed(6)} ${token.symbol === 'MOVR' ? 'wMOVR' : token.symbol}`}</Text>
                </Flex>
                <Text color={theme.text1} textAlign={'left'} fontSize="13px">
                    {`~ ${currentPrice?.toFixed(2)} USD`}
                </Text>
            </>
        )
    }
    return (
        <ActionContainer style={{borderLeft: width >= 800 && `1px solid ${theme.opacitySmall}`, borderRadius: '0px'}}>
            <ActionContent style={{flexFlow: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                    <div style={{display: 'flex', flexFlow: 'row', height: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text color={theme.text1} fontSize="16px" fontWeight={500}>
                            {t('EARNED')}
                        </Text>
                         {/*<Heading color={theme.text1} style={{margin: '8px 0', fontWeight: '400', fontSize: '24px'}}>{displayBalance}</Heading>*/}
                        {earningsBusd > 0 && (
                            <Text color={theme.whiteHalf} ml={'5px'} textAlign={'left'} fontSize="12px">
                                {`~ ${earningsBusd?.toFixed(2)} USD`}
                            </Text>
                        )}
                    </div>
                    <HarvestButton
                        disabled={earnings.eq(0) || pendingTx || !userDataReady}
                        onClick={async () => {
                            const receipt = await fetchWithCatchTxError(() => {
                                return onReward().then((response) => {
                                    addTransaction(response, {
                                        summary: `Harvest${rewardTokens.slice(0, -1)} tokens`
                                    })
                                    return response
                                })
                            })
                            if (receipt?.status) {
                                ReactGA.event({
                                    category: 'Harvest Rewards',
                                    action: 'Harvested from card view',
                                    label: 'Harvested from card view'
                                });
                                addPopup(
                                    {
                                        txn: {
                                            hash: receipt.transactionHash,
                                            success: receipt.status === 1,
                                            summary: 'Harvest tokens',
                                        }
                                    },
                                    receipt.transactionHash
                                )
                                dispatch(fetchPoolsUserDataAsync(account))
                            }
                        }}
                    >
                        {pendingTx ? t('HARVESTING..') : t('HARVEST ALL')}
                    </HarvestButton>
                    {((pool.token1.symbol === 'ZRG' || pool.token2.symbol === 'ZRG') && pool.earningTokenInfo.find(t => t.symbol === 'KSM')?.currentPrice > 0) && (
                     <HarvestButton
                        disabled={earnings.eq(0) || pendingTx || !userDataReady}
                        onClick={async () => {
                            const receipt = await fetchWithCatchTxError(() => {
                                return onCompound().then((response) => {
                                    addTransaction(response, {
                                        summary: `Compound ${rewardTokens.slice(0, -1)} tokens`
                                    })
                                    return response
                                })
                            })
                            if (receipt?.status) {
                                ReactGA.event({
                                    category: 'Compound Rewards',
                                    action: 'Compounded from card view',
                                    label: 'Compounded from card view'
                                });
                                addPopup(
                                    {
                                        txn: {
                                            hash: receipt.transactionHash,
                                            success: receipt.status === 1,
                                            summary: 'Compound tokens',
                                        }
                                    },
                                    receipt.transactionHash
                                )
                                dispatch(fetchPoolsUserDataAsync(account))
                            }
                        }}
                    >
                        {pendingTx ? t('Compounding...') : t('Compound')}
                    </HarvestButton>)}
                </div>
                {width >= 992 ? (
                    <Swiper
                        slidesPerView={earningToken.length === 2 ? 1.4 : 1}
                        spaceBetween={2}
                        freeMode={true}
                        pagination={{
                            clickable: true,
                        }}
                        modules={[FreeMode, Pagination]}
                        className="swipe-container"
                    >
                        {earningToken.length === 2 && <Shader />}
                        {earningToken.map((token, index) => <SwiperSlide style={{borderRight: (earningToken.length === 2 && width >= 800) && '1px solid rgba(255,255,255,0.1)'}}>
                            <SwipeTokenCard key={index} token={token} index={index} />
                        </SwiperSlide>)}
                    </Swiper>
                ) : (
                    <div style={{width: '100%', overflow: 'scroll', marginTop: '5px'}}>
                        {earningToken.map((token, index) => (
                            <TokenRow key={index} token={token} index={index} />
                        ))}
                    </div>
                )}
            </ActionContent>
        </ActionContainer>
    )
}

export default HarvestAction
