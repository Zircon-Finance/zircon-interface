import {Currency, DEV, Token} from 'zircon-sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import MovrLogo from '../../assets/images/movr-logo.png'
// import useHttpLocations from '../../hooks/useHttpLocations'
// import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'

export const getTokenLogoURL = (symbol: string) =>
    `https://raw.githubusercontent.com/Zircon-Finance/zircon-tokenlist/main/${symbol}/logo.png`
const getTokenLogoURL2 = (adddress: string) =>
    `https://raw.githubusercontent.com/solarbeamio/solarbeam-tokenlist/main/assets/moonriver/${adddress}/logo.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
                                       currency,
                                       size = '24px',
                                       style
                                     }: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  // const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)
  const srcs: string[] = useMemo(() => {
    if (currency === DEV) return []

    return [getTokenLogoURL(currency?.symbol as string), getTokenLogoURL2(currency instanceof Token ? currency?.address as string : "")]
    //return [getTokenLogoURL(currency.address)]
  }, [currency])

  if (currency === DEV) {
    return <StyledEthereumLogo src={MovrLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
