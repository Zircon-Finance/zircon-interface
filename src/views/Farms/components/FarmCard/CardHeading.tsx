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
import DaysLeftBar from "../../../../components/DaysLeftBar";
import { CONTRACT_ADDRESS_BASE } from "../../../../constants/lists";
import { StyledLinkExternal } from "../FarmTable/Actions/ActionPanel";
import { HealthFactorParams } from "../../../../state/mint/pylonHooks";

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
    healthFactor: HealthFactorParams;
    contractAddress: string;
    vaultAddress: string;
    endBlock: number;
    startBlock: number;
    currentBlock: any;
    lpAddress: string;
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
  earningTokenBlock,
  lpAddress,
  contractAddress,
  endBlock,
  startBlock,
  currentBlock
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
                
                <BadgeSmall
                  style={{
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
                  {isClassic ? "Classic" : isAnchor ? "Stable" : "Float"}
                </BadgeSmall>
                <Text
                  color={theme.whiteHalf}
                  style={{ minWidth: "max-content", display: 'flex', alignItems: 'center' }}
                  fontWeight={400}
                  fontSize={'13px'}
                >{`${token.symbol}-${quoteToken.symbol}`}</Text>
                </Flex>
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
                
              </Flex>
            </>
            {/* <Flex justifyContent="center">
          {multiplier ? (
            <MultiplierTag variant="secondary">{multiplier}</MultiplierTag>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex> */}
        {!isFinished && <DaysLeftBar currentBlock={currentBlock} endBlock={endBlock} startBlock={startBlock} viewMode={'tableView'} />}
          </Flex>
        </Wrapper>
        {(
            !isFinished && <Flex flexDirection={'row'} style={{marginBottom: width <= 500 ? '20px' : '0px'}}>
              <Text fontSize='13px' fontWeight={400} color={4e7455} style={{width: '45%'}} mb='10px'>
                {'Monthly rewards'}
              </Text>
              <Flex flexDirection={width >= 700 ? 'column' : 'row'} style={{textAlign: 'right', width: '60%',
              display: width <= 700 && 'flex',
              justifyContent: width <= 700 && 'flex-end', marginBottom: '5px'}}>
              <RewardPerBlock earningRewardsBlock={earningTokenBlock} />
              </Flex>
            </Flex>
            )}
          <Flex justifyContent={'space-between'} style={{borderTop: `1px solid ${theme.opacitySmall}`, paddingTop: '10px'}}>
          <StyledLinkExternal
            style={{ color: theme.pinkBrown, fontWeight: 500, marginRight: '10px' }}
            href={CONTRACT_ADDRESS_BASE+lpAddress}
          >
            {"See Pair Info ↗"}
          </StyledLinkExternal>
          <StyledLinkExternal
            style={{
              color: theme.pinkBrown,
              fontWeight: 500,
            }}
            href={CONTRACT_ADDRESS_BASE+contractAddress}
          >
            {"View Contract ↗"}
          </StyledLinkExternal>
        </Flex>
      </div>
    );
};

export default CardHeading;
