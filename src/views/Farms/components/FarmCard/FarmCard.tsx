import React from 'react'
import BigNumber from 'bignumber.js'
import styled, { useTheme } from 'styled-components'
import { Card, Flex, Text, Skeleton } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import CardHeading from './CardHeading'
import { FarmWithStakedValue } from '../types'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'
import { ButtonOutlined } from '../../../../components/Button'
import { SpaceBetween, StyledLinkExternal } from '../FarmTable/Actions/ActionPanel'

const StyledCard = styled(Card)`
  align-self: baseline;
  max-width: 100%;
  margin: 0 0 24px 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-width: 350px;
    margin: 0 12px 46px;
  }
`

const FarmCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 10px;
`



interface FarmCardProps {
  farm: FarmWithStakedValue
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: string
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, displayApr, removed, cakePrice, account }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  // const totalValueFormatted =
  //   farm.liquidity && farm.liquidity.gt(0)
  //     ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  //     : ''

  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const addLiquidityUrl = `placeholder`
  const isPromotedFarm = farm.token.symbol === 'CAKE'

  return (
    <StyledCard isActive={isPromotedFarm}>
      <FarmCardInnerContainer>
        <CardHeading
          lpLabel={lpLabel}
          multiplier={farm.multiplier}
          isCommunityFarm={farm.isCommunity}
          token={farm.token}
          quoteToken={farm.quoteToken}
        />
        <CardActionsContainer
          farm={farm}
          lpLabel={lpLabel}
          account={account}
          addLiquidityUrl={addLiquidityUrl}
          displayApr={displayApr}
        />
        {!removed && (
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize='13px'>{t('APR')}:</Text>
            <Text fontSize='13px' style={{ display: 'flex', alignItems: 'center' }}>
              {farm.apr ? (
                <ApyButton
                  variant="text-and-button"
                  pid={farm.pid}
                  lpSymbol={farm.lpSymbol}
                  multiplier={farm.multiplier}
                  lpLabel={lpLabel}
                  addLiquidityUrl={addLiquidityUrl}
                  cakePrice={cakePrice}
                  apr={farm.apr}
                  displayApr={displayApr}
                />
              ) : (
                <Skeleton height={24} width={80} />
              )}
            </Text>
          </Flex>
        )}
        <Flex mt='10px' justifyContent="space-between">
          <Text fontSize='13px'>{t('Liquidity')}:</Text>
          <Text fontSize='13px'>{farm.liquidity.toNumber()}</Text>
        </Flex>
        <ButtonOutlined mt='20px' style={{padding: '10px', fontSize: '13px'}}>{`Get ${farm.token.name} - ${farm.quoteToken.name} Anchor LP`}</ButtonOutlined>
        <SpaceBetween style={{marginTop:'20px'}}>
            <StyledLinkExternal color={theme.whiteHalf} href={'Placeholder'}>{t('View Contract ↗')}</StyledLinkExternal>
            <StyledLinkExternal color={theme.whiteHalf} href={'Placeholder'}>{t('See Pair Info ↗')}</StyledLinkExternal>
          </SpaceBetween>
      </FarmCardInnerContainer>
    </StyledCard>
  )
}

export default FarmCard