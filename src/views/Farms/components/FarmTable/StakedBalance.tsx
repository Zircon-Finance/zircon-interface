import React from 'react'
import styled from 'styled-components'
import { 
  // HelpIcon, 
  Text, Skeleton } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'

// const ReferenceElement = styled.div`
//   display: inline-block;
// `

export interface StakedProps {
  staked: BigNumber
}

const LiquidityWrapper = styled.div`
  min-width: 110px;
  font-weight: 600;
  text-align: right;
  margin-right: 14px;
  ${({ theme }) => theme.mediaQueries.lg} {
    text-align: left;
    margin-right: 0;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

const StakedBalance: React.FunctionComponent<StakedProps> = ({ staked }) => {
  const displayBalance =
  staked && staked.gt(0) ? (
      `$${Number(staked).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    ) : (
      <Skeleton width={60} />
    )

  return (
    <Container>
      <LiquidityWrapper>
        <Text>{displayBalance}</Text>
      </LiquidityWrapper>
    </Container>
  )
}

export default StakedBalance
