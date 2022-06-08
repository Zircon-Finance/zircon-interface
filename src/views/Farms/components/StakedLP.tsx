import { Heading, Flex } from '@pancakeswap/uikit'
import { BigNumber } from 'bignumber.js'
import Balance from '../../../components/Balance'
import React, { useCallback } from 'react'
import { useLpTokenPrice } from '../../../state/farms/hooks'
import { getBalanceAmount, getBalanceNumber, getFullDisplayBalance } from '../../../utils/formatBalance'
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
  const lpPrice = useLpTokenPrice(lpSymbol)
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
      <Heading style={{color: theme.text1, margin: '0',fontWeight: '400'}}>{displayBalance()}</Heading>
      {stakedBalance.gt(0) && lpPrice.gt(0) && (
        <>
          <Balance
            fontSize="12px"
            color={theme.text1}
            decimals={2}
            value={getBalanceNumber(lpPrice.times(stakedBalance))}
            unit=" USD"
            prefix="~"
          />
          <Flex style={{ gap: '4px' }}>
            <Balance
              fontSize="12px"
              color={theme.whiteHalf}
              decimals={2}
              value={stakedBalance.div(lpTotalSupply).times(tokenAmountTotal).toNumber()}
              unit={` ${tokenSymbol}`}
            />
            <Balance
              fontSize="12px"
              color={theme.whiteHalf}
              decimals={2}
              value={stakedBalance.div(lpTotalSupply).times(quoteTokenAmountTotal).toNumber()}
              unit={` ${quoteTokenSymbol}`}
            />
          </Flex>
        </>
      )}
    </Flex>
  )}


export default StakedLP
