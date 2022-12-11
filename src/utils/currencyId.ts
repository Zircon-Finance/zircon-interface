import { Currency, NATIVE_TOKEN, Token } from 'zircon-sdk'

export function currencyId(currency: Currency, chainId: number): string {
  if (currency === NATIVE_TOKEN[chainId]) return NATIVE_TOKEN[chainId].symbol
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
