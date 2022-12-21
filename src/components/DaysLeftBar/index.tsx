import { rgba } from 'polished'
import React from 'react'
import { Flex, Text } from 'rebass'
import styled, { css, keyframes, useTheme } from 'styled-components'
import { QuestionMarkContainer, ToolTip } from '../../views/Farms/components/FarmTable/Row'
import QuestionMarkIcon from '../QuestionMarkIcon'

interface DaysLeftProps {
  startBlock: number
  endBlock: number
  currentBlock: any
  viewMode?: any
}


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
    background-color: ${({ theme, percentage }) => percentage ? percentage <= 10 ? theme.percentageRed : theme.percentageGreen : theme.opacitySmall};
    position: relative;
    max-width: 300px;
    display: flex;
    max-width: 300px;
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

const DaysLeftBar: React.FC<DaysLeftProps> = ({viewMode = 'table', startBlock, endBlock, currentBlock}) => {
  const [hoverBlocks, setHoverBlocks] = React.useState(false)
  const blocksLeft = endBlock - currentBlock
  const daysLeft = parseInt((blocksLeft / 6500).toFixed(0))
  const hoursLeft = parseInt(((blocksLeft / 6500) * 24).toFixed(0))
  const percentageRemaining = daysLeft * 100 / ((endBlock - startBlock) / 6500)
  const theme = useTheme()

  const TooltipContent: React.FC = () => {return (
    <ToolTip show={hoverBlocks} style={{bottom: viewMode === 'actionPanel' ? '-15px' : 
    viewMode === 'tableView' && '-15px', 
    left: viewMode === 'actionPanel' ? '30px' : viewMode === 'tableView' && '-240px'}}>
      <Text fontSize='13px' fontWeight={500} color={theme.text1}>
        {`Farm will be restarted in ${blocksLeft} blocks.`}
      </Text>
    </ToolTip>
  )}

  return (
    <Flex flexDirection={"column"} alignItems={"center"} mt={"10px"} style={{width: '100%',minWidth: viewMode === 'card' && '200px'}}>
      <Flex alignItems={"center"} justifyContent={'space-between'} style={{width: '100%'}}>
      <Text style={{ width: "100%", marginBottom: '5px' }} textAlign={"left"} fontSize={13}
      color = {daysLeft <= 3 ? theme.percentageRed : theme.text1}>
        {`${(daysLeft || hoursLeft) ? hoursLeft >= 24 ? 
          `~ ${daysLeft} days left` : 
          `~ ${hoursLeft} hours left` : 
          hoursLeft < 1 ? 'Ending soon!' :
          "Loading..."}`}
        </Text>
        <QuestionMarkContainer
          onMouseEnter={() => setHoverBlocks(true)}
          onMouseLeave={() => setHoverBlocks(false)}
          style={{marginTop: '0px', marginLeft: '0px'}}
          >{hoverBlocks && (
            <TooltipContent />
          )}
        <QuestionMarkIcon />
        </QuestionMarkContainer>
      </Flex>
      <BarContainer>
        {daysLeft <= 35 && <PercentageBar show={daysLeft !== 0} percentage={percentageRemaining}>
            <Marker percentage={percentageRemaining} />
        </PercentageBar>}
      </BarContainer>
    </Flex>
  );
}

export default DaysLeftBar
