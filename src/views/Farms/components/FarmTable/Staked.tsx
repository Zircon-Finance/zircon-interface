import React from 'react'
import styled from 'styled-components'
import { 
  // HelpIcon, 
  Text, Skeleton, IconButton } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import PlusIcon from '../PlusIcon'
import MinusIcon from '../MinusIcon'

// const ReferenceElement = styled.div`
//   display: inline-block;
// `

export interface StakedProps {
  staked: BigNumber
  hovered: boolean
}

const LiquidityWrapper = styled.div`
  min-width: 110px;
  font-weight: 400;
  text-align: right;
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.lg} {
    text-align: left;
    margin-right: 0;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

const Staked: React.FunctionComponent<StakedProps> = ({ staked, hovered }) => {
  console.log('staked', staked)
  const displayBalance =
  staked && staked.gt(0) ? (
      `$${Number(staked).toLocaleString( 'en-US', { maximumFractionDigits: 2 } )}`
    ) : (
      <Skeleton width={60} />
    )

  return (
    <Container>
      <LiquidityWrapper>
        <Text style={{position: 'relative'}} textAlign={'left'}>{displayBalance}</Text>
        {staked > new BigNumber(0) && hovered && 
        <div style={{position: 'absolute', left: '50px', pointerEvents: 'none'}}>
          <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary">
          <MinusIcon />
          </IconButton>
          <IconButton
            style={{background: 'transparent', width: 'auto'}} 
            variant="tertiary"
          >
            <PlusIcon/>
          </IconButton>
        </div>}
      </LiquidityWrapper>
    </Container>
  )
}

export default Staked
