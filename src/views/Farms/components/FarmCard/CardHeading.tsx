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

export interface ExpandableSectionProps {
  lpLabel?: string;
  multiplier?: string;
  isCommunityFarm?: boolean;
  token: SerializedToken;
  quoteToken: SerializedToken;
  isClassic: boolean;
  isAnchor?: boolean;
  earningToken: SerializedToken;
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
}) => {
  const theme = useTheme();
  return (
    <div style={{ padding: "10px", marginBottom: "10px", color: theme.text1 }}>
      <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
        <Flex flexDirection="column" alignItems="flex-end">
          {!isClassic ? (
            !isAnchor ? (
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
                    {"FLOAT"}
                  </BadgeSmall>
                  <Text
                    color={theme.text1}
                    style={{ minWidth: "max-content" }}
                    fontWeight={400}
                  >{` - ${quoteToken.symbol}`}</Text>
                </Flex>
              </>
            ) : (
              <>
                <Flex flexWrap="wrap">
                  <Text
                    color={theme.text1}
                    style={{ minWidth: "max-content" }}
                    fontWeight={400}
                  >
                    {token.symbol} -
                  </Text>
                  <BadgeSmall
                    style={{
                      fontSize: "13px",
                      height: "23px",
                      alignSelf: "center",
                      marginLeft: "5px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: theme.text1,
                        fontSize: "16px",
                        marginRight: "3px",
                      }}
                    >{`${quoteToken.symbol}`}</span>
                    {"ANCHOR"}
                  </BadgeSmall>
                </Flex>
              </>
            )
          ) : (
            <Text
              color={theme.text1}
              style={{ minWidth: "max-content" }}
              fontWeight={400}
            >
              {token.symbol} - {quoteToken.symbol}
            </Text>
          )}
          {/* <Flex justifyContent="center">
          {multiplier ? (
            <MultiplierTag variant="secondary">{multiplier}</MultiplierTag>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex> */}
        </Flex>
        <DoubleCurrencyLogo
          currency0={token}
          currency1={quoteToken}
          size={26}
        />
      </Wrapper>
      <SpaceBetween>
        <Flex flexDirection={"column"}>
          <StyledLinkExternal
            style={{
              color: theme.meatPink,
              fontWeight: 500,
              marginBottom: "5px",
            }}
            href={"Placeholder"}
          >
            {"View Contract ↗"}
          </StyledLinkExternal>
          <StyledLinkExternal
            style={{ color: theme.meatPink, fontWeight: 500 }}
            href={"Placeholder"}
          >
            {"See Pair Info ↗"}
          </StyledLinkExternal>
        </Flex>
        <div>
          <p
            style={{ margin: "0", marginBottom: "5px" }}
          >{`Earn ${earningToken.symbol}`}</p>
          <p style={{ margin: "0", textAlign: "right" }}>{"254.15"}</p>
        </div>
      </SpaceBetween>
    </div>
  );
};

export default CardHeading;
