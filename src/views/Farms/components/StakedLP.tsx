import { Heading, Flex } from '@pancakeswap/uikit'
import { BigNumber } from 'bignumber.js'
import Balance from '../../../components/Balance'
import React, { useCallback } from 'react'
import { getBalanceAmount, getFullDisplayBalance } from '../../../utils/formatBalance'
import { useTheme } from 'styled-components'
import { Percent, Token } from 'zircon-sdk'
import { useToken } from '../../../hooks/Tokens'
import { useDerivedPylonBurnInfoFixedPercentage } from '../../../state/burn/hooks'
import { Field } from '../../../state/burn/actions'
import { usePair } from '../../../data/Reserves'

interface StackedLPProps {
  stakedBalance: BigNumber
  max: BigNumber
  isClassic: boolean
  isAnchor?: boolean,
  token1: Token,
  token2: Token,
  lpSymbol: string
  tokenSymbol: string
  quoteTokenSymbol: string
  lpTotalSupply: BigNumber
  tokenAmountTotal: BigNumber
  quoteTokenAmountTotal: BigNumber
  percentage: string,
  field: Field,
  stakingToken: Token,
}

const StakedLP: React.FunctionComponent<StackedLPProps> = ({
  stakedBalance,
  stakingToken,
  isClassic,
  isAnchor,
  max,
  token1,
  token2,
  quoteTokenSymbol,
  tokenSymbol,
  percentage,
  field,
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


  const [currencyA, currencyB] = [useToken(token1.address) ?? undefined, useToken(token2.address) ?? undefined]

  //calculate classic pair staked liquidity
  const percentagePair = parseFloat(stakedBalance.times(new BigNumber(100).div(max)).toFixed(3))
  const [,pair] = usePair(token1, token2)
  const [reserve0, reserve1] = [pair?.reserve0.toFixed(3), pair?.reserve1.toFixed(3)]
  const token1Reserve = parseFloat(reserve0)*percentagePair/100
  const token2Reserve = parseFloat(reserve1)*percentagePair/100

  //calculate pylon pair staked liquidity
  const { parsedAmounts } = useDerivedPylonBurnInfoFixedPercentage(
    currencyA ?? undefined,
    currencyB ?? undefined,
    !isAnchor,
    true,
    percentage,
    field,
    stakedBalance,
  )

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
        ? '0'
        : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
            ? '<1'
            : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
        parsedAmounts[Field.LIQUIDITY]?.toSignificant(3),
    [Field.CURRENCY_A]:
        parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
    [Field.CURRENCY_B]:
        parsedAmounts[Field.CURRENCY_B]?.toSignificant(3),
  }


  return (
    <Flex flexDirection="column" alignItems="flex-start">
      <Heading style={{color: theme.text1, fontWeight: 400, fontSize: '24px'}}>{displayBalance()}</Heading>
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
              value={isClassic ? token1Reserve : formattedAmounts[Field.CURRENCY_A]}
              unit={` ${tokenSymbol}`}
              prefix=" "
            />
            <Balance
              fontSize="12px"
              color={theme.whiteHalf}
              decimals={2}
              value={isClassic ? token2Reserve : formattedAmounts[Field.CURRENCY_B]}
              unit={` ${quoteTokenSymbol}`}
              prefix=" "
            />
          </Flex>
        </>
      )}
    </Flex>
  )}


export default StakedLP
