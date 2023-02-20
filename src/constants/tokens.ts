import {ChainId, Token} from 'zircon-sdk'
import {serializeToken} from '../state/user/hooks'
import {SerializedToken} from '../constants/types'

interface TokenList {
  [symbol: string]: Token
}

const defineTokens = <T extends TokenList>(t: T) => t

export const mainnetTokens = defineTokens({
  bnb: new Token(ChainId.BSC, '0x0000000000000000000000000000000000000000', 18, 'BNB', 'BNB'),
  wmovr: new Token(
    ChainId.MOONRIVER,
    '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
    18,
    'wMOVR',
    'Wrapped MoonRiver',
  ),
  movr: new Token(
    ChainId.MOONRIVER,
    '0x0000000000000000000000000000000000000000',
    18,
    'MOVR',
    'MoonRiver',
  )
} as const)

const tokens = () => {
  return mainnetTokens
}

const unserializedTokens = tokens()

type SerializedTokenList = Record<keyof typeof unserializedTokens, SerializedToken>

export const serializeTokens = () => {
  const serializedTokens = Object.keys(unserializedTokens).reduce((accum, key) => {
    return { ...accum, [key]: serializeToken(unserializedTokens[key]) }
  }, {} as SerializedTokenList)

  return serializedTokens
}

export default unserializedTokens
