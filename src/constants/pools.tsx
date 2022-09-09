import { BigNumber } from '@ethersproject/bignumber'
import { SerializedPoolConfig, PoolCategory } from './types'
import { serializedTokens } from './farms'
import { ChainId, Pair, Pylon, Token } from 'zircon-sdk'

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
    token2: serializedTokens.neptune,
    isClassic: false,
    isAnchor: true,
    earningToken: [serializedTokens.weth, serializedTokens.neptune],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
        new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
        new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      )[1], 18, 'ZPT', 'Zircon'),
    contractAddress: '0xd81dAa71Db5dfB680d834D11A60a51df681804E1',
    vaultAddress: '0xB01F64d5A64A71577B3e4f021Ae64e99ee65507f',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 2,
    token1: serializedTokens.saturn,
    token2: serializedTokens.neptune,
    isClassic: false,
    isAnchor: false,
    earningToken: [serializedTokens.weth],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
        new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
        new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      )[0], 18, 'ZPT', 'Zircon'),
    contractAddress: '0xE31c876532Dce4DB1458E0C2D5fb6938B3e3daa9',
    vaultAddress: '0x1C2d5c9e5F632Ab365F56440730D281d7860B2c3',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 3,
    token1: serializedTokens.weth,
    token2: serializedTokens.earth,
    isClassic: true,
    isAnchor: false,
    earningToken: [serializedTokens.earth],
    stakingToken: new Token(MOONBASE, Pair.getAddress(
        new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
        new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      ), 18, 'ZPT', 'Zircon'),
    contractAddress: '0x9A249f872755E5e29C731A440728aF787531319a',
    vaultAddress: '0x746F9703D1bc7AC4f436C467E908a7D7476D82b1',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
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
