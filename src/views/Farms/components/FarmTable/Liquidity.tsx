import React, { Dispatch, SetStateAction } from 'react'
import styled, { css, useTheme } from 'styled-components'
import { IconButton, Skeleton, Text } from '@pancakeswap/uikit'
import { expandAnimation, collapseAnimation } from './Staked'
import PlusIcon from '../PlusIcon'
import { Link } from 'react-router-dom'
import { Flex } from 'rebass'
import { useWindowDimensions } from '../../../../hooks'
import { usePairLiquidity } from '../../../../state/pools/hooks'
import BigNumberJs from "bignumber.js";
import { formattedNum } from '../../../../utils/formatBalance'
import PlusIconMini from '../PlusIconMini'


export interface LiquidityProps {
  liquidity: number
  hovered: boolean
  setHovered: Dispatch<SetStateAction<boolean>>
  farm: any
  small?: boolean
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
  background: #B05D98;
  border-radius: 17px;
  padding: 10px;
  z-index: 1000;
  right: -30px;
  width: max-content;
  font-size: 13px;
`

export const AbsContainer = styled.div`
  position: absolute;
  z-index: 100;
  left: 120px;
  svg {
    pointer-events: none;
  }
`

export const LiqContainer = styled.div<{ show }>`
animation: ${({ show }) =>
  show
    ? css`
      ${expandAnimation} 200ms
    `
    : css`
      ${collapseAnimation} 300ms linear forwards
    `};
  position: absolute;
  z-index: 80;
  left: -15px;
  top: 30px;
  background: ${({ theme }) => theme.darkMode ? '#452632' : '#F5F3F4'};
  border-radius: 17px;
`

const Liquidity: React.FunctionComponent<LiquidityProps> = ({ liquidity, hovered, setHovered, farm, small}) => {
  // const displayLiquidity = liquidity && liquidity.gt(0) ? (
  //     `$${Number(liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  //   ) : (
  //     <Skeleton width={60} />
  //   )
  const theme = useTheme()
  const [hoverLiq, setHoverLiq] = React.useState(false)
  const { width } = useWindowDimensions()
  const [hoverPlus, setHoverPlus] = React.useState(false)
  const pylonLiquidity = new BigNumberJs(farm?.liquidity?.pair + farm?.liquidity?.pylon).toFixed(2)
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
    <Container onMouseEnter={() => setHoverLiq(true)} onMouseLeave={() => setHoverLiq(false)}>
      <LiquidityWrapper>
        <Text fontSize={small ? '13px' : "16px"} color={theme.text1}>
          {farm.isClassic
            ? pairLiquidity !== 'NaN' ? formattedNum(pairLiquidity, true) : <Skeleton width={60} />
            : pylonLiquidity !== 'NaN' ? formattedNum(pylonLiquidity, true) : <Skeleton width={60} />}
        </Text>
        {// liquidity.gt(0) &&
        hovered && width >= 1100 && (
          <>
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
                  background: '#B05D98',
                  width: "29px",
                  height: "28px",
                  borderRadius: "100%",
                  marginLeft: '5px',
                  boxShadow: 'none',
                }}
              >
                <Flex
                  onMouseEnter={() => (setHoverPlus(true), setHoverLiq(false))}
                  onMouseLeave={() => setHoverPlus(false)}
                >
                  <PlusIcon />
                </Flex>
              </IconButton>
            </Link>
            {hoverPlus && plusContent}
          </AbsContainer>
          {hoverLiq && <LiqContainer show={hoverLiq}>
            <Flex alignItems={'center'}>
              <Flex flexDirection='column' pl='15px' pb='10px' pr='5px'>
                <Text style={{color: theme.whiteHalf}} fontSize='12px'>
                  {('From pair')}
                </Text>
                <Text style={{color: theme.text1}} fontSize='13px'>
                  {formattedNum(farm.liquidity?.pair, true)}
                </Text>
              </Flex>
              <Flex><PlusIconMini /></Flex>
              <Flex flexDirection='column' pl='5px' pb='10px' pr='15px'>
                <Text style={{color: theme.whiteHalf}} fontSize='12px'>
                  {('From pylon')}
                </Text>
                <Text style={{color: theme.text1}} fontSize='13px'>
                  {formattedNum(farm.liquidity?.pylon, true)}
                </Text>
              </Flex>
            </Flex>
          </LiqContainer>}
          </>
        )}
      </LiquidityWrapper>
    </Container>
  );
}

export default Liquidity
