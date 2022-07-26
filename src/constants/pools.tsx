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
    token1: serializedTokens.saturn,
    token2: serializedTokens.mars,
    isClassic: false,
    isAnchor: false,
    earningToken: [serializedTokens.earth, serializedTokens.jupiter],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      new Token(MOONBASE, serializedTokens.mars.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
      )[0], 18, 'ZPT', 'Zircon'),
    contractAddress: '0xB47fD62Fe0F5B71C88276D18464B39Ea53b7eD02',
    vaultAddress: '0xE4a2c69c8125f00551F12F2483fEF8e5A414aA17',
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
    earningToken: [serializedTokens.earth, serializedTokens.jupiter],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.saturn.address, 18, serializedTokens.saturn.symbol, serializedTokens.saturn.name),
      new Token(MOONBASE, serializedTokens.mars.address, 18, serializedTokens.mars.symbol, serializedTokens.mars.name),
      )[1], 18, 'ZPT', 'Zircon'),
    contractAddress: '0xd85371C379eF223BE4703C6B5c98b40EA45BD9E6',
    vaultAddress: '0x85f6f289ecf83C4ae05a6340C301947bfE69087a',
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
    earningToken: [serializedTokens.earth, serializedTokens.jupiter],
    stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
      new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.neptune.symbol, serializedTokens.neptune.name),
      new Token(MOONBASE, serializedTokens.mercury.address, 18, serializedTokens.mercury.symbol, serializedTokens.mercury.name),
      )[0], 18, 'ZPT', 'Zircon'),
    contractAddress: '0x484b1b67448135f9bf598Ffa2868F61A9D8BA28d',
    vaultAddress: '0x8f45Fb402B50D98c15c6C3217567C61D5df5E8a3',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  // {
  //   sousId: 4,
  //   token1: serializedTokens.neptune,
  //   token2: serializedTokens.mercury,
  //   isClassic: false,
  //   isAnchor: true,
  //   earningToken: [serializedTokens.earth, serializedTokens.jupiter],
  //   stakingToken: new Token(MOONBASE, Pylon.getLiquidityAddresses(
  //     new Token(MOONBASE, serializedTokens.neptune.address, 18, serializedTokens.neptune.symbol, serializedTokens.neptune.name),
  //     new Token(MOONBASE, serializedTokens.mercury.address, 18, serializedTokens.mercury.symbol, serializedTokens.mercury.name),
  //     )[1], 18, 'ZPT', 'Zircon'),
  //   contractAddress: '0x7e17376890d2AFB6Ce87E4606891c78961e16533',
  //   vaultAddress: '0x8258E6EC15769C218eE9C6E73fb2AEC152e644ce',
  //   poolCategory: PoolCategory.CORE,
  //   harvest: true,
  //   sortOrder: 1,
  //   isFinished: false,
  // },
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
