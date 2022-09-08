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
    token2: serializedTokens.neptune,
    isClassic: false,
    isAnchor: true,
    earningToken: [serializedTokens.saturn, serializedTokens.neptune],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
        new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
        new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      )[0], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x97758dE99949D6b6d16FD125EfB1c5c9733E96df',
    vaultAddress: '0xA6C455f27Fe16799792F4006Fa0E47566988dE4f',
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
    earningToken: [serializedTokens.saturn, serializedTokens.neptune],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
        new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
        new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      )[1], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x0F8B5729292f6cda3Be7295c5a68Ce06Eeb513b7',
    vaultAddress: '0x78967aecb314EA1E7aDd473249e6bcFDF4Dc5137',
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
