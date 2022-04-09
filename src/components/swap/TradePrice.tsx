import React from 'react'
import { Price } from 'zircon-sdk'
import RepeatIcon from '../RepeatIcon'
import { Text } from 'rebass'
import { useTheme } from 'styled-components'
import { StyledBalanceMaxMini } from './styleds'

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const theme = useTheme()

  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`
    : `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`

  return (
    <Text
      fontWeight={400}
      fontSize={14}
      color={theme.text2}
      style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}
    >
      {show ? (
        <>
          {formattedPrice ?? '-'} {label}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <RepeatIcon />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
