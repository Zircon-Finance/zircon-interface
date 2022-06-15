import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Flex, Heading } from '@pancakeswap/uikit'
// import { Token } from 'zircon-sdk'
import DoubleCurrencyLogo from '../../../../components/DoubleLogo'
import { BadgeSmall } from '../../../../components/Header'
import { SpaceBetween } from '../FarmTable/Actions/ActionPanel'
import { SerializedToken } from '../../../../constants/types'

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  isCommunityFarm?: boolean
  token: SerializedToken
  quoteToken: SerializedToken
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`

const CardHeading: React.FC<ExpandableSectionProps> = ({ lpLabel, multiplier, isCommunityFarm, token, quoteToken }) => {
  const theme = useTheme()
  return (
    <div style={{padding: '10px', color: theme.text1}}>
      <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
      <Flex flexDirection="column" alignItems="flex-end">
        <Heading color={theme.text1} style={{fontSize:'16px', fontWeight:'300', margin: '0'}} mb="0px">{lpLabel.split(' ')[0]}</Heading>
        {/* <Flex justifyContent="center">
          {multiplier ? (
            <MultiplierTag variant="secondary">{multiplier}</MultiplierTag>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex> */}
      </Flex>
      <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={26} />
      </Wrapper>
      <SpaceBetween>
          <BadgeSmall style={{margin: '0', fontSize: '14px'}}>{'ANCHOR'}</BadgeSmall>
          <p style={{margin: '10px 0'}}>{'254.15'}</p>
      </SpaceBetween>
    </div>
    
  )
}

export default CardHeading
