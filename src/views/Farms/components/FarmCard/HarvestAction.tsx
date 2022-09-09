import React from 'react'
import { Flex} from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Balance from '../../../../components/Balance'
import { useTranslation } from 'react-i18next'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useDispatch } from 'react-redux'
import { BIG_ZERO } from '../../../../utils/bigNumber'
import { getBalanceAmount } from '../../../../utils/formatBalance'
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
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { useTotalSupply } from '../../../../data/TotalSupply'
import { DeserializedPool } from '../../../../state/types'
import { Text } from 'rebass'
import styled from 'styled-components'

interface FarmCardActionsProps extends DeserializedPool {
  userDataReady: boolean
}

const Shader = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient( to right, rgba(0,0,0,0) 0%, ${({ theme }) => theme.farmPoolCardsBg} 100%);
  width: 30%;
  height: 100%;
  z-index: 1;
`


const HarvestAction: React.FC<FarmCardActionsProps> = ({ earningToken ,sousId, userData, userDataReady, vaultAddress }) => {
  const { account } = useWeb3React()
  const earningsBigNumber = new BigNumber(userData.pendingReward)
  let earnings = BIG_ZERO
  let earningsBusd = 0

  // If user didn't connect wallet default balance will be 0
  if (!earningsBigNumber.isZero()) {
    earnings = getBalanceAmount(earningsBigNumber)
  }
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { t } = useTranslation()
  const { onReward } = useHarvestFarm(sousId)
  const dispatch = useDispatch()
  const theme = useTheme()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const { width } = useWindowDimensions()
  let rewardTokens = ''
  earningToken.forEach(token => rewardTokens += `${token.symbol} `)

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
    const totalSupply = useTotalSupply(token)
    const rewards = getBalanceAmount(earningsBigNumber).times(rewardTokenBalance?.toFixed(6)).div(totalSupply?.toFixed(6))
    return (
      <>
        <Flex style={{marginLeft: '5px', marginBottom: '7px', color: theme.text1}}>
          {`${rewards.toFixed(6)} ${token.symbol}`}
        </Flex>
        <Balance ml={'5px'} textAlign={'left'} fontSize="12px" color={theme.whiteHalf} decimals={2} unit="" value={rewards} prefix=" ~ $" />
      </>
    )
  }

  return (
    <Flex mb="8px" justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" alignItems="flex-start" width={'100%'}>
      <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '15px'}}>
          <div style={{display: 'flex', flexFlow: 'column', height: '100%', justifyContent: 'space-between'}}>
          <Text color={theme.text1} fontSize="13px">
              {t('Earned')}
            </Text>
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
                  summary: `Harvest ${rewardTokens} tokens`
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
        slidesPerView={earningToken.length == 2 ? 1.7 : 1}
        spaceBetween={2}
        freeMode={true}
        pagination={{
          clickable: true,
        }}
        modules={[FreeMode, Pagination]}
        className="swipe-container"
        >
        <Shader />
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
