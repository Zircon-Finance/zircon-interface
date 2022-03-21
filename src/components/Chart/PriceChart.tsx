import React from 'react'
import {
  Button,
  ExpandIcon,
  Flex,
  IconButton,
  ShrinkIcon,
  SyncAltIcon,
  Text,
  // TradingViewIcon,
  LineGraphIcon,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
// import { TradingViewLabel } from 'components/TradingView'
// import { useExchangeChartViewManager } from 'state/user/hooks'
import styled from 'styled-components'
// import BasicChart from './BasicChart'
import { StyledPriceChart } from './styles'
import BasicChart from './BasicChart'
// import TradingViewChart from './TradingViewChart'
// import PairPriceDisplay from '../../../../components/PairPriceDisplay'

const ChartButton = styled(Button)`
  background-color: ${({ $active, theme }) => $active && theme.bg10};
  padding: 4px 8px;
  border-radius: 6px;
`

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
  const { isDesktop } = useMatchBreakpoints()
  const toggleExpanded = () => setIsChartExpanded(false)
  // const [twChartSymbol, setTwChartSymbol] = useState('')

  // const handleTwChartSymbol = useCallback((symbol) => {
  //   setTwChartSymbol(symbol)
  // }, [])

  return (
    <StyledPriceChart
      height={ '100%'}
      overflow={ 'hidden'}
      $isDark={isDark}
      $isExpanded={isChartExpanded}
      $isFullWidthContainer={isFullWidthContainer}
    >
      <Flex justifyContent="space-between" px="24px">
        <Flex alignItems="center">
          {outputCurrency ? (
            <DoubleCurrencyLogo currency0={inputCurrency} currency1={outputCurrency} size={24} margin />
          ) : (
            inputCurrency && <CurrencyLogo currency={inputCurrency} size="24px" style={{ marginRight: '8px' }} />
          )}
          {inputCurrency && (
            <Text color="text" bold>
              {outputCurrency ? `${inputCurrency.symbol}/${outputCurrency.symbol}` : inputCurrency.symbol}
            </Text>
          )}
          <IconButton variant="text" onClick={onSwitchTokens}>
            <SyncAltIcon ml="6px" color="primary" />
          </IconButton>
          <Flex>
            <ChartButton
              aria-label={'Basic'}
              title={'Basic'}
              $active={true}
              scale="sm"
              variant="text"
              color="primary"
              // onClick={() => setChartView(ChartViewMode.BASIC)}
              mr="8px"
            >
              {isDesktop ? 'Basic' : <LineGraphIcon color="primary" />}
            </ChartButton>
            {/* <ChartButton
              aria-label="TradingView"
              title="TradingView"
              $active={chartView === ChartViewMode.TRADING_VIEW}
              scale="sm"
              variant="text"
              onClick={() => setChartView(ChartViewMode.TRADING_VIEW)}
            >
              {isDesktop ? 'TradingView' : <TradingViewIcon color="primary" />}
            </ChartButton> */}
          </Flex>
        </Flex>
        {!isMobile && (
          <Flex>
            <IconButton variant="text" onClick={toggleExpanded}>
              {isChartExpanded ? <ShrinkIcon color="text" /> : <ExpandIcon color="text" />}
            </IconButton>
          </Flex>
        )}
      </Flex>
        <BasicChart
          token0Address={token0Address}
          token1Address={token1Address}
          isChartExpanded={isChartExpanded}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          isMobile={isMobile}
          currentSwapPrice={currentSwapPrice}
        />
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
