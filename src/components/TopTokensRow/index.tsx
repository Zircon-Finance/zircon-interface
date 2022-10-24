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

interface TokenRowProps {
    token: any;
    previousToken: any;
    index: number
    handleInput: any;
  }

const IconStyler = styled.div`
    &:hover {
        svg {
            path {
                stroke: #fff !important;
                }
        }
    }
    svg {
        path {
        stroke: ${({ theme }) => theme.pinkGamma} !important;
        stroke-width: 1.2;
        }
    }
`

const Row = styled.tr`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.opacitySmall};
    :last-child {
        border-bottom: none;
    }
`;

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 19V5" stroke={props.stroke} stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 12L12 5L19 12" stroke={props.stroke} stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
)

const StarEmpty = () => (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.00008 1.79564L11.1267 6.10399C11.1995 6.25142 11.3401 6.35365 11.5028 6.37742L16.2592 7.07265L12.8179 10.4245C12.6999 10.5394 12.6461 10.7049 12.6739 10.8672L13.486 15.6019L9.23281 13.3651C9.08712 13.2885 8.91305 13.2885 8.76736 13.3651L4.51417 15.6019L5.32622 10.8672C5.35405 10.7049 5.30022 10.5394 5.18228 10.4245L1.74095 7.07265L6.4974 6.37742C6.66007 6.35365 6.80067 6.25142 6.87344 6.10399L9.00008 1.79564Z" stroke="#B591CF" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
)

export const StarFull = () => (
    <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.00008 0.666016L11.5751 5.88268L17.3334 6.72435L13.1667 10.7827L14.1501 16.516L9.00008 13.8077L3.85008 16.516L4.83342 10.7827L0.666748 6.72435L6.42508 5.88268L9.00008 0.666016Z" fill="#B591CF"/>
    </svg>
)


export const TopTokensRow: React.FC<TokenRowProps> = (item) => {
    const [hovered, setHovered] = React.useState(false);
    const [hoverPlus, setHoverPlus] = React.useState(false)
    const [hoverSwap, setHoverSwap] = React.useState(false)
    const {token, previousToken, index, handleInput} = item;
    const currency = useCurrency(token.token.id)
    const theme = useTheme();
    const [chosenTokens, addChosenTokenCallback, removeChosenTokenFeedback] = useChosenTokens();
    const changePercent = (((parseFloat(token?.priceUSD) - parseFloat(previousToken?.priceUSD)) / parseFloat(previousToken?.priceUSD)) * 100).toFixed(2);

    const plusContent = (
        <DialogContainer style={{background: theme.pinkGamma}} show={hoverPlus}>
          <Text style={{color: '#FFF'}} fontSize='13px'>
            {('Add liquidity')}
          </Text>
        </DialogContainer>
    )

    const swapContent = (
        <DialogContainer style={{right: '-10px', background: theme.pinkGamma}} show={hoverSwap}>
          <Text style={{color: '#FFF'}} fontSize='13px'>
            {('Swap')}
          </Text>
        </DialogContainer>
    )

    return (
    <Row onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    style={{backgroundColor: hovered ? theme.cardExpanded : 'transparent', borderRadius: '17px'}}>  
    <TableData style={{width: '35%', marginLeft: '10px'}}>
        <Text
        style={{ width: "25px", alignSelf: "center" }}
        color={theme.whiteHalf}
        fontSize={"16px"}
        >
        {index + 1}
        </Text>
        <Flex style={{margin: '0 10px', cursor: 'pointer'}} onClick={()=> chosenTokens.includes(token.token.id) ? 
        removeChosenTokenFeedback(token.token.id) : addChosenTokenCallback(token.token.id)}>
            {chosenTokens.includes(token.token.id) ? <StarFull /> : <StarEmpty />}
        </Flex>
        <CurrencyLogo
        style={{ width: "30px", height: "30px", marginRight: "10px" }}
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
        style={{ alignSelf: "center", width: '100%' , textAlign: 'center'}}
        color={theme.text1}
        fontSize={"16px"}
        >
        {formattedNum(parseFloat(token.priceUSD).toFixed(5), true)}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ alignSelf: "center", display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center' }}
        color={parseFloat(changePercent) >= 0 ? '#479E34' : '#BC2929'}
        fontSize={"16px"}
        >
        <div style={{rotate:parseFloat(changePercent) >= 0 ? '0deg' : '180deg', height: '24px', width: '24px'}}>
            <ArrowMarket stroke={parseFloat(changePercent) >= 0 ? '#479E34' : '#BC2929'} />
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
    {hovered && <AbsContainer style={{display: 'flex'}} onMouseEnter={() => setHovered(true)}>
            <Link
              to={`/add-pro/${token.token.id}/`}
            >
              <IconButton
                style={{
                  background: hoverPlus ? theme.pinkGamma : theme.maxButtonHover,
                  boxShadow: 'none',
                  width: "29px",
                  height: "29px",
                  borderRadius: "100%",
                  marginLeft: '10px',
                }}
              >
                <Flex
                  onMouseEnter={() => setHoverPlus(true)}
                  onMouseLeave={() => setHoverPlus(false)}
                >
                  <IconStyler><PlusIcon /></IconStyler>
                </Flex>
              </IconButton>
            </Link>
            <Link
              onClick={() => handleInput(currency)}
              to={`#`}
            >
              <IconButton
                style={{
                  background: hoverSwap ? theme.pinkGamma : theme.maxButtonHover,
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
                  style={{rotate: '90deg', transform: 'scale(0.8)'}}
                >
                  <IconStyler style={{paddingRight: '3px', paddingTop: '3px'}}><RepeatIcon /></IconStyler>
                </Flex>
              </IconButton>
            </Link>
            {hoverPlus && plusContent}
            {hoverSwap && swapContent}
          </AbsContainer> }
    </TableData>
    </Row>
);}
