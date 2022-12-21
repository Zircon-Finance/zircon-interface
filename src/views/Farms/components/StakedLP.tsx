import { Heading, Flex } from '@pancakeswap/uikit'
import { BigNumber } from 'bignumber.js'
import Balance from '../../../components/Balance'
import React, { useCallback } from 'react'
import { getBalanceAmount } from '../../../utils/formatBalance'
import { useTheme } from 'styled-components'
import { Token } from 'zircon-sdk'
// import { useToken } from '../../../hooks/Tokens'
// import { useDerivedPylonBurnInfoFixedPercentage } from '../../../state/burn/hooks'
import { Field } from '../../../state/burn/actions'
import { useUserFarmsViewMode } from '../../../state/user/hooks'
import { ViewMode } from '../../../state/user/actions'
import { useWindowDimensions } from '../../../hooks'
// import { usePair } from '../../../data/Reserves'

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
  percentage: string,
  field: Field,
  stakingToken: Token,
  stakedBalancePool: number,
  price?: string
  staked: BigNumber
  stakedRatio: number
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
                                                             staked,
                                                             stakedBalancePool,
                                                             price,
                                                             stakedRatio
                                                           }) => {
  // const lpPrice = useLpTokenPrice(lpSymbol)
  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return stakedBalanceBigNumber.toFixed(4, BigNumber.ROUND_DOWN)
    }
    return stakedBalanceBigNumber.toFixed(4, BigNumber.ROUND_DOWN)
  }, [stakedBalance])

  const theme = useTheme()
  const {width} = useWindowDimensions()
  const [viewMode, ] = useUserFarmsViewMode();

  return (
      <Flex flexDirection="column" alignItems="flex-start" justifyContent={'space-between'} style={{height: '100%'}}>
        <Heading style={{color: theme.text1, fontWeight: 400, fontSize: '24px', marginBottom: '18px', marginTop: viewMode === ViewMode.TABLE && width >= 800 && '35px'}}>{displayBalance() + " ZPT"}</Heading>
        {stakedBalance.gt(0) && !isClassic && (
            <>
              <Balance
                  fontSize="13px"
                  color={theme.text1}
                  decimals={2}
                  value={new BigNumber(stakedBalance).multipliedBy(stakedRatio).div(stakedBalancePool).multipliedBy(staked).multipliedBy(price)}
                  unit=" USD"
                  prefix="~ "
              />
              {/* <Flex style={{ gap: '4px' }}>
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
          </Flex> */}
            </>
        )}
      </Flex>
  )}


export default StakedLP
