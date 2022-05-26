import { ChainId, Token } from 'zircon-sdk'
import { serializeToken } from '../state/user/hooks'
import { SerializedToken } from './types'

const { MOONBASE } = ChainId

interface TokenList {
  [symbol: string]: Token
}

const defineTokens = <T extends TokenList>(t: T) => t

export const mainnetTokens = defineTokens({
  wbnb: new Token(
    MOONBASE,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
  ),
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  bnb: new Token(MOONBASE, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'BNB', 'BNB'),
  cake: new Token(
    MOONBASE,
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    18,
    'CAKE',
    'PancakeSwap Token',
  ),
  busd: new Token(
    MOONBASE,
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    18,
    'CAKE',
    'PancakeSwap Token',
  ),
  tlos: new Token(MOONBASE, '0xb6C53431608E626AC81a9776ac3e999c5556717c', 18, 'TLOS', 'Telos'),
  saturn: new Token(MOONBASE, '0xe75F9ae61926FF1d27d16403C938b4cd15c756d5', 18, 'SAT', 'Saturn'),
  pluto: new Token(MOONBASE, '0x4c945cD20DD13168BC87f30D55f12dC26512ca33', 18, 'PLUT', 'Pluto'),
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
