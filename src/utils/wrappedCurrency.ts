import { ChainId, Currency, CurrencyAmount, NATIVE_TOKEN, Token, TokenAmount, WDEV } from 'diffuse-sdk'

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === NATIVE_TOKEN[chainId] ? WDEV[chainId] : currency as Token
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token: Token, chainId: number): Currency {
  if (token.equals(WDEV[token.chainId])) return NATIVE_TOKEN[chainId]
  return token
}
