import { rgba } from 'polished'
import React from 'react'
import { Flex, Text } from 'rebass'
import styled, { css, keyframes, useTheme } from 'styled-components'

const BarContainer = styled.div`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.darkMode ? rgba(255,255,255,0.1) : rgba(0,0,0,0.1)};
`

const showAnimation = (percentage) => keyframes`
  from {
    width: 0%;
  }
  to {
    width: ${percentage}%;
  }
`

const PercentageBar = styled.div<{ percentage: number, show: boolean }>`
    width: ${({ percentage }) => percentage}%;
    height: 1px;
    background-color: ${({ theme, percentage }) => percentage <= 10 ? theme.percentageRed : theme.percentageGreen};
    position: relative;
    top: -1px;
    display: flex;
    justify-content: flex-start;
    animation: ${({ show, percentage }) =>
    show
    && css`
        ${showAnimation(percentage)} 500ms ease-in-out forwards
      `};
`

const Marker = styled.div<{ percentage: number }>`
    width: 1px;
    height: 5px;
    background-color: ${({ theme, percentage }) => percentage <= 10 ? theme.percentageRed : theme.percentageGreen};
    position: relative;
    top: -2px;
    left: 100%;
`

const DaysLeftBar = ({viewMode = 'table', startBlock, endBlock, currentBlock}) => {
const blocksLeft = endBlock - currentBlock
const daysLeft = parseInt((blocksLeft / 6500).toFixed(0))
const hoursLeft = parseInt(((blocksLeft / 6500) * 24).toFixed(0))
const percentageRemaining = daysLeft * 100 / ((endBlock - startBlock) / 6500)
const theme = useTheme()
  return (
    <Flex flexDirection={"column"} alignItems={"center"} mt={"10px"} style={{width: '100%',minWidth: viewMode === 'card' && '200px'}}>
      <Text style={{ width: "100%", marginBottom: '5px' }} textAlign={"left"} fontSize={13}
      color = {daysLeft <= 3 ? theme.percentageRed : theme.percentageGreen}>
        {`${daysLeft ? daysLeft >= 1 ? 
          `${daysLeft} ~ days left (${blocksLeft} blocks left)` : 
          `${hoursLeft} ~ hours left (${blocksLeft} blocks left})` : 
          "Loading..."}`}
        </Text>
      <BarContainer>
        <PercentageBar show={daysLeft !== 0} percentage={percentageRemaining}>
            <Marker percentage={percentageRemaining} />
        </PercentageBar>
      </BarContainer>
    </Flex>
  );
}

export default DaysLeftBar