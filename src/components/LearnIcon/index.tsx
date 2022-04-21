import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import QuestionMarkIcon from '../QuestionMarkIcon'

const LearnBadge = styled.span`
  background-color: ${({ theme }) => theme.bg7};
  display: flex;
  position: fixed;
  bottom: 20px;
  padding: 15px;
  border-radius: 30px;
  color: ${({ theme }) => theme.white};
  font-size: 10px;
  cursor: pointer;
  z-index: 100;
  &:hover {
      background-color: ${({ theme }) => theme.bg10};
  }
  @media (min-width: 700px) {
    font-size: 16px;
    right: 20px;
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
  z-index: 10;
  &:hover {
      background-color: ${({ theme }) => theme.bg10};
  }
`

const LearnIcon = () => {
  return (
    <LearnBadge onClick={() => {
        window.open('https://docs.zircon.finance', '_blank');
      }}><QuestionMarkIcon /><Text style={{marginLeft: '10px'}} fontSize={16}>{'Learn'}</Text>  </LearnBadge>
  )
}

export const SmallerQuestionmark = () => (
    <SmallerBadge onClick={() => {
        window.open('https://docs.zircon.finance', '_blank');
      }}>?</SmallerBadge>
)

export default LearnIcon