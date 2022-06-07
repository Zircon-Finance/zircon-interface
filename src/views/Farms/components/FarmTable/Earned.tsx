import React, { Dispatch, SetStateAction } from 'react'
import styled, { css } from 'styled-components'
import { IconButton, Skeleton } from '@pancakeswap/uikit'
import MinusIcon from '../MinusIcon'
import { expandAnimation, collapseAnimation } from './Staked'
import { Text } from 'rebass'

export interface EarnedProps {
  earnings: number
  pid: number
  hovered: boolean
  setHovered: Dispatch<SetStateAction<boolean>>
}

interface EarnedPropsWithLoading extends EarnedProps {
  userDataReady: boolean
}

const Amount = styled.span<{ earned: number }>`
  color: ${({ earned, theme }) => (earned ? theme.colors.text : theme.colors.textDisabled)};
  display: flex;
  align-items: center;
  font-size: 13px;
  @media (min-width: 992px) {
    font-size: 16px;
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
  right: -30px;
  font-size: 13px;
`

const AbsContainer = styled.div`
  position: absolute;
  left: 50px;
  svg {
    pointer-events: none;
  }
`

const Earned: React.FunctionComponent<EarnedPropsWithLoading> = ({ earnings, userDataReady, hovered, setHovered }) => {
  const [hoverMinus, setHoverMinus] = React.useState(false)
  const minusContent = (
    <DialogContainer show={hoverMinus}>
      <Text>
        {('Withdraw')}
      </Text>
    </DialogContainer>
  )
  if (userDataReady) {
    return <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
    <Amount earned={earnings}>{earnings.toLocaleString()}</Amount>
    { 
    // earnings > 0 && 
    hovered && 
      <AbsContainer
      onMouseEnter={()=>setHovered(true)}>
        <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary">
        <div 
            onMouseEnter={()=>setHoverMinus(true)}
            onMouseLeave={()=>setHoverMinus(false)}>
            <MinusIcon />
        </div>
        </IconButton>
        {hoverMinus && minusContent}
      </AbsContainer>}</div>
  }
  return (
    <Amount earned={0}>
      <Skeleton width={60} />
    </Amount>
  )
}

export default Earned
