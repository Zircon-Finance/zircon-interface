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

const CapacityIndicator = (gamma) => {
  return (
    <Container>
        <span>{'Capacity indicator'}</span>
        <CapacityIndicatorSmall gamma={gamma} />
    </Container>
  )
}

export default CapacityIndicator