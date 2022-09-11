import React from 'react'
import styled, {useTheme} from 'styled-components'
import CapacityIndicatorSmall from '../CapacityIndicatorSmall'
import {QuestionMarkContainer, ToolTip} from "../../views/Farms/components/FarmTable/Row";
import {Text} from "rebass";
import QuestionMarkIcon from "../QuestionMarkIcon";

const Container = styled.div`
  display: flex;
  flex-direction: column;
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
const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`
const SmallContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

interface Props {
  gamma?: any
  health?: string
  isFloat?: boolean
  noSpan?: boolean
  blocked?: boolean
}

const CapacityIndicator: React.FC<Props> = ({gamma, health, isFloat, noSpan, blocked}) => {
  const theme = useTheme();
  const [hoverRisk, setHoverRisk] = React.useState(false);
  const TooltipContentRisk = () => {return (
      <ToolTip style={{left: '-200px'}} show={hoverRisk}>
        <Text fontSize='13px' fontWeight={500} color={theme.text1}>
          {`The risk factor keeps track of the farms' stability. `}
        </Text>
      </ToolTip>
  )}
  return (
      <Container>
        <RowContainer>
          <SmallContainer>
            <QuestionMarkContainer
                onMouseEnter={() => setHoverRisk(true)}
                onMouseLeave={() => setHoverRisk(false)}
            >
              {hoverRisk && (
                  <TooltipContentRisk />
              )}
              <QuestionMarkIcon />
            </QuestionMarkContainer>
            {!noSpan && <span style={{marginLeft: 8}}>{blocked ? "Transaction likely to fail" : isFloat ? 'Capacity indicator' : 'Health factor'}</span>}
          </SmallContainer>
          <CapacityIndicatorSmall gamma={gamma} health={health} isFloat={isFloat} />
        </RowContainer>
      </Container>
  )
}

export default CapacityIndicator
