import { Currency } from 'diffuse-sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'
import { useActiveWeb3React } from '../../hooks'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  bottom: 0px;
  position: absolute;
  left: ${({ sizeraw }) => (sizeraw).toString() + 'px'};
`

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false
}: DoubleCurrencyLogoProps) {
  const {chainId} = useActiveWeb3React()
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <HigherLogo chainId={chainId} currency={currency0} size={size.toString() + 'px'}  style={{marginRight: '5px'}}/>}
      {currency1 && <CoveredLogo chainId={chainId} currency={currency1} size={(size).toString() + 'px'} sizeraw={size} style={{position: 'absolute', left: size/2, bottom:0}} />}
    </Wrapper>
  )
}
