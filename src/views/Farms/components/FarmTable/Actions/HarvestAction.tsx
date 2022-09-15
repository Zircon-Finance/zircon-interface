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
import { getBalanceAmount } from '../../../../../utils/formatBalance'
import useHarvestFarm from '../../../hooks/useHarvestFarm'
import { ActionContainer, ActionContent, HarvestButton } from './styles'
import { useTheme } from 'styled-components'
import { DeserializedPool } from '../../../../../state/types'
import { useAddPopup } from '../../../../../state/application/hooks'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { fetchPoolsUserDataAsync } from '../../../../../state/pools'
import { Pagination, FreeMode } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'

import 'swiper/swiper.min.css'
import 'swiper/modules/pagination/pagination.min.css'
import { useTokenBalance } from '../../../../../state/wallet/hooks'
import { useTotalSupply } from '../../../../../data/TotalSupply'
import { Flex } from 'rebass'
import { useWindowDimensions } from '../../../../../hooks'
import { Token } from 'zircon-sdk'
import CurrencyLogo from '../../../../../components/CurrencyLogo'

export const Shader = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient( to right, rgba(0,0,0,0) 0%, ${({ theme }) => theme.actionPanelBg} 100%);
  width: 20%;
  height: 100%;
  z-index: 1;
`

interface HarvestActionProps extends DeserializedPool {
  userDataReady: boolean
}


const HarvestAction: React.FunctionComponent<HarvestActionProps> = ({ earningToken ,sousId, userData, userDataReady, vaultAddress }) => {
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const earningsBigNumber = new BigNumber(userData.pendingReward)
  let earnings = BIG_ZERO
  let earningsBusd = 0

  // If user didn't connect wallet default balance will be 0
  if (!earningsBigNumber.isZero()) {
    earnings = getBalanceAmount(earningsBigNumber)
  }

  const { onReward } = useHarvestFarm(sousId)
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
    const rewardTokenBalance = useTokenBalance(vaultAddress, token)
    const totalSupply = useTotalSupply(token)
    const rewards = getBalanceAmount(earningsBigNumber).times(rewardTokenBalance?.toFixed(6)).div(totalSupply?.toFixed(6))
    return (
        <Flex justifyContent={'space-between'} style={{borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 0', alignItems: 'center'}}>
          <Flex>
            <CurrencyLogo style={{marginRight: '3px'}} currency={token} />
            <Text color={theme.text1} fontSize='16px'>
              {`${rewards?.toFixed(6)} ${token.symbol}`}
            </Text>
          </Flex>
          <Balance fontSize="13px" color={theme.whiteHalf} decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
        </Flex>
    )
  }

  const SwipeTokenCard = ({ token, index }: { token: Token; index: number }) => {
    const rewardTokenBalance = useTokenBalance(vaultAddress, token)
    const totalSupply = useTotalSupply(new Token(token.chainId, vaultAddress, token.decimals, token.symbol, token.name))
    let rewards;
    if (!rewardTokenBalance || !totalSupply || !earningsBigNumber) {
      rewards = 0
    }else {
      rewards = getBalanceAmount(earningsBigNumber).times(rewardTokenBalance?.toFixed(6)).div(totalSupply.toFixed(6))
    }
    return (
        <>
          <Flex style={{marginLeft: '5px', marginBottom: '7px'}}>
            {`${rewards.toFixed(6)} ${token.symbol}`}
          </Flex>
          {/*<Balance ml={'5px'} textAlign={'left'} fontSize="12px" color={theme.whiteHalf} decimals={2} unit="" value={rewards} prefix=" ~ $" />*/}
        </>
    )
  }

  return (
      <ActionContainer style={{background: theme.actionPanelBg}}>
        <ActionContent style={{flexFlow: 'column'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
            <div style={{display: 'flex', flexFlow: 'column', height: '100%', justifyContent: 'space-between'}}>
              <Text color={theme.text1} fontSize="13px">
                {t('EARNED')}
              </Text>
              {/* <Heading color={theme.text1} style={{margin: '8px 0', fontWeight: '400', fontSize: '24px'}}>{displayBalance}</Heading> */}
              {earningsBusd > 0 && (
                  <Balance fontSize="12px" color={theme.whiteHalf} decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
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
              {pendingTx ? t('Harvesting') : t('Harvest all')}
            </HarvestButton>
          </div>
          {width >= 992 ? (
              <Swiper
                  slidesPerView={earningToken.length === 2 ? 1.7 : 1}
                  spaceBetween={2}
                  freeMode={true}
                  pagination={{
                    clickable: true,
                  }}
                  modules={[FreeMode, Pagination]}
                  className="swipe-container"
              >
                <Shader />
                {earningToken.map((token, index) => <SwiperSlide><SwipeTokenCard key={index} token={token} index={index} /></SwiperSlide>)}
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
