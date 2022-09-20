import {ChainId, Token} from 'zircon-sdk'
import {serializeToken} from '../state/user/hooks'
import {SerializedToken} from '../constants/types'

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
  movr: new Token(
    ChainId.MOONRIVER,
    '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
    18,
    'MOVR',
    'Wrapped MoonRiver',
  ),
  zrg: new Token(
    ChainId.MOONRIVER,
    '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B',
    18,
    'ZRG',
    'Zircon Gamma',
  ),
  tlos: new Token(MOONBASE, '0xb6C53431608E626AC81a9776ac3e999c5556717c', 18, 'TLOS', 'Telos'),
  saturn: new Token(MOONBASE, '0xe75F9ae61926FF1d27d16403C938b4cd15c756d5', 18, 'SAT', 'Saturn'),
  pluto: new Token(MOONBASE, '0x4c945cD20DD13168BC87f30D55f12dC26512ca33', 18, 'PLUT', 'Pluto'),
  neptune: new Token(MOONBASE, '0xed13b028697febd70f34cf9a9e280a8f1e98fd29', 18, 'NEPT', 'Neptune'),
  venus: new Token(MOONBASE, '0xcdf746c5c86df2c2772d2d36e227b4c0203cba25', 18, 'VEN', 'Venus'),
  mars: new Token(MOONBASE, '0x1fc56b105c4f0a1a8038c2b429932b122f6b631f', 18, 'MARS', 'Mars'),
  earth: new Token(MOONBASE, '0x08b40414525687731c23f430cebb424b332b3d35', 18, 'ERTH', 'Earth'),
  mercury: new Token(MOONBASE, '0x37822de108affdd5cdcfdaaa2e32756da284db85', 18, 'MERC', 'Mercury'),
  jupiter: new Token(MOONBASE, '0x9aac6fb41773af877a2be73c99897f3ddfacf576', 18, 'JUP', 'Jupiter'),
  uranus: new Token(MOONBASE, '0xd9224c102a73e5941abfcd645e08623dc4d182bc', 18, 'URAN', 'Uranus'),
  weth: new Token(MOONBASE, '0xD909178CC99d318e4D46e7E66a972955859670E1', 18, 'WETH', 'Wrapped Ether'),
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
