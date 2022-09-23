import React from 'react'
import styled from 'styled-components'
import ApyButton from '../FarmCard/ApyButton'
import BigNumber from 'bignumber.js'
import { Skeleton } from '@pancakeswap/uikit'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
// import { Skeleton } from '@pancakeswap/uikit'

export interface AprProps {
  value: string
  pid: number
  lpLabel: string
  lpSymbol: string
  tokenAddress?: string
  quoteTokenAddress?: string
  cakePrice: BigNumber
  originalValue: number
  hideButton?: boolean
  left?: boolean
  white? : boolean
}

const Container = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.text1};

  button {
    width: 20px;
    height: 20px;

    svg {
      path {
        fill: ${({ theme }) => theme.whiteHalf};
      }
    }
  }
`

const Apr: React.FC<AprProps> = ({
  value,
  left,
  pid,
  lpLabel,
  lpSymbol,
  tokenAddress,
  quoteTokenAddress,
  cakePrice,
  originalValue,
  hideButton = false,
  white,
}) => {
  // const liquidityUrlPathParts = getLiquidityUrlPathParts({ quoteTokenAddress, tokenAddress })
  const addLiquidityUrl = `placeholder`
  return value !== 'NaN' ? (
    <Container>
        <ApyButton
          variant={hideButton ? 'text' : 'text-and-button'}
          pid={pid}
          lpSymbol={lpSymbol}
          lpLabel={lpLabel}
          cakePrice={cakePrice}
          apr={originalValue}
          displayApr={value}
          addLiquidityUrl={addLiquidityUrl}
          white={white}
        />
    </Container>
  ) : (
    <Container>
      <Skeleton width={60} />
    </Container>
  )
}

export default Apr
