import React from 'react'
import styled from 'styled-components'
import CapacityIndicatorSmall from '../CapacityIndicatorSmall'

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    height: 100%;
    color: ${({ theme }) => theme.darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    border: 1px solid ${({ theme }) => theme.darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    border-radius: 12px;
    padding: 10px 20px;
    font-size: 16px;
    margin: 10px auto 10px auto;
`

interface Props {
  gamma?: any
  health?: string
  isFloat?: boolean
}

const CapacityIndicator: React.FC<Props> = ({gamma, health, isFloat}) => {
  return (
    <Container>
        <span>{isFloat ? 'Capacity indicator' : 'Health factor'}</span>
        <CapacityIndicatorSmall gamma={gamma} health={health} isFloat={isFloat} />
    </Container>
  )
}

export default CapacityIndicator