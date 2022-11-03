import React from 'react'
import { Flex } from 'rebass';
import {PoolRowSmall} from './index'

interface ContainerProps {
    mainToken: any;
    tokens: any[];
    pools: any[];
  }

export const PoolsContainer:React.FC<ContainerProps> = ({mainToken, tokens, pools}) => {
  const tokensForPools = tokens.filter((token) => token?.token?.symbol !== mainToken?.token?.symbol)
  return (
    <Flex flexDirection={'column'}>
    {tokensForPools.map((token) => (
        <PoolRowSmall
          key={token?.token?.id}
          token1={mainToken}
          token2={token} 
          pool={pools.filter((pool) => 
            pool?.token1?.symbol === (mainToken?.token?.symbol === 'WMOVR' ? 'MOVR' : mainToken?.token?.symbol) && 
            pool?.token2?.symbol === (token?.token?.symbol === 'WMOVR' ? 'MOVR' : token?.token?.symbol) && 
            pool?.isFinished === false).length > 0}
        />
        ))
      }
    </Flex>
  )
}
