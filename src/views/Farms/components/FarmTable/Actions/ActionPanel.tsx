import React, { Dispatch, SetStateAction } from 'react'
import styled, { keyframes, css, useTheme } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Text } from '@pancakeswap/uikit'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { getAddress } from '../../../../../utils/addressHelpers'
// import { getBscScanLink } from 'utils'
import { FarmWithStakedValue } from '../../types'

import HarvestAction from './HarvestAction'
import StakedAction from './StakedAction'
import Apr, { AprProps } from '../Apr'
import { MultiplierProps } from '../Multiplier'
import Liquidity, { LiquidityProps } from '../Liquidity'
import { StakedProps } from '../Staked'
import DoubleCurrencyLogo from '../../../../../components/DoubleLogo'
import { BadgeSmall } from '../../../../../components/Header'
import { ButtonOutlined } from '../../../../../components/Button'
import { ArrowIcon } from '../Details'

export interface ActionPanelProps {
  apr: AprProps
  staked: StakedProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
  userDataReady: boolean
  expanded: boolean
  clickAction: Dispatch<SetStateAction<boolean>>
}

const expandAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const collapseAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const Container = styled.div<{ expanded }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: hidden;
  background: ${({ theme }) => theme.anchorFloatBadge};
  display: grid;
  width: 100%;
  padding: 5px;
  border-radius: 17px;
  grid-template-columns: 22% 22% 22% auto 40px;
  gap: 5px;
  position: relative;
`

export const StyledLinkExternal = styled.a`
  font-weight: 300;
  font-size: 13px;
  text-decoration: none;
  color: ${({ theme }) => theme.whiteHalf};
`

// const TagsContainer = styled.div`
//   display: flex;
//   align-items: center;
//   margin-top: 25px;


//   > div {
//     height: 24px;
//     padding: 0 6px;
//     font-size: 14px;
//     margin-right: 4px;

//     svg {
//       width: 14px;
//     }
//   }
// `

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
`

const QuarterContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ValueContainer = styled.div`
  display: block;
`

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0px;
`

export const SpaceBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ActionPanel: React.FunctionComponent<ActionPanelProps> = ({
  details,
  apr,
  liquidity,
  userDataReady,
  clickAction,
  expanded,
}) => {
  const farm = details

  const { t } = useTranslation()
  const { quoteToken, token } = farm
  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  // getLiquidityUrlPathParts({
  //   quoteTokenAddress: quoteToken.address,
  //   tokenAddress: token.address,
  // })
  const lpAddress = getAddress(farm.lpAddresses)
  const bsc = 'placeholder'
  // getBscScanLink(lpAddress, 'address')
  const info = `/info/pool/${lpAddress}`
  const theme = useTheme()

  return (
    <Container expanded={expanded}>
      <QuarterContainer>
        <ActionContainer style={{padding: '0 10px'}}>
          <SpaceBetween>
            <span>{token.name + '-' + quoteToken.name}</span>
            <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={25} />
          </SpaceBetween>
          <SpaceBetween>
            <BadgeSmall style={{fontSize: '13px',margin: '0'}}>{'ANCHOR'}</BadgeSmall>
            <span>{'High risk'}</span>
          </SpaceBetween>
          <SpaceBetween>
            <StyledLinkExternal color={theme.whiteHalf} href={bsc}>{t('View Contract ↗')}</StyledLinkExternal>
            <StyledLinkExternal color={theme.whiteHalf} href={info}>{t('See Pair Info ↗')}</StyledLinkExternal>
          </SpaceBetween>
          {/* <TagsContainer> */}
            {/* {farm.isCommunity ? <FarmAuctionTag /> : <CoreTag />} */}
            {/* {dual ? <DualTag /> : null} */}
          {/* </TagsContainer> */}
        </ActionContainer>
      </QuarterContainer>

      <QuarterContainer>
        <ActionContainer>
          <HarvestAction {...farm} userDataReady={userDataReady} />
        </ActionContainer>
      </QuarterContainer>

      <QuarterContainer>
        <ActionContainer>
          <StakedAction {...farm} userDataReady={userDataReady} lpLabel={lpLabel} displayApr={apr.value} />
        </ActionContainer>
      </QuarterContainer>

      <QuarterContainer style={{paddingLeft: '10px'}}>
        <ValueContainer>
          <ValueWrapper>
            <Text fontSize='13px' fontWeight={300}>{t('APR')}</Text>
            <Apr {...apr} />
          </ValueWrapper>
          <ValueWrapper>
            <Text fontSize='13px' fontWeight={300}>{t('Liquidity')}</Text>
            <Liquidity {...liquidity} />
          </ValueWrapper>
          <ButtonOutlined style={{padding: '10px', fontSize: '13px'}}>{`Get ${token.name} - ${quoteToken.name} Anchor LP`}</ButtonOutlined>
        </ValueContainer>
      </QuarterContainer>
      <QuarterContainer onClick={() => clickAction(false)} style={{justifyContent: 'center', alignItems: 'center', cursor: 'pointer'}}>
        <ArrowIcon toggled={expanded}  />
      </QuarterContainer>

    </Container>
  )
}

export default ActionPanel
