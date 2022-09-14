import React from 'react'
import styled, {useTheme} from 'styled-components'
import CapacityIndicatorSmall from '../CapacityIndicatorSmall'
import {QuestionMarkContainer, ToolTip} from "../../views/Farms/components/FarmTable/Row";
import {Text} from "rebass";
import QuestionMarkIcon from "../QuestionMarkIcon";
import BigNumber from "bignumber.js";
import BigNumberJs from "bignumber.js";

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
  padding: 8px 8px;
  font-size: 16px;
  margin: 8px auto 8px auto;
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
    feePercentage?: BigNumber
    extraFee?: BigNumber
    extraFeeTreshold?:  BigNumber
    isDeltaGamma?: boolean
    slashingOmega?: BigNumber
}

const CapacityIndicator: React.FC<Props> = ({gamma, health, isFloat, noSpan, blocked, feePercentage,extraFee = new BigNumberJs(0), extraFeeTreshold = new BigNumberJs(0), isDeltaGamma, slashingOmega= new BigNumberJs(0)}) => {
    const theme = useTheme();
    const [hoverRisk, setHoverRisk] = React.useState(false);
    const [hoverFee, setHoverFee] = React.useState(false);
    console.log("feePercentage", feePercentage.toString())
    const TooltipContentRisk = () => {return (
        <ToolTip style={{left: '-200px'}} show={hoverRisk}>
            <Text fontSize='13px' fontWeight={500} color={theme.text1}>
                {`The risk factor keeps track of the farms' stability. `}
            </Text>
        </ToolTip>
    )}
    return (
        <Container>
            {(!blocked && feePercentage && feePercentage.gt(0)) && <RowContainer>
                <SmallContainer>
                    {!noSpan && <span style={{marginLeft: 8}}>{'Fee' + (isDeltaGamma ? " + Delta Fee" : "")}</span>}
                    <QuestionMarkContainer
                        onMouseEnter={() => setHoverFee(true)}
                        onMouseLeave={() => setHoverFee(false)}
                    >
                        {hoverFee && (
                            <TooltipContentRisk />
                        )}
                        <QuestionMarkIcon />
                    </QuestionMarkContainer>
                </SmallContainer>
                <span style={{marginLeft: 8}}>{feePercentage?.toFixed(4)}%</span>
            </RowContainer>}

            {!blocked && extraFee.gt(0) && <RowContainer>
                <SmallContainer>
                    {!noSpan && <span style={{marginLeft: 8}}>{'Slippage For Amount > ' + extraFeeTreshold.toFixed(4)}</span>}
                    <QuestionMarkContainer
                        onMouseEnter={() => setHoverFee(true)}
                        onMouseLeave={() => setHoverFee(false)}
                    >
                        {hoverFee && (
                            <TooltipContentRisk />
                        )}
                        <QuestionMarkIcon />
                    </QuestionMarkContainer>
                </SmallContainer>
                <span style={{marginLeft: 8}}>{extraFee?.toFixed(4)}%</span>
            </RowContainer>}

            {!blocked && slashingOmega.gt(0) && <RowContainer>
                <SmallContainer>
                    {!noSpan && <span style={{marginLeft: 8}}>{'Omega'}</span>}
                    <QuestionMarkContainer
                        onMouseEnter={() => setHoverFee(true)}
                        onMouseLeave={() => setHoverFee(false)}
                    >
                        {hoverFee && (
                            <TooltipContentRisk />
                        )}
                        <QuestionMarkIcon />
                    </QuestionMarkContainer>
                </SmallContainer>
                <span style={{marginLeft: 8}}>{slashingOmega?.toFixed(4)}%</span>
            </RowContainer>}

            <RowContainer>
                <SmallContainer>

                    {!noSpan && <span style={{marginLeft: 8}}>{blocked ? "Transaction likely to fail" : isFloat ? 'Divergence' : 'Health factor'}</span>}
                    <QuestionMarkContainer
                        onMouseEnter={() => setHoverRisk(true)}
                        onMouseLeave={() => setHoverRisk(false)}
                    >
                        {hoverRisk && (
                            <TooltipContentRisk />
                        )}
                        <QuestionMarkIcon />
                    </QuestionMarkContainer>
                </SmallContainer>
                <CapacityIndicatorSmall gamma={gamma} health={health} isFloat={isFloat} />
            </RowContainer>
        </Container>
    )
}

export default CapacityIndicator
