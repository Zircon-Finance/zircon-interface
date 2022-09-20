import React, { Dispatch, SetStateAction } from 'react'
import styled, { css, useTheme } from 'styled-components'
import { IconButton, Skeleton } from '@pancakeswap/uikit'
import MinusIcon from '../MinusIcon'
import { expandAnimation, collapseAnimation } from './Staked'
import { Flex, Text } from 'rebass'
import { useWindowDimensions } from '../../../../hooks'
import Balance from '../../../../components/Balance'

export interface EarnedProps {
  earnings: number
  earningsUSD: number
  pid: number
  hovered: boolean
  setHovered: Dispatch<SetStateAction<boolean>>
}

interface EarnedPropsWithLoading extends EarnedProps {
  userDataReady: boolean
}

const Amount = styled.span<{ earned: number }>`
  color: ${({ earned, theme }) => (earned ? theme.whiteHalf : theme.colors.textDisabled)};
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
  background: ${({ theme }) => theme.hoveredButton};
  border-radius: 17px;
  padding: 10px;
  z-index: 1000;
  right: -20px;
  font-size: 13px;
`

const AbsContainer = styled.div`
  position: sticky;
  margin-left: 5px;
  svg {
    pointer-events: none;
  }
`

const Earned: React.FunctionComponent<EarnedPropsWithLoading> = ({ pid, earnings, userDataReady, hovered, setHovered, earningsUSD }) => {
  const [hoverMinus, setHoverMinus] = React.useState(false)
  const theme = useTheme()
  const { width } = useWindowDimensions()

  const minusContent = (
    <DialogContainer show={hoverMinus}>
      <Text style={{color: '#FFF'}}>
        {('Withdraw')}
      </Text>
    </DialogContainer>
  )
  if (userDataReady) {
    return <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
    <Amount earned={earnings}>
      <Balance fontSize="16px" color={'#5ebe7b'} decimals={2} value={earningsUSD} unit="" prefix="~ $" />
    </Amount>
    {
    // earnings > 0 &&
    width >= 1100 && hovered &&
      <AbsContainer
      onMouseEnter={()=>setHovered(true)}>
        <IconButton
            style={{background: theme.hoveredButton, width: '29px', height: '28px', borderRadius: '100%'}}>
            <Flex
              onMouseEnter={()=>setHoverMinus(true)}
              onMouseLeave={()=>setHoverMinus(false)}>
              <MinusIcon />
            </Flex>
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
