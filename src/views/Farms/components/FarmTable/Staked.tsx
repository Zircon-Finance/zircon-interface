import React, { Dispatch, SetStateAction } from 'react'
import styled, { css, keyframes, useTheme } from 'styled-components'
import {
    // HelpIcon,
    Text, Skeleton, IconButton } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import PlusIcon from '../PlusIcon'
import MinusIcon from '../MinusIcon'
import { Flex } from 'rebass'
import { useWindowDimensions } from '../../../../hooks'
import Balance from "../../../../components/Balance";

// const ReferenceElement = styled.div`
//   display: inline-block;
// `

export interface StakedProps {
    staked: BigNumber
    hovered: boolean
    setHovered: Dispatch<SetStateAction<boolean>>
    stakedBalancePool: number,
    stakedBalance: BigNumber,
    price: string
}

const LiquidityWrapper = styled.div`
  min-width: 110px;
  font-weight: 400;
  text-align: right;
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.lg} {
    text-align: left;
    margin-right: 0;
  }
  svg {
    pointer-events: none;
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`
export const expandAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`
export const collapseAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
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
  font-size: 13px;
`

const Staked: React.FunctionComponent<StakedProps> = ({ staked, hovered, setHovered, stakedBalance, stakedBalancePool, price }) => {
    const [hoverMinus, setHoverMinus] = React.useState(false)
    const [hoverPlus, setHoverPlus] = React.useState(false)
    const theme = useTheme()
    const { width } = useWindowDimensions()
    const plusContent = (
        <DialogContainer style={{left: '20px'}} show={hoverPlus}>
            <Text style={{color: '#FFF'}} fontSize='13px'>
                {('Stake')}
            </Text>
        </DialogContainer>
    )
    const minusContent = (
        <DialogContainer style={{right: '15px'}} show={hoverMinus}>
            <Text style={{color: '#FFF'}} fontSize='13px'>
                {('Unstake')}
            </Text>
        </DialogContainer>


    )
    const displayBalance =
        staked && staked.gt(0) ? (
            `${(new BigNumber(staked).div(stakedBalancePool).multipliedBy(stakedBalance).multipliedBy(price)).toFixed(1, BigNumber.ROUND_DOWN)}`
        ) : (
            <Skeleton width={60} />
        )
    return (
        <Container>
            <LiquidityWrapper>
                <Balance fontSize="16px" color={'#5ebe7b'} decimals={2} value={displayBalance} unit="" prefix="~ $" />

                {/*<Text style={{position: 'relative'}} textAlign={'left'} color={theme.text1}>{displayBalance} </Text>*/}
                {staked > new BigNumber(0) && hovered && width >= 1100 &&
                <div style={{display: 'flex', position: 'sticky', marginLeft: '5px', alignItems: 'center'}}
                     onMouseEnter={()=>setHovered(true)}>
                    <IconButton
                        style={{background: theme.hoveredButton, width: '29px', height: '28px', borderRadius: '100%', marginRight: '5px'}}
                        variant="tertiary"
                    >
                        <Flex
                            onMouseEnter={()=>[setHoverMinus(true), setHoverPlus(false)]}
                            onMouseLeave={()=>setHoverMinus(false)}>
                            <MinusIcon />
                        </Flex>
                    </IconButton>
                    {hoverMinus && minusContent}
                    <IconButton
                        style={{background: theme.hoveredButton, width: '29px', height: '28px', borderRadius: '100%'}}
                        variant="tertiary"
                    >
                        <Flex
                            onMouseEnter={()=>[setHoverPlus(true), setHoverMinus(false)]}
                            onMouseLeave={()=>setHoverPlus(false)}>
                            <PlusIcon/>
                        </Flex>
                    </IconButton>
                    {hoverPlus && plusContent}
                </div>}
            </LiquidityWrapper>
        </Container>
    )
}

export default Staked
