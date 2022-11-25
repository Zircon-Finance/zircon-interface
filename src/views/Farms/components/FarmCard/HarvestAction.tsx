import React, {useEffect, useState} from 'react'
import { Flex} from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Balance from '../../../../components/Balance'
import { useTranslation } from 'react-i18next'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useDispatch } from 'react-redux'
import { BIG_ZERO } from '../../../../utils/bigNumber'
import {getBalanceAmount, getBalanceUSD} from '../../../../utils/formatBalance'
import useHarvestFarm from '../../hooks/useHarvestFarm'
import { useTheme } from 'styled-components'
import { fetchPoolsUserDataAsync } from '../../../../state/pools'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { useAddPopup } from '../../../../state/application/hooks'
import { Token } from 'zircon-sdk'
import { HarvestButton } from '../FarmTable/Actions/styles'
import { Pagination, FreeMode } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'
import 'swiper/swiper.min.css'
import 'swiper/modules/pagination/pagination.min.css'
import { useWindowDimensions } from '../../../../hooks'
import CurrencyLogo from '../../../../components/CurrencyLogo'
import { DeserializedPool } from '../../../../state/types'
import { Text } from 'rebass'
import styled from 'styled-components'
import ReactGA from 'react-ga4'

interface FarmCardActionsProps extends DeserializedPool {
    userDataReady: boolean
}

const Shader = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient( to right, rgba(0,0,0,0) 0%, ${({ theme }) => theme.opacitySmall} 100%);
  width: 30%;
  height: 100%;
  z-index: 1;
`


const HarvestAction: React.FC<FarmCardActionsProps> = ({ earningToken ,sousId, userData, userDataReady, vaultAddress, earningTokenInfo }) => {
    const { account } = useWeb3React()
    const earningsBigNumber = new BigNumber(userData.pendingReward)
    let earnings = BIG_ZERO
    let earningsBusd = getBalanceUSD(earningsBigNumber, earningTokenInfo?.map(t => t.currentPrice))

    // If user didn't connect wallet default balance will be 0
    if (!earningsBigNumber.isZero()) {
        earnings = getBalanceAmount(earningsBigNumber)
    }
    const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
    const { t } = useTranslation()
    const { onReward } = useHarvestFarm(sousId, userData.pendingReward.toString())
    const dispatch = useDispatch()
    const theme = useTheme()
    const addPopup = useAddPopup()
    const addTransaction = useTransactionAdder()
    const { width } = useWindowDimensions()
    const [rewardTokens, setRewardTokens] = useState("")

    useEffect(() => {
        let r = ''
        earningToken.forEach((token) => r += ` ${token.symbol} &`)
        setRewardTokens(r.slice(0, -1))
    }, [])
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
                <Text fontSize="13px" color={theme.whiteHalf}>
                    {`~ ${currentPrice?.toFixed(2)} USD`}
                </Text>
            </Flex>
        )
    }

    const SwipeTokenCard = ({ token, index }: { token: Token; index: number }) => {
        let currentBalance = earningTokenInfo ? getBalanceAmount(earningsBigNumber.times(earningTokenInfo[index].current)) : 0
        let currentPrice = earningTokenInfo ? getBalanceAmount(earningsBigNumber.times(earningTokenInfo[index].currentPrice)) : 0
        return (
            <>
                <Flex style={{marginBottom: '10px', color: theme.text1}}>
                    <Text color={theme.text1} fontSize={'24px'} >{`${currentBalance.toFixed(6)} ${token.symbol === 'MOVR' ? 'wMOVR' : token.symbol}`}</Text>
                </Flex>
                <Text color={theme.text1} textAlign={'left'} fontSize="13px">
                    {`~ ${currentPrice?.toFixed(2)} USD`}
                </Text>
            </>
        )
    }

    return (
        <Flex mb="8px" justifyContent="space-between" alignItems="center">
            <Flex flexDirection="column" alignItems="flex-start" width={'100%'}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '10px'}}>
                    <div style={{display: 'flex', flexFlow: 'row', height: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text color={theme.text1} fontSize="16px" fontWeight={500}>
                            {t('EARNED')}
                        </Text>
                        {earningsBusd > 0 && (
                            <Balance fontSize="12px" color={theme.whiteHalf} decimals={2} value={earningsBusd} unit=" USD" prefix="~" marginLeft={2}/>
                        )}
                    </div>
                    <HarvestButton
                        disabled={earnings.eq(0) || pendingTx || !userDataReady}
                        onClick={async () => {
                            const receipt = await fetchWithCatchTxError(() => {
                                return onReward().then((response) => {
                                    addTransaction(response, {
                                        summary: `Harvest ${rewardTokens} tokens`
                                    })
                                    return response
                                })
                            })
                            if (receipt?.status) {
                                ReactGA.event({
                                    category: 'Harvest Rewards',
                                    action: 'Harvested from table view',
                                    label: 'Harvested from table view'
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
                </div>
                {width >= 992 ? (
                    <Swiper
                        slidesPerView={earningToken.length == 2 ? 1.7 : 1}
                        spaceBetween={2}
                        freeMode={true}
                        pagination={{
                            clickable: true,
                        }}
                        modules={[FreeMode, Pagination]}
                        className="swipe-container"
                    >
                        {earningToken.length === 2 && <Shader />}
                        {earningToken.map((token, index) => <SwiperSlide><SwipeTokenCard key={token.symbol} token={token} index={index} /></SwiperSlide>)}
                    </Swiper>
                ) : (
                    <div style={{width: '100%', overflow: 'scroll', marginTop: '5px'}}>
                        {earningToken.map((token, index) => (
                            <TokenRow key={token.symbol} token={token} index={index} />
                        ))}
                    </div>
                )}
            </Flex>

        </Flex>
    )
}

export default HarvestAction
