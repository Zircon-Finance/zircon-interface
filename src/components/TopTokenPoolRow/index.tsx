import Lottie from 'lottie-react-web';
import React from 'react'
import { NavLink } from 'react-router-dom';
import { Flex, Text } from 'rebass';
import { useTheme } from 'styled-components';
import { useCurrency } from '../../hooks/Tokens';
import DoubleCurrencyLogo from '../DoubleLogo';
import animationLight from '../../assets/lotties/circle_light.json';
import animationDark from '../../assets/lotties/circle_dark.json';

interface TokenRowProps {
    token1: any;
    token2: any;
    pool: boolean;
  }

export const PoolRowSmall:React.FC<TokenRowProps> = ({token1, token2, pool}) => {
    const currency0 = useCurrency(token1?.id)
    const currency1 = useCurrency(token2?.id)
    const theme = useTheme()
    const [hovered, setHovered] = React.useState(false)

  return (
    <NavLink 
      to={`/add-pro/${token1?.id}/${token2?.id}`}
      style={{textDecoration: 'none', backgroundColor: 'transparent', borderRadius: '17px'}}
    >
    <Flex
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{padding: '10px', 
              background: hovered ? theme.darkMode ? '#4F303B' : '#F2F0F1' : 'transparent', 
              borderRadius: '17px',
              alignItems: 'center',}}
      >
    <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} margin={true} />
    <Text color={theme.pinkBrown} fontWeight={500} fontSize={'16px'}> 
      {token1?.symbol} - {token2?.symbol}
    </Text>
    {pool && <Flex style={{width: 'auto'}} ml='auto'>
      <Lottie
        style={{width: "12px", height: "12px", borderWidth: 2, marginLeft: '15px'}}
        options={{
            animationData: theme.darkMode ? animationDark : animationLight,
        }}
      />
      <Text fontSize={'10px'} color={theme.darkMode ? '#5CB376' : '#287438'}>ACTIVE FARM</Text></Flex>}
  </Flex>
  </NavLink>
  ) 
}