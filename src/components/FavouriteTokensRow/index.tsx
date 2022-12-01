import { IconButton } from '@pancakeswap/uikit';
import React from 'react'
import { Link } from 'react-router-dom';
import { Flex, Text } from 'rebass';
import { useTheme } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useCurrency } from '../../hooks/Tokens';
import { useChosenTokens } from '../../state/user/hooks';
import { AbsContainer } from '../../views/Farms/components/FarmTable/Liquidity';
import PlusIcon from '../../views/Farms/components/PlusIcon';
import CurrencyLogo from '../CurrencyLogo';
import RepeatIcon from '../RepeatIcon';
import { ArrowMarket, DialogContainer, StarFull } from '../TopTokensRow';

const FavTokensRow = ({token, index, topTokens, topTokensPrevious, handleSwap}) => {
    const currency = useCurrency(token)
    const [hoverPlus, setHoverPlus] = React.useState(false)
    const [hoverSwap, setHoverSwap] = React.useState(false)
    const {chainId} = useActiveWeb3React()
    const [hovered, setHovered] = React.useState(false);
    const tokenData = topTokens.find((t) => t.token.id === token)
    const tokenDataPrevious = topTokensPrevious.find((t) => t.token.id === token)
    const [,,removeChosenTokenCallback] = useChosenTokens();
    const changePercent = (((parseFloat(tokenData?.priceUSD) - parseFloat(tokenDataPrevious?.priceUSD)) / 
    parseFloat(tokenDataPrevious?.priceUSD)) * 100).toFixed(2);
    const theme = useTheme();

    const plusContent = (
      <DialogContainer style={{background: theme.slippageActive}} show={hoverPlus}>
        <Text style={{color: '#FFF'}} fontSize='13px'>
          {('Add liquidity')}
        </Text>
      </DialogContainer>
  )

  const swapContent = (
      <DialogContainer style={{right: '-10px', background: theme.slippageActive}} show={hoverSwap}>
        <Text style={{color: '#FFF'}} fontSize='13px'>
          {('Swap')}
        </Text>
      </DialogContainer>
  )

    const hoverContent = (
      <DialogContainer
        style={{
          background: theme.darkMode ? '#452632' : '#F5F3F4',
          display: "flex",
          top: "auto",
          right: "auto",
          alignItems: "center",
          fontSize: '16px',
        }}
        show={hovered}
      >
        <Flex
          onClick={() =>
            removeChosenTokenCallback(token)
          }
          style={{ cursor: "pointer", marginRight: "10px" }}
        >
          <StarFull />
        </Flex>
        <CurrencyLogo
          chainId = {chainId}
          key={index}
          currency={currency}
          size={"20px"}
          style={{ marginRight: "10px" }}
        />
        <Text mr="5px">{`${currency?.symbol}`}</Text>
        <Flex>
        <Flex
          style={{
            rotate: parseFloat(changePercent) >= 0 ? "180deg" : "0deg",
            display: changePercent === "NaN" ? "none" : "flex",
          }}
        >
          <ArrowMarket
            stroke={parseFloat(changePercent) >= 0 ? theme.darkMode ? '#5CB376' : "#2E8540" : "#E67066"}
          />
          </Flex>
          <Text
            style={{
              color: parseFloat(changePercent) >= 0 ? theme.darkMode ? '#5CB376' : "#2E8540" : "#E67066",
              alignSelf: "center",
            }}
          >
            {changePercent !== "NaN" ? `${changePercent}%` : "No Data (24H)"}
          </Text>
        </Flex>
        {
          <AbsContainer
            style={{ display: "flex", position: 'sticky' }}
            onMouseEnter={() => setHovered(true)}
          >
            <Link to={`/add-pro/${tokenData?.token.id}/`}>
              <IconButton
                style={{
                  background: hoverPlus ? '#B05D98' : theme.slippageActive,
                  boxShadow: "none",
                  width: "29px",
                  height: "29px",
                  borderRadius: "100%",
                  marginLeft: "10px",
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
            <Link onClick={() => handleSwap(currency)} to={`#`}>
              <IconButton
                style={{
                  background: hoverPlus ? '#B05D98' : theme.slippageActive,
                  width: "29px",
                  boxShadow: "none",
                  height: "29px",
                  borderRadius: "100%",
                  marginLeft: "10px",
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
          </AbsContainer>
        }
      </DialogContainer>
    );

  return (
    <Flex onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} alignItems='center'>
      {hovered && hoverContent}
      <CurrencyLogo key={index} 
        chainId = {chainId}
        currency={currency}
        size={'24px'} 
        style={{marginRight: '5px'}} />  
      <Text style={{marginRight: '5px', alignSelf: 'center'}}>{currency?.symbol}</Text>
      <Flex style={{rotate:parseFloat(changePercent) >= 0 ? '180deg' : '0deg', display: changePercent === 'NaN' ? 'none' : 'flex'}}>
        <ArrowMarket stroke={parseFloat(changePercent) >= 0 ? theme.darkMode ? '#5CB376' : '#2E8540' : '#E67066'} />
      </Flex>
      <Text style={{marginRight: '10px', color: parseFloat(changePercent) >= 0 ? theme.darkMode ? '#5CB376' : '#2E8540' : '#E67066'}}>
        {changePercent !== 'NaN' ? `${changePercent}%` : 'No Data (24H)'}
      </Text>
    </Flex>
  )
}

export default FavTokensRow