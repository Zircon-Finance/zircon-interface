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
    hoverPage?: string
}

interface ToolTipProps {
    option: string
  }

const CapacityIndicator: React.FC<Props> = ({gamma, hoverPage, health, isFloat, noSpan, blocked, feePercentage,extraFee = new BigNumberJs(0), extraFeeTreshold = new BigNumberJs(0), isDeltaGamma, slashingOmega= new BigNumberJs(0)}) => {
    const theme = useTheme();
    const [hoverRisk, setHoverRisk] = React.useState(false);
    const [hoverFee, setHoverFee] = React.useState(false);
    const [hoverSlashing, setHoverSlashing] = React.useState(false);
    const [hoverSlippage, setHoverSlippage] = React.useState(false);
    const TooltipContentRisk: React.FC<ToolTipProps> = ({option}) => {return (
        <ToolTip style={{left: '-100px'}} show={hoverRisk || hoverFee || hoverSlashing || hoverSlippage}>
            <Text fontSize='13px' fontWeight={500} color={theme.text1}>
                {`${option === 'health' ? 'The health factor measures how balanced this Stable vault is. Imbalanced vaults may be partially slashed when withdrawing during critical market activity.' :
                option === 'divergence' ? 'Divergence measures how much impermanent loss the Float vault is suffering.' :
                option === 'deltaFee' ? 'The pool is applying a “Delta Tax” because prices or liquidity have changed too fast recently. Just wait a few minutes for this to pass.':
                option === 'fee' ? 'You pay a dynamic fee between 0.01% and 0.5% to join the Pylon vaults. The fee is lowest when the Pylon vaults are balanced.' :
                option === 'omega' ? 'The pool is currently imbalanced, Stable withdrawals are reduced by the distress fee to avoid liquidation. Don’t panic, this is temporary, unless you think this pool will “die”.' :
                option === 'slippage' ? 'You may suffer some slippage losses when joining the pool. Reduce the amount or use the Swap & Add method to avoid it.' :
                'General info'}`}
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
                            <TooltipContentRisk option={isDeltaGamma ? "deltaFee" : "fee"} />
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
                        onMouseEnter={() => setHoverSlippage(true)}
                        onMouseLeave={() => setHoverSlippage(false)}
                    >
                        {hoverSlippage && (
                            <TooltipContentRisk option='slippage' />
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
                        onMouseEnter={() => setHoverSlashing(true)}
                        onMouseLeave={() => setHoverSlashing(false)}
                    >
                        {hoverSlashing && (
                            <TooltipContentRisk option='omega' />
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
                            <TooltipContentRisk option={isFloat ? 'divergence' : 'health'} />
                        )}
                        <QuestionMarkIcon />
                    </QuestionMarkContainer>
                </SmallContainer>
                <CapacityIndicatorSmall gamma={gamma} health={health} isFloat={isFloat} hoverPage={hoverPage} />
            </RowContainer>
        </Container>
    )
}

export default CapacityIndicator
