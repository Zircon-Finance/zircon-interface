import React from 'react'
import styled from 'styled-components'

const Circle = styled.div`
    height: 40px;
    width: 40px;
    border-radius: 100%;
    background-color: ${({ theme }) => theme.darkMode ? '#212225' : '#F4EFF0'};
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Info = styled.span`
    font-family: 'DM Mono', sans-serif;
    text-align: center;
    font-size: 18px;
    color: ${({ theme }) => theme.darkMode ? '#E3E4E7' : '#1D1D1F'};
`

const InfoCircle = () => {
  return (
    <Circle>
        <Info>{'i'}</Info>  
    </Circle>
  )
}

export default InfoCircle