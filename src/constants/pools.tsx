import { BigNumber } from '@ethersproject/bignumber'
// import Trans from 'components/Trans'
// import { VaultKey } from 'state/types'

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
    token1: serializedTokens.pluto,
    token2: serializedTokens.saturn,
    isClassic: false,
    isAnchor: true,
    earningToken: serializedTokens.pluto,
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.pluto.address, 18, serializedTokens.pluto.symbol, serializedTokens.pluto.name), 
      new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name), 
      )[1], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x81e5e97cea6065d6cfc0dc803abd9f7034c95f50',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '10',
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 2,
    token1: serializedTokens.neptune,
    token2: serializedTokens.pluto,
    isClassic: false,
    isAnchor: false,
    earningToken: serializedTokens.pluto,
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.neptune.symbol, serializedTokens.neptune.name), 
      new Token(MOONBASE, serializedTokens.pluto.address, 18, serializedTokens.pluto.symbol, serializedTokens.pluto.name), 
      )[0], 18, 'ZPT', 'Zircon'),
    contractAddress: '0xf57b099afcd4dac91ac0ee3577244c5792f9e376',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '10',
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 3,
    token1: serializedTokens.neptune,
    token2: serializedTokens.pluto,
    isClassic: false,
    isAnchor: true,
    earningToken: serializedTokens.pluto,
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.neptune.symbol, serializedTokens.neptune.name), 
      new Token(MOONBASE, serializedTokens.pluto.address, 18, serializedTokens.pluto.symbol, serializedTokens.pluto.name), 
      )[1], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x6a59351eef0407aca99c337b26f182c62a3ce8e0',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '10',
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
