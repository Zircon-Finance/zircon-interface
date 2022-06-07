import React, { Dispatch, SetStateAction } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { 
  // HelpIcon, 
  Text, Skeleton, IconButton } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import PlusIcon from '../PlusIcon'
import MinusIcon from '../MinusIcon'
import { getBalanceAmount } from '../../../../utils/formatBalance'

// const ReferenceElement = styled.div`
//   display: inline-block;
// `

export interface StakedProps {
  staked: BigNumber
  hovered: boolean
  setHovered: Dispatch<SetStateAction<boolean>>
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
  svg {
    pointer-events: none;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`
export const expandAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`
export const collapseAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const DialogContainer = styled.div<{ show }>`
  animation: ${({ show }) =>
  show
    ? css`
        ${expandAnimation} 200ms
      `
    : css`
        ${collapseAnimation} 300ms linear forwards
      `};
  position: absolute;
  top: 40px;
  background: ${({ theme }) => theme.bg6};
  border-radius: 17px;
  padding: 10px;
  z-index: 1000;
  font-size: 13px;
`

const Staked: React.FunctionComponent<StakedProps> = ({ staked, hovered, setHovered }) => {
  const [hoverMinus, setHoverMinus] = React.useState(false)
  const [hoverPlus, setHoverPlus] = React.useState(false)
  const plusContent = (
    <DialogContainer style={{left: '15px'}} show={hoverPlus}>
      <Text fontSize='13px'>
        {('Stake')}
      </Text>
    </DialogContainer>
  )
  const minusContent = (
    <DialogContainer style={{right: '5px'}} show={hoverMinus}>
      <Text fontSize='13px'>
        {('Unstake')}
      </Text>
    </DialogContainer>
  )
  const displayBalance =
  staked && staked.gt(0) ? (
      `$${getBalanceAmount(staked).toFixed(3, BigNumber.ROUND_DOWN)}`
    ) : (
      <Skeleton width={60} />
    )
  return (
    <Container>
      <LiquidityWrapper>
        <Text style={{position: 'relative'}} textAlign={'left'}>{displayBalance}</Text>
        {staked > new BigNumber(0) && hovered && 
        <div style={{display: 'flex', position: 'absolute', left: '55px'}} 
        onMouseEnter={()=>setHovered(true)}>
          <IconButton 
            style={{background: 'transparent', width: 'auto'}} 
            variant="tertiary" 
            >
            <div 
            onMouseEnter={()=>[setHoverMinus(true), setHoverPlus(false)]}
            onMouseLeave={()=>setHoverMinus(false)}>
            <MinusIcon />
            </div>
          </IconButton>
          {hoverMinus && minusContent}
          <IconButton
            style={{background: 'transparent', width: 'auto'}} 
            variant="tertiary"
            
          >
            <div
              onMouseEnter={()=>[setHoverPlus(true), setHoverMinus(false)]}
              onMouseLeave={()=>setHoverPlus(false)}>
            <PlusIcon/>
            </div>
          </IconButton>
          {hoverPlus && plusContent}
        </div>}
      </LiquidityWrapper>
    </Container>
  )
}

export default Staked
