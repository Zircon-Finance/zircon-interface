import React from 'react'
import styled from 'styled-components'
// import { useFarmUser } from '../../../../state/farms/hooks'
// import { useTranslation } from 'react-i18next'

import { Text } from '@pancakeswap/uikit'
import { Token } from 'zircon-sdk'
// import { getBalanceNumber } from '../../../../utils/formatBalance'
import DoubleCurrencyLogo from '../../../../components/DoubleLogo'
import { useFarmUser } from '../../../../state/farms/hooks'
import { BadgeSmall } from '../../../../components/Header'
import BigNumber from 'bignumber.js'
import { useWindowDimensions } from '../../../../hooks'
import { Flex } from 'rebass'

export interface FarmProps {
  label: string
  pid: number
  token: Token
  quoteToken: Token
  farmHealth: number
  isAnchor: boolean
}

const Container = styled.div`
  padding-left: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

`

const TokenWrapper = styled.div`
  padding-right: 8px;
`

const Farm: React.FunctionComponent<FarmProps> = ({ token, quoteToken, label, pid, isAnchor }) => {
  const { stakedBalance } = useFarmUser(pid)
  // const { t } = useTranslation()
  // const rawStakedBalance = getBalanceNumber(stakedBalance)

  const handleRenderFarming = (): JSX.Element => {
    // if (rawStakedBalance) {
    //   return (
    //     <Text color="secondary" fontWeight={300} fontSize="12px" bold textTransform="uppercase">
    //       {t('Farming')}
    //     </Text>
    //   )
    // }

    return null
  }

  const {width} = useWindowDimensions()

  return (
    <Container>
      <TokenWrapper>
        <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={width <= 500 ? 25 : 30} />
      </TokenWrapper>
      { width >= 500 ? (
        <>
          <div>
          {handleRenderFarming()}
          <Text style={{minWidth: 'max-content'}} fontWeight={400}>{label}</Text>
          </div>
          <BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '10px'}}>
          {stakedBalance > new BigNumber(0) ? 'ANCHOR' : 'FLOAT'}
          </BadgeSmall>
        </>
      ) : (
        <>
          <div>
          {isAnchor ? (
            <>
            <Flex>  
              <BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '10px'}}>
              <span style={{color: '#fff', fontSize: '16px'}}>{token.symbol} </span>{'ANCHOR'}
              </BadgeSmall>
              <Text fontWeight={400}>{` - ${quoteToken.symbol}`}</Text>
            </Flex>
              
            </>
          ) : (
            <>
            <Flex>
              <Text fontWeight={400}>{token.symbol} -</Text>
              <BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '10px'}}>
                <span style={{color: '#fff', fontSize: '16px'}}>{`${quoteToken.symbol} `}</span>{'FLOAT'}
              </BadgeSmall>
            </Flex>
              
            </>
          )}
          </div>
        </>
      
      )}
    </Container>
  )
}

export default Farm
