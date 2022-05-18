import React from 'react'
import styled from 'styled-components'
// import { useFarmUser } from '../../../../state/farms/hooks'
import { useTranslation } from 'react-i18next'

import { Text } from '@pancakeswap/uikit'
import { Token } from 'zircon-sdk'
import { getBalanceNumber } from '../../../../utils/formatBalance'
import DoubleCurrencyLogo from '../../../../components/DoubleLogo'
import BigNumber from 'bignumber.js'

export interface FarmProps {
  label: string
  pid: number
  token: Token
  quoteToken: Token
  farmHealth: number
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

const Farm: React.FunctionComponent<FarmProps> = ({ token, quoteToken, label, pid }) => {
  // const { stakedBalance } = useFarmUser(pid)
  const stakedBalance = 1 as unknown as BigNumber
  const { t } = useTranslation()
  const rawStakedBalance = getBalanceNumber(stakedBalance)

  const handleRenderFarming = (): JSX.Element => {
    if (rawStakedBalance) {
      return (
        <Text color="secondary" fontWeight={300} fontSize="12px" bold textTransform="uppercase">
          {t('Farming')}
        </Text>
      )
    }

    return null
  }

  return (
    <Container>
      <TokenWrapper>
        <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={30} />
      </TokenWrapper>
      <div>
        {handleRenderFarming()}
        <Text fontWeight={300}>{label}</Text>
      </div>
    </Container>
  )
}

export default Farm
