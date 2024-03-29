// import { Box, ButtonMenu, ButtonMenuItem, Flex, Text } from '@pancakeswap/uikit'
import { Box, Flex, Text } from 'rebass'
import { useState, memo } from 'react'
import React from 'react'

import SwapLineChart from './SwapLineChart'
import NoChartAvailable from './NoChartAvailable'
import PairPriceDisplay from './PairPriceDisplay'
import { getTimeWindowChange } from './utils'
import { useFetchPairPrices } from '../../state/swap/hooks'
import styled, { useTheme } from 'styled-components'
import DoubleCurrencyLogo from '../DoubleLogo'
import CurrencyLogo from '../CurrencyLogo'
import { useActiveWeb3React } from '../../hooks'

export enum PairDataTimeWindowEnum {
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

const ButtonsContainer = styled.div`
  border-radius: 17px;
  background: ${({ theme }) => theme.liquidityBg};
  display: flex;
  padding: 5px;
  font-size: 13px;
  margin-right: 10px;
`;

const DateButtons = styled.div`
  width: 100%;
  justify-content: space-between;
  display: flex;
  margin-bottom: 15px;
`;

const TimeButton = styled.button`
  border-radius: 12px;
  text-align: center;
  width: 44px;
  height: 36px;
  color: ${({ theme }) => theme.text1};
  border: none;
`;

const TopContainer = styled.div`
  width: 100%;
  display: flex;
  padding: 30px;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bg1};
`;

interface ChartProps {
  token0Address: any,
  token1Address: any,
  isChartExpanded: boolean,
  inputCurrency: any,
  outputCurrency: any,
  isMobile: boolean,
  currentSwapPrice: any
}

const BasicChart = ({
  token0Address,
  token1Address,
  isChartExpanded,
  inputCurrency,
  outputCurrency,
  isMobile,
  currentSwapPrice,
}: ChartProps) => {
  const [timeWindow, setTimeWindow] = useState<PairDataTimeWindowEnum>(0)
  const { pairPrices = [] } = useFetchPairPrices({
    token0Address,
    token1Address,
    timeWindow,
    currentSwapPrice,
  })
  const [hoverValue, setHoverValue] = useState<number | undefined>()
  const [hoverDate, setHoverDate] = useState<string | undefined>()
  const valueToDisplay = hoverValue || pairPrices[pairPrices.length - 1]?.value
  const { changePercentage, changeValue } = getTimeWindowChange(pairPrices)
  const isChangePositive = changeValue >= 0
  const {chainId} = useActiveWeb3React()
  const chartHeight = isChartExpanded ? 'calc(100% - 120px)' : '293px'
  const currentDate = new Date().toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Sometimes we might receive array full of zeros for obscure tokens while trying to derive data
  // In that case chart is not useful to users
  const isBadData =
    pairPrices &&
    pairPrices.length > 0 &&
    pairPrices.every(
      (price: any) => !price.value || price.value === 0 || price.value === Infinity || Number.isNaN(price.value),
    )
  const theme = useTheme();
  if (isBadData) {
    return (
      <NoChartAvailable
        hasOutputToken={true}
        hasLiquidity={false}
      />
    )
  }

  return (
    <>
      <TopContainer>
        <Flex justifyContent="space-between" width={'100%'}>
          <Flex alignItems="center">
            {outputCurrency ? (
              <DoubleCurrencyLogo currency0={inputCurrency} currency1={outputCurrency} size={24} margin />
            ) : (
              inputCurrency && <CurrencyLogo currency={inputCurrency} size="24px" style={{ marginRight: '8px' }} chainId={chainId} />
            )}
            {inputCurrency && (
              <Text color={theme.text1}>
                {outputCurrency ? `${inputCurrency.symbol}/${outputCurrency.symbol}` : inputCurrency.symbol}
              </Text>
            )}
            </Flex >
            <Flex flexDirection="column" alignItems="center">
            <PairPriceDisplay
              value={pairPrices?.length > 0 && valueToDisplay.toFixed(4)}
              inputSymbol={inputCurrency?.symbol}
              outputSymbol={outputCurrency?.symbol}
            >
              <Text color={isChangePositive ? 'green' : 'red'} fontSize="16" ml="4px">
                {`${isChangePositive ? '+' : ''}${changeValue.toFixed(3)} (${changePercentage}%)`}
              </Text>
            </PairPriceDisplay>
            </Flex>
        </Flex>
      </TopContainer>
      <div style={{borderRadius: '27px', backgroundColor: 'transparent', paddingBottom: '15px'}}>
      <DateButtons>
        <Text color={theme.whiteHalf} style={{alignSelf: 'center', width: '100%', paddingLeft: '15px', height: 'auto', fontSize: '13px'}}>
            {hoverDate || currentDate}
          </Text>
          <ButtonsContainer >
            <TimeButton style={{cursor: 'pointer', backgroundColor: timeWindow === 0 ? theme.badgeSmall : 'transparent'}} onClick={()=> setTimeWindow(0)}>{'24H'}</TimeButton>
            <TimeButton style={{cursor: 'pointer', backgroundColor: timeWindow === 1 ? theme.badgeSmall : 'transparent'}} onClick={()=> setTimeWindow(1)}>{'1W'}</TimeButton>
            <TimeButton style={{cursor: 'pointer', backgroundColor: timeWindow === 2 ? theme.badgeSmall : 'transparent'}} onClick={()=> setTimeWindow(2)}>{'1M'}</TimeButton>
            {/* <TimeButton style={{backgroundColor: timeWindow === 3 ? '#4D346C' : 'transparent'}} onClick={()=> setTimeWindow(3)}>{'1Y'}</TimeButton> */}
          </ButtonsContainer>
        </DateButtons>
      <Box height={isMobile ? '100%' : chartHeight}>
        <SwapLineChart
          data={pairPrices}
          setHoverValue={setHoverValue}
          setHoverDate={setHoverDate}
          isChangePositive={isChangePositive}
          timeWindow={timeWindow}
        />
      </Box>
      </div>
    </>
  )
}

export default memo(BasicChart, (prev, next) => {
  return (
    prev.token0Address === next.token0Address &&
    prev.token1Address === next.token1Address &&
    prev.isChartExpanded === next.isChartExpanded &&
    prev.isMobile === next.isMobile &&
    prev.isChartExpanded === next.isChartExpanded &&
    ((prev.currentSwapPrice !== null &&
      next.currentSwapPrice !== null &&
      prev.currentSwapPrice[prev.token0Address] === next.currentSwapPrice[next.token0Address] &&
      prev.currentSwapPrice[prev.token1Address] === next.currentSwapPrice[next.token1Address]) ||
      (prev.currentSwapPrice === null && next.currentSwapPrice === null))
  )
})
