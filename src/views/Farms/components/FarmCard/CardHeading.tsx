import React from "react";
import styled, { useTheme } from "styled-components";
import { Flex } from "@pancakeswap/uikit";
// import { Token } from 'zircon-sdk'
import DoubleCurrencyLogo from "../../../../components/DoubleLogo";
import { BadgeSmall } from "../../../../components/Header";
import {
  SpaceBetween,
  StyledLinkExternal,
} from "../FarmTable/Actions/ActionPanel";
import { SerializedToken } from "../../../../constants/types";
import { Text } from "rebass";

import QuestionMarkIcon from "../../../../components/QuestionMarkIcon";
import { QuestionMarkContainer, ToolTip } from "../FarmTable/Row";
import CapacityIndicatorSmall from "../../../../components/CapacityIndicatorSmall/index";

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
    healthFactor
}) => {
  const theme = useTheme();
  // const risk = gamma && (gamma.isLessThanOrEqualTo(0.7) || gamma.isGreaterThanOrEqualTo(0.5))
  const [hoverRisk, setHoverRisk] = React.useState(false);

  const TooltipContentRisk = () => {return (
    <ToolTip style={{left: '-200px'}} show={hoverRisk}>
      <Text fontSize='13px' fontWeight={500} color={theme.text1}>
        {`The risk factor keeps track of the farms' stability. `}
      </Text>
    </ToolTip>
  )}

  return (
    <div style={{ padding: "10px", marginBottom: "10px", color: theme.text1 }}>
      <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
        <Flex flexDirection="column" alignItems="flex-end">
              <>
                <Flex flexWrap="wrap">
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
                    {isClassic ? 'CLASSIC' : isAnchor ? "STABLE" : "FLOAT"}
                  </BadgeSmall>
                  <Text
                    color={theme.text1}
                    style={{ minWidth: "max-content" }}
                    fontWeight={400}
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
        {isClassic ? (
          <DoubleCurrencyLogo currency0={token} currency1={quoteToken} margin={false} size={26} />
          ) : (
          <DoubleCurrencyLogo currency0={!isAnchor ? token : quoteToken} currency1={null} margin={false} size={26} />
          )}
      </Wrapper>
      <SpaceBetween>
        <Flex flexDirection={"column"}>
          <StyledLinkExternal
            style={{
              color: theme.pinkBrown,
              fontWeight: 500,
              marginBottom: "5px",
            }}
            href={"Placeholder"}
          >
            {"View Contract ↗"}
          </StyledLinkExternal>
          <StyledLinkExternal
            style={{ color: theme.pinkBrown, fontWeight: 500 }}
            href={"Placeholder"}
          >
            {"See Pair Info ↗"}
          </StyledLinkExternal>
        </Flex>
        <Flex flexDirection={"column"}>
          <Text color={'#4e7455'} style={{textAlign: 'right'}}>{`Earn ${earningToken.map((token) => `${token.symbol}`)}`}</Text>
            <div style={{display: 'flex', marginLeft: '10px', alignItems: 'center'}}>
                                      <CapacityIndicatorSmall gamma={gamma} health={healthFactor} isFloat={!isAnchor} noSpan={true}/>

                <QuestionMarkContainer
                onMouseEnter={() => setHoverRisk(true)}
                onMouseLeave={() => setHoverRisk(false)}
              >
                  {hoverRisk && (
              <TooltipContentRisk />
              )}
              <QuestionMarkIcon />
              </QuestionMarkContainer>
            </div>
          </Flex>
      </SpaceBetween>
    </div>
  );
};

export default CardHeading;
