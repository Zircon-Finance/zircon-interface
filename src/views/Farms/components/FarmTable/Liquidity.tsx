import React from 'react'
import styled from 'styled-components'
import { 
  IconButton,
  Skeleton,
  // HelpIcon, 
  Text, useTooltip } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import PlusIcon from '../PlusIcon'

// const ReferenceElement = styled.div`
//   display: inline-block;
// `

export interface LiquidityProps {
  liquidity: BigNumber
  hovered: boolean
}

const LiquidityWrapper = styled.div`
  font-weight: 400;
  display: flex;
  align-items: center;
  position: relative;
  ${({ theme }) => theme.mediaQueries.lg} {
    text-align: left;
    margin-right: 0;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

const Liquidity: React.FunctionComponent<LiquidityProps> = ({ liquidity, hovered }) => {
  const displayLiquidity = liquidity && liquidity.gt(0) ? (
      `$${Number(liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    ) : (
      <Skeleton width={60} />
    )
  const { t } = useTranslation()
  const { 
    // targetRef, 
    tooltip, tooltipVisible } = useTooltip(
    t('Total value of the funds in this farm’s liquidity pool'),
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  return (
    <Container>
      <LiquidityWrapper>
        <Text>{displayLiquidity}</Text>
        { liquidity.gt(0) && hovered && 
        <div style={{position: 'absolute', left: '60px'}}>
          <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary">
          <PlusIcon />
          </IconButton>
        </div>}
      </LiquidityWrapper>
      {/* <ReferenceElement ref={targetRef}>
        <HelpIcon color="textSubtle" />
      </ReferenceElement> */}
      {tooltipVisible && tooltip}
    </Container>
  )
}

export default Liquidity
