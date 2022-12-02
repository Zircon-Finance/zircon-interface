import {Currency, Token} from 'zircon-sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'
// import useHttpLocations from '../../hooks/useHttpLocations'
// import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'

export const getTokenLogoURL = (symbol: string) =>
    `https://raw.githubusercontent.com/Zircon-Finance/zircon-tokenlist/main/${symbol}/logo.png`
const getTokenLogoURL2 = (adddress: string) =>
    `https://raw.githubusercontent.com/solarbeamio/solarbeam-tokenlist/main/assets/moonriver/${adddress}/logo.png`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
                                       currency,
                                       size = '24px',
                                       style,
                                       chainId
                                     }: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
  chainId: number
}) {
  // const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)
  const srcs: string[] = useMemo(() => {
    return [getTokenLogoURL(currency?.symbol as string), getTokenLogoURL2(currency instanceof Token ? currency?.address as string : "")]
    //return [getTokenLogoURL(currency.address)]
  }, [currency])

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
