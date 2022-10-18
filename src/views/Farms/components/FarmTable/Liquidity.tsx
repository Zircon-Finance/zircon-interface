import React, { Dispatch, SetStateAction } from 'react'
import styled, { css, useTheme } from 'styled-components'
import { IconButton, Skeleton, Text } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { expandAnimation, collapseAnimation } from './Staked'
import PlusIcon from '../PlusIcon'
import { Link } from 'react-router-dom'
import { Flex } from 'rebass'
import { useWindowDimensions } from '../../../../hooks'
import { usePairLiquidity } from '../../../../state/pools/hooks'
import BigNumberJs from "bignumber.js";
import { formattedNum } from '../../../../utils/formatBalance'


export interface LiquidityProps {
  liquidity: BigNumber
  hovered: boolean
  setHovered: Dispatch<SetStateAction<boolean>>
  farm: any
}

const LiquidityWrapper = styled.div`
  font-weight: 400;
  display: flex;
  align-items: center;
  font-size: 13px;
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

const DialogContainer = styled.div<{ show }>`
  animation: ${({ show }) =>
  show
    ? css`
        ${expandAnimation} 200ms
      `
    : css`
        ${collapseAnimation} 300ms linear forwards
      `};
  position: absolute;
  top: 40px;
  background: ${({ theme }) => theme.hoveredButton};
  border-radius: 17px;
  padding: 10px;
  z-index: 1000;
  right: -30px;
  width: max-content;
  font-size: 13px;
`

const AbsContainer = styled.div`
  position: sticky;
  z-index: 100;
  left: 50px;
  svg {
    pointer-events: none;
  }
`

const Liquidity: React.FunctionComponent<LiquidityProps> = ({ liquidity, hovered, setHovered, farm }) => {
  // const displayLiquidity = liquidity && liquidity.gt(0) ? (
  //     `$${Number(liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  //   ) : (
  //     <Skeleton width={60} />
  //   )
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const [hoverPlus, setHoverPlus] = React.useState(false)
  const pylonLiquidity = new BigNumberJs(farm.liquidity).toFixed(2)
    // console.log("chapo", farm.liquidity)
  const pairLiquidity = usePairLiquidity(farm.token1, farm.token2)
  const plusContent = (
      <DialogContainer show={hoverPlus}>
        <Text style={{color: '#FFF'}} fontSize='13px'>
          {('Add liquidity')}
        </Text>
      </DialogContainer>
  )

  return (
    <Container>
      <LiquidityWrapper>
        <Text fontSize="13px" color={theme.text1}>
          {farm.isClassic
            ? pairLiquidity !== 'NaN' ? formattedNum(pairLiquidity, true) : <Skeleton width={60} />
            : pylonLiquidity !== 'NaN' ? formattedNum(pylonLiquidity, true) : <Skeleton width={60} />}
        </Text>
        {// liquidity.gt(0) &&
        hovered && width >= 1100 && (
          <AbsContainer onMouseEnter={() => setHovered(true)}>
            <Link
              to={
                farm.isClassic
                  ? `/add/${farm.token1.address}/${farm.token2.address}`
                  : `/add-pro/${farm.token1.address}/${farm.token2.address}/${farm.isAnchor ? 'stable' : 'float'}`
              }
            >
              <IconButton
                style={{
                  background: theme.hoveredButton,
                  width: "29px",
                  height: "28px",
                  borderRadius: "100%",
                  marginLeft: '10px',
                }}
              >
                <Flex
                  onMouseEnter={() => setHoverPlus(true)}
                  onMouseLeave={() => setHoverPlus(false)}
                >
                  <PlusIcon />
                </Flex>
              </IconButton>
            </Link>
            {hoverPlus && plusContent}
          </AbsContainer>
        )}
      </LiquidityWrapper>
    </Container>
  );
}

export default Liquidity
