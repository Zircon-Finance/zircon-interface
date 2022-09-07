import { BigNumber } from '@ethersproject/bignumber'
import { SerializedPoolConfig, PoolCategory } from './types'
import { serializedTokens } from './farms'
import { ChainId, Pylon, Token } from 'zircon-sdk'

export const MAX_LOCK_DURATION = 31536000
export const UNLOCK_FREE_DURATION = 604800
export const ONE_WEEK_DEFAULT = 604800
export const BOOST_WEIGHT = BigNumber.from('20000000000000')
export const DURATION_FACTOR = BigNumber.from('31536000')
const { MOONBASE } = ChainId

const pools: SerializedPoolConfig[] = [
  {
    sousId: 1,
    token1: serializedTokens.saturn,
    token2: serializedTokens.mars,
    isClassic: true,
    isAnchor: false,
    earningToken: [serializedTokens.saturn, serializedTokens.mars],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
        new Token(MOONBASE, serializedTokens.mars.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
        new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      )[0], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x8D8360F199e44508d6e4306cDeffc372eE0563dA',
    vaultAddress: '0xcd9f9004009E1E881824010b79078c7779CaCB30',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 2,
    token1: serializedTokens.saturn,
    token2: serializedTokens.mars,
    isClassic: false,
    isAnchor: true,
    earningToken: [serializedTokens.saturn, serializedTokens.mars],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      new Token(MOONBASE, serializedTokens.mars.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
      )[1], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x410EF548fD30423598eEb13114E60e8BE1747Ba9',
    vaultAddress: '0x30322352291A4fA97f73d5aaC7d3ec001fB99EF7',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 3,
    token1: serializedTokens.neptune,
    token2: serializedTokens.mercury,
    isClassic: false,
    isAnchor: false,
    earningToken: [serializedTokens.neptune, serializedTokens.mercury],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.neptune.symbol, serializedTokens.neptune.name),
      new Token(MOONBASE, serializedTokens.mercury.address, 18, serializedTokens.mercury.symbol, serializedTokens.mercury.name),
      )[0], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x9dB7793fF0C635B820e392Aa60738298C93472D4',
    vaultAddress: '0x55A2FCe6953afbf3BeF153eae5b9894f17C38D3c',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 4,
    token1: serializedTokens.neptune,
    token2: serializedTokens.mercury,
    isClassic: false,
    isAnchor: true,
    earningToken: [serializedTokens.neptune, serializedTokens.mercury],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.neptune.symbol, serializedTokens.neptune.name),
      new Token(MOONBASE, serializedTokens.mercury.address, 18, serializedTokens.mercury.symbol, serializedTokens.mercury.name),
      )[1], 18, 'ZPT', 'Zircon'),
    contractAddress: '0xCE8729F917554e6f42aF5A04f087D692c1D827EF',
    vaultAddress: '0x68e6A3600c516a9b6Bf7FB583042C5B77A1729b3',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  // {
  //   sousId: 5,
  //   token1: serializedTokens.mercury,
  //   token2: serializedTokens.neptune,
  //   isClassic: true,
  //   earningToken: serializedTokens.mercury,
  //   stakingToken: new Token(MOONBASE, Pair.getAddress(
  //     new Token(MOONBASE, serializedTokens.mercury.address, 18, serializedTokens.mercury.symbol, serializedTokens.mercury.name),
  //     new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.neptune.symbol, serializedTokens.neptune.name),
  //   ), 18, 'ZPT', 'Zircon'),
  //   contractAddress: '0x0cc88b625d53759b7f6d5b5c02135dbc67e2be90',
  //   poolCategory: PoolCategory.CORE,
  //   harvest: true,
  //   sortOrder: 1,
  //   isFinished: false,
  // },
]

// known finished pools
// const finishedPools = [
//   {
//     sousId: 278,
//     stakingToken: serializedTokens.cake,
//     earningToken: serializedTokens.pluto,
//     contractAddress: '0x82f94d4e56Af531fEB58BFDAFa1f9AA352787710',
//     poolCategory: PoolCategory.CORE,
//     harvest: true,
//     sortOrder: 999,
//     tokenPerBlock: '0.06794',
//     version: 3,
//     isFinished: true,
//   },
// ]
//   .map((p) => ({ ...p, isFinished: true }))

export default [...pools]
