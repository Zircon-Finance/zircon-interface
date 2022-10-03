import React, {useEffect, useState} from "react";
import styled, { useTheme } from "styled-components";
import { Flex } from "@pancakeswap/uikit";
// import { Token } from 'zircon-sdk'
import DoubleCurrencyLogo from "../../../../components/DoubleLogo";
import { BadgeSmall } from "../../../../components/Header";
import {
    SpaceBetween,
} from "../FarmTable/Actions/ActionPanel";
import { SerializedToken } from "../../../../constants/types";
import { Text } from "rebass";

import QuestionMarkIcon from "../../../../components/QuestionMarkIcon";
import { QuestionMarkContainer, ToolTip } from "../FarmTable/Row";
import CapacityIndicatorSmall from "../../../../components/CapacityIndicatorSmall/index";
import { useActiveWeb3React, useWindowDimensions } from "../../../../hooks";
import { RewardPerBlock } from "../../Farms";

export interface ExpandableSectionProps {
    lpLabel?: string;
    multiplier?: string;
    isCommunityFarm?: boolean;
    token: SerializedToken;
    quoteToken: SerializedToken;
    isClassic: boolean;
    isAnchor?: boolean;
    earningToken: SerializedToken[];
    gamma: any;
    healthFactor: string;
    sousId: number;
    vaultAddress: string;
}

interface ToolTipProps {
    option: string
  }

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`;

const CardHeading: React.FC<ExpandableSectionProps> = ({
                                                           isClassic,
                                                           isAnchor,
                                                           earningToken,
                                                           token,
                                                           quoteToken,
                                                           gamma,
                                                           healthFactor,
                                                           sousId,
                                                           vaultAddress,
                                                       }) => {
    const theme = useTheme();
    // const risk = gamma && (gamma.isLessThanOrEqualTo(0.7) || gamma.isGreaterThanOrEqualTo(0.5))
    const [hoverRisk, setHoverRisk] = React.useState(false);
    const [rewardTokens, setRewardTokens] = useState("")
    const {account} = useActiveWeb3React()

    useEffect(() => {
        let r = ''
        earningToken.forEach((token) => r += ` ${token.symbol === 'MOVR' ? 'wMOVR' : token.symbol} &`)
        setRewardTokens(r.slice(0, -1))
    }, [])

    const TooltipContentRisk: React.FC<ToolTipProps> = ({option}) => {return (
        <ToolTip style={{left: '-200px', top: '50px', bottom: 'auto'}} show={hoverRisk}>
            <Text fontSize='13px' fontWeight={500} color={theme.text1}>
            {`${option === 'health' ? 'The health factor measures how balanced this Stable vault is. Imbalanced vaults may be partially slashed when withdrawing during critical market activity.' :
                option === 'divergence' ? 'Divergence measures how much impermanent loss the Float vault is suffering.' :
                'General info'}`}
            </Text>
        </ToolTip>
    )}
    const {width} = useWindowDimensions()

    console.log('PARAMS: ', vaultAddress, sousId, earningToken)
    return (
      <div
        style={{ padding: "10px", color: theme.text1 }}
      >
        <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
          <Flex flexDirection="column" alignItems="flex-end" width={'100%'}>
            <>
              <Flex flexWrap="wrap" width={'100%'} justifyContent={'space-between'}>
                <Flex>
                {isClassic ? (
                  <DoubleCurrencyLogo
                    currency0={token}
                    currency1={quoteToken}
                    margin={false}
                    size={26}
                  />
                ) : (
                  <DoubleCurrencyLogo
                    currency0={!isAnchor ? token : quoteToken}
                    currency1={null}
                    margin={false}
                    size={26}
                  />
                )}
                <BadgeSmall
                  style={{
                    fontSize: "13px",
                    height: "23px",
                    alignSelf: "center",
                    marginLeft: "0px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: "5px",
                  }}
                >
                  <span
                    style={{
                      color: theme.text1,
                      fontSize: "16px",
                      marginRight: "3px",
                    }}
                  >
                    {token.symbol}{" "}
                  </span>
                  {isClassic ? "CLASSIC" : isAnchor ? "STABLE" : "FLOAT"}
                </BadgeSmall>
                </Flex>
                <Text
                  color={theme.whiteHalf}
                  style={{ minWidth: "max-content", display: 'flex', alignItems: 'center' }}
                  fontWeight={400}
                  fontSize={'13px'}
                >{`${token.symbol}/${quoteToken.symbol}`}</Text>
              </Flex>
            </>
            {/* <Flex justifyContent="center">
          {multiplier ? (
            <MultiplierTag variant="secondary">{multiplier}</MultiplierTag>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex> */}
          </Flex>
        </Wrapper>
        { !account ? (
        <SpaceBetween>
          <Flex
            flexDirection={"column"}
            justifyContent={"space-between"}
            height={60}
          >
            <Text
              color={"#4e7455"}
              style={{
                textAlign: "left",
                maxLines: 1,
                overflow: "hidden",
                textOverflow: "elipsis",
                marginTop: "5px",
              }}
            >{`Earn ${rewardTokens}`}</Text>
          </Flex>
          <Flex
            flexDirection={"column"}
            justifyContent={"space-between"}
            height={60}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <CapacityIndicatorSmall
                gamma={gamma}
                health={healthFactor}
                isFloat={!isAnchor}
                noSpan={true}
                hoverPage={"tableCard"}
              />
              <QuestionMarkContainer
                onMouseEnter={() => setHoverRisk(true)}
                onMouseLeave={() => setHoverRisk(false)}
              >
                {hoverRisk && (
                  <TooltipContentRisk
                    option={!isAnchor ? "divergence" : "health"}
                  />
                )}
                <QuestionMarkIcon />
              </QuestionMarkContainer>
            </div>
          </Flex>
        </SpaceBetween>
        ) : (
                <Flex flexDirection={'row'} style={{marginBottom: width <= 500 ? '20px' : earningToken.length === 1 && '17px'}}>
                  <Text fontSize='13px' fontWeight={500} color={4e7455} style={{width: '45%'}}>
                    {'Monthly Rewards:'}
                  </Text>
                  <Flex flexDirection={width >= 700 ? 'column' : 'row'} style={{textAlign: 'right', width: '60%',
                  display: width <= 700 && 'flex',
                  justifyContent: width <= 700 && 'flex-end'}}>
                  <RewardPerBlock tokens={earningToken} sousId={sousId} vaultAddress={vaultAddress} />
                  </Flex>
                </Flex>
                )}
      </div>
    );
};

export default CardHeading;
