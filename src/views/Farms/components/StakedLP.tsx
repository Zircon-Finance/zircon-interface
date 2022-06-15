import { Heading, Flex } from '@pancakeswap/uikit'
import { BigNumber } from 'bignumber.js'
import Balance from '../../../components/Balance'
import React, { useCallback } from 'react'
import { getBalanceAmount, getFullDisplayBalance } from '../../../utils/formatBalance'
import { useTheme } from 'styled-components'

interface StackedLPProps {
  stakedBalance: BigNumber
  lpSymbol: string
  tokenSymbol: string
  quoteTokenSymbol: string
  lpTotalSupply: BigNumber
  tokenAmountTotal: BigNumber
  quoteTokenAmountTotal: BigNumber
}

const StakedLP: React.FunctionComponent<StackedLPProps> = ({
  stakedBalance,
  lpSymbol,
  quoteTokenSymbol,
  tokenSymbol,
  lpTotalSupply,
  tokenAmountTotal,
  quoteTokenAmountTotal,
}) => {
  // const lpPrice = useLpTokenPrice(lpSymbol)
  const theme = useTheme()
  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return stakedBalanceBigNumber.toFixed(10, BigNumber.ROUND_DOWN)
    }
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0001)) {
      return getFullDisplayBalance(stakedBalance).toLocaleString()
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedBalance])

  return (
    <Flex flexDirection="column" alignItems="flex-start">
      <Heading style={{color: theme.text1, fontWeight: '400'}}>{displayBalance()}</Heading>
      {stakedBalance.gt(0) && (
        <>
          {/* <Balance
            fontSize="12px"
            color={theme.text1}
            decimals={2}
            value={1}
            unit=" USD"
            prefix="~"
          /> */}
          <Flex style={{ gap: '4px' }}>
            <Balance
              fontSize="12px"
              color={theme.whiteHalf}
              decimals={2}
              value={1}
              unit={` ${tokenSymbol}`}
              prefix=" "
            />
            <Balance
              fontSize="12px"
              color={theme.whiteHalf}
              decimals={2}
              value={1}
              unit={` ${quoteTokenSymbol}`}
              prefix=" "
            />
          </Flex>
        </>
      )}
    </Flex>
  )}


export default StakedLP
