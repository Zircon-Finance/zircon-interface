import React from 'react'
import { Flex, Text } from 'rebass';
import { useCurrency } from '../../hooks/Tokens';
import CurrencyLogo from '../CurrencyLogo';
import { ArrowMarket } from '../TopTokensRow';

const FavTokensRow = ({token, index, topTokens, topTokensPrevious}) => {
    const currency = useCurrency(token)
    const tokenData = topTokens.find((t) => t.token.id === token)
    const tokenDataPrevious = topTokensPrevious.find((t) => t.token.id === token)
    const changePercent = (((parseFloat(tokenData?.priceUSD) - parseFloat(tokenDataPrevious?.priceUSD)) / 
    parseFloat(tokenDataPrevious?.priceUSD)) * 100).toFixed(2);
  return (
    <Flex>
      <CurrencyLogo key={index} 
        currency={currency}
        size={'24px'} 
        style={{marginRight: '5px'}} />  
      <Text style={{marginRight: '5px'}}>{tokenData?.symbol}</Text>
      <Flex style={{marginRight: '5px', rotate:parseFloat(changePercent) >= 0 ? '0deg' : '180deg', display: changePercent === 'NaN' ? 'none' : 'flex'}}>
        <ArrowMarket stroke={parseFloat(changePercent) >= 0 ? '#479E34' : '#BC2929'} />
      </Flex>
      <Text style={{marginRight: '10px', color: parseFloat(changePercent) >= 0 ? '#479E34' : '#BC2929'}}>
        {changePercent !== 'NaN' ? `${changePercent}%` : 'No Data (24H)'}
      </Text>
    </Flex>
  )
}

export default FavTokensRow