import React from 'react'
import styled, { useTheme } from 'styled-components'
// import { useFarmUser } from '../../../../state/farms/hooks'
// import { useTranslation } from 'react-i18next'

import { Text } from '@pancakeswap/uikit'
// import { getBalanceNumber } from '../../../../utils/formatBalance'
import DoubleCurrencyLogo from '../../../../components/DoubleLogo'
// import { useFarmUser } from '../../../../state/farms/hooks'
import { BadgeSmall } from '../../../../components/Header'
// import BigNumber from 'bignumber.js'
import { useWindowDimensions } from '../../../../hooks'
import { Flex } from 'rebass'
import { SerializedToken } from '../../../../constants/types'
import DaysLeftBar from '../../../../components/DaysLeftBar'

export interface FarmProps {
  label: string
  pid: number
  token: SerializedToken
  quoteToken: SerializedToken
  isAnchor: boolean
  isClassic: boolean
  earningToken: SerializedToken[]
  isFinished: boolean
  endBlock: number
  currentBlock: any
}

const Container = styled.div`
  padding-left: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  letter-spacing: 0.05em;

`

const TokenWrapper = styled.div`
  padding-right: 8px;
`

const Farm: React.FunctionComponent<FarmProps> = ({ token, quoteToken, label, pid, isAnchor, isClassic, endBlock, currentBlock }) => {
  const daysLeft = parseInt(((endBlock - currentBlock) / 6500).toFixed(0))
  const {width} = useWindowDimensions()
  const theme = useTheme()
  return (
    <Container>
      <TokenWrapper>
        {isClassic ? (
          <DoubleCurrencyLogo
            currency0={token}
            currency1={quoteToken}
            margin={false}
            size={width >= 500 ? 25 : 30}
          />
        ) : (
          <DoubleCurrencyLogo
            currency0={!isAnchor ? token : quoteToken}
            currency1={null}
            margin={false}
            size={30}
          />
        )}
      </TokenWrapper>
      <>
        <div>
          <Flex flexDirection={'column'}>
            <Flex flexDirection={"row"} style={{ rowGap: "5px" }}>
              <BadgeSmall
                style={{
                  fontSize: "13px",
                  height: "23px",
                  alignSelf: "center",
                  marginLeft: "0px",
                  marginRight: "5px",
                  display: "flex",
                  alignItems: "center",
                  width: 'max-content',
                }}
              >
                <span
                  style={{
                    color: theme.darkMode ? theme.text1 : "#080506",
                    fontSize: "16px",
                    marginRight: "3px",
                    fontWeight: 400,
                    letterSpacing: "0",
                  }}
                >
                  {!isClassic && (!isAnchor ? token.symbol : quoteToken.symbol)}{" "}
                  {isClassic ? "CLASSIC" : !isAnchor ? "Float" : "Stable"}
                </span>
              </BadgeSmall>
              <Text
                color={theme.whiteHalf}
                style={{ minWidth: "max-content" }}
                fontWeight={400}
                fontSize={"13px"}
              >{`${token.symbol}/${quoteToken.symbol}`}</Text>
            </Flex>
            <DaysLeftBar viewMode='card' daysLeft={daysLeft} />
          </Flex>
        </div>
      </>
    </Container>
  );
}

export default Farm
