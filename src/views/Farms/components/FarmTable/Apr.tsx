import React from 'react'
import styled, { useTheme } from 'styled-components'
import ApyButton from '../FarmCard/ApyButton'
import BigNumber from 'bignumber.js'
import { Skeleton } from '@pancakeswap/uikit'
import { LiqContainer } from './Liquidity'
import { Flex, Text } from 'rebass'
import PlusIconMini from '../PlusIconMini'
import { useWindowDimensions } from '../../../../hooks'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
// import { Skeleton } from '@pancakeswap/uikit'

export interface AprProps {
  value: string
  baseApr?: number
  feesApr?: number
  contractAddress: string
  lpLabel: string
  lpSymbol: string
  cakePrice: BigNumber
  originalValue: number
  hideButton?: boolean
  left?: boolean
  white? : boolean
  showHover?: boolean
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
  contractAddress,
  lpLabel,
  lpSymbol,
  cakePrice,
  originalValue,
  hideButton = false,
  baseApr,
  feesApr,
  showHover=true,
  white,
}) => {
  const addLiquidityUrl = `placeholder`
  const [hoverApr, setHoverApr] = React.useState(false)
  const theme = useTheme()
  const {width} = useWindowDimensions()
  return value !== 'NaN' ? (
    <Container onMouseEnter={() => setHoverApr(true)} onMouseLeave={() => setHoverApr(false)}>
        <ApyButton
          variant={hideButton ? 'text' : 'text-and-button'}
          contractAddress={contractAddress}
          lpSymbol={lpSymbol}
          lpLabel={lpLabel}
          cakePrice={cakePrice}
          apr={originalValue}
          displayApr={value}
          addLiquidityUrl={addLiquidityUrl}
          white={white}
        />
        {(hoverApr && width >= 1000 && showHover) && <LiqContainer style={{top: '50px'}} show={hoverApr}>
            <Flex alignItems={'center'}>
              <Flex flexDirection='column' pl='15px' pb='10px' pr='5px'>
                <Text style={{color: theme.whiteHalf}} fontSize='12px'>
                  {('Base APR')}
                </Text>
                <Text style={{color: theme.text1}} fontSize='13px'>
                  {`${baseApr.toFixed(0)}%`}
                </Text>
              </Flex>
              <Flex><PlusIconMini /></Flex>
              <Flex flexDirection='column' pl='5px' pb='10px' pr='15px'>
                <Text style={{color: theme.whiteHalf}} fontSize='12px'>
                  {('Fees APR')}
                </Text>
                <Text style={{color: theme.text1}} fontSize='13px'>
                {`${feesApr.toFixed(0)}%`}
                </Text>
              </Flex>
            </Flex>
          </LiqContainer>}
    </Container>
  ) : (
    <Container>
      <Skeleton width={60} />
    </Container>
  )
}

export default Apr
