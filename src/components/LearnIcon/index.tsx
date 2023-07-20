import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import CoffeeIcon from '../CoffeeIcon'

const LearnBadge = styled.span`
  background-color: #A89FCA5a;
  display: flex;
  position: relative;
  top: 30px;
  padding: 16px 20px 16px 16px;
  border-radius: 30px;
  color: ${({ theme }) => theme.white};
  font-size: 10px;
  cursor: pointer;
  z-index: 1;
  &:hover {
      background-color:  #A89FCA9a;
  }
  @media (min-width: 700px) {
    font-size: 16px;
    right: 20px;
    position: fixed;
    top: 90%;
  }
`

const SmallerBadge = styled.span`
  background-color: ${({ theme }) => theme.bg7};
  display: flex;
  font-size: 23px;
  position: absolute;
  bottom: 80px;
  right: 10px;
  padding: 12px 20px;
  border-radius: 30px;
  color: ${({ theme }) => theme.white};
  cursor: pointer;
  z-index: 1;
  &:hover {
      background-color: ${({ theme }) => theme.bg10};
  }
`

const LearnIcon = () => {
  return (
    <LearnBadge onClick={() => {
        window.open('https://docs.zircon.finance', '_blank');
      }}><CoffeeIcon /><Text style={{marginLeft: '8px'}} fontSize={16}>{'Learn'}</Text>  </LearnBadge>
  )
}

export const SmallerQuestionmark = () => (
    <SmallerBadge onClick={() => {
        window.open('https://docs.zircon.finance', '_blank');
      }}>?</SmallerBadge>
)

export default LearnIcon