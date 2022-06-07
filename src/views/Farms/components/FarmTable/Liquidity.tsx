import React, { Dispatch, SetStateAction } from 'react'
import styled, { css } from 'styled-components'
import { IconButton, Text } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { expandAnimation, collapseAnimation } from './Staked'
import PlusIcon from '../PlusIcon'
import { Link } from 'react-router-dom'


export interface LiquidityProps {
  liquidity: BigNumber
  hovered: boolean
  setHovered: Dispatch<SetStateAction<boolean>>
  farm: any
}

const LiquidityWrapper = styled.div`
  font-weight: 400;
  display: flex;
  align-items: center;
  position: relative;
  ${({ theme }) => theme.mediaQueries.lg} {
    text-align: left;
    margin-right: 0;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
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
  right: -50px;
  width: max-content;
  font-size: 13px;
`

const AbsContainer = styled.div`
  position: absolute;
  left: 50px;
  svg {
    pointer-events: none;
  }
`

const Liquidity: React.FunctionComponent<LiquidityProps> = ({ liquidity, hovered, setHovered, farm }) => {
  // const displayLiquidity = liquidity && liquidity.gt(0) ? (
  //     `$${Number(liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
  //   ) : (
  //     <Skeleton width={60} />
  //   )

  const [hoverPlus, setHoverPlus] = React.useState(false)
  const plusContent = (
      <DialogContainer show={hoverPlus}>
        <Text fontSize='13px'>
          {('Add liquidity')}
        </Text>
      </DialogContainer>
  )

  return (
    <Container>
      <LiquidityWrapper>
        <Text>{'1000$'}</Text>
        { 
        // liquidity.gt(0) && 
        hovered && 
        <AbsContainer onMouseEnter={()=>setHovered(true)}>
          <Link to={`/add-pro/${farm.token.address}/${farm.quoteToken.address}`}>
            <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary">
            <div 
              onMouseEnter={()=>setHoverPlus(true)}
              onMouseLeave={()=>setHoverPlus(false)}>
              <PlusIcon />
            </div>
            </IconButton>
          </Link>
          {hoverPlus && plusContent}
        </AbsContainer>}
      </LiquidityWrapper>
    </Container>
  )
}

export default Liquidity
