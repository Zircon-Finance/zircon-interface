import React from "react";
import styled, { useTheme } from "styled-components";
import { Flex } from "@pancakeswap/uikit";
// import { Token } from 'zircon-sdk'
import DoubleCurrencyLogo from "../../../../components/DoubleLogo";
import { BadgeSmall } from "../../../../components/Header";
import { SerializedToken } from "../../../../constants/types";
import { Text } from "rebass";

import { useWindowDimensions } from "../../../../hooks";
import { RewardPerBlock } from "../../Farms";
import {EarningTokenInfo} from "../../../../state/types";

export interface ExpandableSectionProps {
    lpLabel?: string;
    multiplier?: string;
    isFinished: boolean;
    isCommunityFarm?: boolean;
    token: SerializedToken;
    quoteToken: SerializedToken;
    isClassic: boolean;
    isAnchor?: boolean;
    earningToken: SerializedToken[];
    earningTokenBlock: EarningTokenInfo[];
    gamma: any;
    healthFactor: string;
    sousId: number;
    vaultAddress: string;
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`;

const CardHeading: React.FC<ExpandableSectionProps> = ({
                                                           isClassic,
                                                           isAnchor,
                                                           isFinished,
                                                           earningToken,
                                                           token,
                                                           quoteToken,
                                                           gamma,
                                                           healthFactor,
                                                           sousId,
                                                           vaultAddress,
                                                           earningTokenBlock
                                                       }) => {
    const theme = useTheme();
    const {width} = useWindowDimensions()
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
                    width: 'max-content',
                  }}
                >
                  <span
                    style={{
                      color: theme.text1,
                      fontSize: "16px",
                      marginRight: "3px",
                      letterSpacing: "0",
                    }}
                  >
                    {!isAnchor ? token.symbol : quoteToken.symbol}{" "}
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
        {(
            !isFinished && <Flex flexDirection={'row'} style={{marginBottom: width <= 500 ? '20px' : earningToken.length === 1 && '17px'}}>
              <Text fontSize='13px' fontWeight={500} color={4e7455} style={{width: '45%'}} mb='10px'>
                {'Monthly rewards'}
              </Text>
              <Flex flexDirection={width >= 700 ? 'column' : 'row'} style={{textAlign: 'right', width: '60%',
              display: width <= 700 && 'flex',
              justifyContent: width <= 700 && 'flex-end'}}>
              <RewardPerBlock earningRewardsBlock={earningTokenBlock} />
              </Flex>
            </Flex>
            )}
      </div>
    );
};

export default CardHeading;
