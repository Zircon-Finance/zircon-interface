import { IconButton } from "@pancakeswap/uikit";
import React from "react";
import { Link } from "react-router-dom";
import { Flex, Text } from "rebass";
import styled, { css, keyframes, useTheme } from "styled-components";
import { useCurrency } from "../../hooks/Tokens";
import { useChosenTokens } from "../../state/user/hooks";
import { formattedNum } from "../../utils/formatBalance";
import { AbsContainer } from "../../views/Farms/components/FarmTable/Liquidity";
import PlusIcon from "../../views/Farms/components/PlusIcon";
import CurrencyLogo from "../CurrencyLogo";
import RepeatIcon from "../RepeatIcon";
import { PoolsContainer } from "../TopTokenPoolRow/containerPools";

interface TokenRowProps {
    token: any;
    previousToken: any;
    index: number
    handleInput: any;
    tokens: any[];
    pools: any;
  }

export const Row = styled.tr`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
`;

export const SkeletonTable = styled.td`
  display: flex;
  align-items: center;
  height: 68px;
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

export const DialogContainer = styled.div<{ show }>`
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
  right: 10px;
  width: max-content;
  font-size: 13px;
`

const TableData = styled.td`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 15%;
    height: 68px;
`

export const ArrowMarket = (props) => (
  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5.5 12L11.5 18L17.5 12" stroke={props.stroke}/>
  <rect x="11" y="4" width="1" height="14" fill={props.stroke}/>
  </svg>  
)
const StarEmpty = () => {
  const theme = useTheme()
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.00008 1.79564L11.1267 6.10399C11.1995 6.25142 11.3401 6.35365 11.5028 6.37742L16.2592 7.07265L12.8179 10.4245C12.6999 10.5394 12.6461 10.7049 12.6739 10.8672L13.486 15.6019L9.23281 13.3651C9.08712 13.2885 8.91305 13.2885 8.76736 13.3651L4.51417 15.6019L5.32622 10.8672C5.35405 10.7049 5.30022 10.5394 5.18228 10.4245L1.74095 7.07265L6.4974 6.37742C6.66007 6.35365 6.80067 6.25142 6.87344 6.10399L9.00008 1.79564Z" stroke={theme.darkMode ? theme.meatPink : "#968A90"} stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
)}

export const StarFull = () => {
  const theme = useTheme()
  return (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.00008 0.666016L11.5751 5.88268L17.3334 6.72435L13.1667 10.7827L14.1501 16.516L9.00008 13.8077L3.85008 16.516L4.83342 10.7827L0.666748 6.72435L6.42508 5.88268L9.00008 0.666016Z" fill={theme.darkMode ? theme.meatPink : "#968A90"}/>
    </svg>
)}


export const TopTokensRow: React.FC<TokenRowProps> = (item) => {
    const [hovered, setHovered] = React.useState(false);
    const [hoverPlus, setHoverPlus] = React.useState(false)
    const [hoverSwap, setHoverSwap] = React.useState(false)
    const [liquidityClick, setLiquidityClick] = React.useState(false)
    const {token, previousToken, index, handleInput, tokens, pools} = item;
    const currency = useCurrency(token.token.id)
    const theme = useTheme();
    const [chosenTokens, addChosenTokenCallback, removeChosenTokenFeedback] = useChosenTokens();
    const changePercent = (((parseFloat(token?.priceUSD) - parseFloat(previousToken?.priceUSD)) / parseFloat(previousToken?.priceUSD)) * 100).toFixed(2);
    const toggleLiquidityClick = () => {
      setLiquidityClick(!liquidityClick)
    }
    const scrollOptions = {
      top: 0, 
      left: 0, 
      behaviour: 'smooth' 
     }

    const plusContent = (
        <DialogContainer style={{background: theme.slippageActive}} show={hoverPlus}>
          <Text style={{color: '#FFF'}} fontSize='13px'>
            {('Add liquidity')}
          </Text>
        </DialogContainer>
    )

    const addLiquidityContent = (
      <DialogContainer style={{
          background: theme.darkMode ? '#583141' : '#FCFBFC', 
          boxShadow: !theme.darkMode && '0px 0px 25px rgba(40, 20, 29, 0.1)',
          right: '80px',
          top: '-290px'}} 
        show={liquidityClick}>
        <Text style={{color: theme.text1}} fontSize='16px' textAlign={'center'} my='10px'>
          {('Select liquidity pool')}
        </Text>
        <PoolsContainer mainToken={token} pools={pools} tokens={tokens} />
      </DialogContainer>
  )

    const swapContent = ( 
        <DialogContainer style={{right: '-10px', background: theme.slippageActive}} show={hoverSwap}>
          <Text style={{color: '#FFF'}} fontSize='13px'>
            {('Swap')}
          </Text>
        </DialogContainer>
    )

    return (
    <Row onMouseEnter={() => setHovered(true)} onMouseLeave={() => (setHovered(false), setLiquidityClick(false))}
    style={{
      backgroundColor: hovered ? theme.darkMode ? '#452632' : '#F5F3F4' : 'transparent', 
      borderRadius: '17px',
      }}>  
    <TableData style={{width: '35%', marginLeft: '10px'}}>
        <Text
        style={{ width: "25px", alignSelf: "center" }}
        color={theme.whiteHalf}
        fontSize={"16px"}
        >
        {index + 1}
        </Text>
        <Flex style={{margin: '0 5px', cursor: 'pointer'}} onClick={()=> chosenTokens?.includes(token.token.id) ? 
        removeChosenTokenFeedback(token.token.id) : addChosenTokenCallback(token.token.id)}>
            {chosenTokens?.includes(token.token.id) ? <StarFull /> : <StarEmpty />}
        </Flex>
        <CurrencyLogo
        style={{ width: "30px", height: "30px", marginRight: "5px" }}
        currency={currency}
        />
        <Text
        style={{alignSelf: "center", marginRight: '10px' }}
        color={theme.text1}
        fontSize={"16px"}
        >
        {token.token.symbol}
        </Text>
        <Text
        style={{ alignSelf: "center", textAlign: 'center'}}
        color={theme.whiteHalf}
        fontSize={"16px"}
        >
        {token.token.name}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ alignSelf: "center", width: '100%' , textAlign: 'left', marginLeft: '20px'}}
        color={theme.text1}
        fontSize={"16px"}
        >
        {formattedNum(parseFloat(token.priceUSD).toFixed(5), true)}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ alignSelf: "center", display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center' }}
        color={parseFloat(changePercent) >= 0 ? theme.darkMode ? '#5CB376' : '#2E8540' : '#E67066'}
        fontSize={"16px"}
        >
        <div style={{rotate:parseFloat(changePercent) >= 0 ? '180deg' : '0deg', height: '24px', width: '24px'}}>
            <ArrowMarket stroke={parseFloat(changePercent) >= 0 ? theme.darkMode ? '#5CB376' : '#2E8540' : '#E67066'} />
        </div>
        {changePercent !== 'NaN' ? `${changePercent}%` : 'No Data'}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ alignSelf: "center", width: '100%' , textAlign: 'center'}}
        color={theme.text1}
        fontSize={"16px"}
        >
        {formattedNum(parseFloat(token.dailyVolumeUSD).toFixed(2), true)}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ alignSelf: "center", width: '100%' , textAlign: 'center'}}
        color={theme.text1}
        fontSize={"16px"}
        >
        {formattedNum(parseFloat(token.totalLiquidityUSD).toFixed(2), true)}
        </Text>
    </TableData>
    <TableData style={{width: '10%'}}>
    {hovered && <AbsContainer style={{display: 'flex', position: 'sticky'}} onMouseEnter={() => setHovered(true)}>
            <Link
              to={`#`}
              onClick={() => toggleLiquidityClick()}
            >
              <IconButton
                style={{
                  background: hoverPlus ? '#B05D98' : theme.slippageActive,
                  boxShadow: 'none',
                  width: "29px",
                  height: "29px",
                  borderRadius: "100%",
                  marginLeft: '10px',
                  transform: liquidityClick ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out',
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
            <Link
              onClick={() => (handleInput(currency), window.scroll(scrollOptions))}
              to={`#`}
            >
              <IconButton
                style={{
                  background: hoverSwap ? '#B05D98' : theme.slippageActive,
                  width: "29px",
                  boxShadow: 'none',
                  height: "29px",
                  borderRadius: "100%",
                  marginLeft: '10px',
                }}
              >
                <Flex
                  onMouseEnter={() => setHoverSwap(true)}
                  onMouseLeave={() => setHoverSwap(false)}
                >
                  <RepeatIcon />
                </Flex>
              </IconButton>
            </Link>
            {hoverPlus && plusContent}
            {hoverSwap && swapContent}
            {liquidityClick && addLiquidityContent}
          </AbsContainer> }
    </TableData>
    </Row>
);}
