import { rgba } from 'polished'
import React from 'react'
import { Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

const BarContainer = styled.div`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.darkMode ? rgba(255,255,255,0.1) : rgba(0,0,0,0.1)};
`

const PercentageBar = styled.div<{ percentage: number }>`
    width: ${({ percentage }) => percentage}%;
    height: 1px;
    background-color: ${({ theme, percentage }) => percentage <= 10 ? theme.percentageRed : theme.percentageGreen};
    position: relative;
    top: -1px;
    display: flex;
    justify-content: flex-start;
`

const Marker = styled.div<{ percentage: number }>`
    width: 1px;
    height: 5px;
    background-color: ${({ theme, percentage }) => percentage <= 10 ? theme.percentageRed : theme.percentageGreen};
    position: relative;
    top: -2px;
    left: 100%;
`

const DaysLeftBar = ({daysLeft, viewMode = 'table'}) => {
const percentageRemaining = daysLeft * 100 / 33
const theme = useTheme()
console.log('daysLeft', daysLeft)
  return (
    <Flex flexDirection={"column"} alignItems={"center"} mt={"10px"} style={{width: '100%',minWidth: viewMode === 'card' && '200px'}}>
      <Text style={{ width: "100%", marginBottom: '5px' }} textAlign={"left"} fontSize={13}
      color = {daysLeft <= 3 ? theme.percentageRed : theme.percentageGreen}>
        {`${daysLeft !== "NaN" ? `${daysLeft} ~ days left` : "Loading..."}`}
        </Text>
      <BarContainer>
        <PercentageBar percentage={percentageRemaining}>
            <Marker percentage={percentageRemaining} />
        </PercentageBar>
      </BarContainer>
    </Flex>
  );
}

export default DaysLeftBar