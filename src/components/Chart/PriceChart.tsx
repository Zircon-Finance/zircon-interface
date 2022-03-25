import React from 'react'
// import { TradingViewLabel } from 'components/TradingView'
// import { useExchangeChartViewManager } from 'state/user/hooks'
// import BasicChart from './BasicChart'
import { StyledPriceChart } from './styles'
import BasicChart from './BasicChart'
// import TradingViewChart from './TradingViewChart'
// import PairPriceDisplay from '../../../../components/PairPriceDisplay'


interface PriceChartProps {
  inputCurrency: any,
  outputCurrency: any,
  onSwitchTokens: any,
  isDark: any,
  isChartExpanded: any,
  setIsChartExpanded: any,
  isMobile: any,
  isFullWidthContainer: any,
  token0Address: any,
  token1Address: any,
  currentSwapPrice: any,

}

const PriceChart = ({
  inputCurrency,
  outputCurrency,
  onSwitchTokens,
  isDark,
  isChartExpanded,
  setIsChartExpanded,
  isMobile,
  isFullWidthContainer,
  token0Address,
  token1Address,
  currentSwapPrice,
}: PriceChartProps) => {

  return (
    <StyledPriceChart
      height={ '100%'}
      overflow={ 'hidden'}
      $isDark={isDark}
      $isExpanded={isChartExpanded}
      $isFullWidthContainer={isFullWidthContainer}
    >
      <div style={{backgroundColor: '#2b1645', borderRadius: '27px'}}>
        <BasicChart
          token0Address={token0Address}
          token1Address={token1Address}
          isChartExpanded={isChartExpanded}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          isMobile={false}
          currentSwapPrice={currentSwapPrice}
        />
      </div>
      {/* {chartView === ChartViewMode.TRADING_VIEW && (
        <Flex
          flexDirection="column"
          justifyContent="space-between"
          height={isMobile ? '100%' : isChartExpanded ? 'calc(100% - 48px)' : '458px'}
          pt="12px"
        >
          <Flex justifyContent="space-between" alignItems="baseline" flexWrap="wrap">
            <PairPriceDisplay
              value={currentSwapPrice?.[token0Address]}
              inputSymbol={inputCurrency?.symbol}
              outputSymbol={outputCurrency?.symbol}
              mx="24px"
            />
            {twChartSymbol && <TradingViewLabel symbol={twChartSymbol} />}
          </Flex>
          <TradingViewChart
            // unmount the whole component when symbols is changed
            key={`${inputCurrency?.symbol}-${outputCurrency?.symbol}`}
            inputSymbol={inputCurrency?.symbol}
            outputSymbol={outputCurrency?.symbol}
            isDark={isDark}
            onTwChartSymbol={handleTwChartSymbol}
          />
        </Flex>
      ) */}
    </StyledPriceChart>
  )
}

export default PriceChart
