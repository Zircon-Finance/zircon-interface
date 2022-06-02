import React from 'react'
import styled from 'styled-components'
import { IconButton, Skeleton } from '@pancakeswap/uikit'
import MinusIcon from '../MinusIcon'

export interface EarnedProps {
  earnings: number
  pid: number
  hovered: boolean
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

const Earned: React.FunctionComponent<EarnedPropsWithLoading> = ({ earnings, userDataReady, hovered }) => {
  if (userDataReady) {
    return <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
    <Amount earned={earnings}>{earnings.toLocaleString()}</Amount>
    { earnings > 0 && hovered && 
      <div style={{position: 'absolute', left: '50px', pointerEvents: 'none'}}>
        <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary">
        <MinusIcon />
        </IconButton>
      </div>}</div>
  }
  return (
    <Amount earned={0}>
      <Skeleton width={60} />
    </Amount>
  )
}

export default Earned
