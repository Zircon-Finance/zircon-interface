import { BigNumber } from '@ethersproject/bignumber'
import { SerializedPoolConfig, PoolCategory } from './types'
import { ChainId, Token } from 'zircon-sdk'

export const MAX_LOCK_DURATION = 31536000
export const UNLOCK_FREE_DURATION = 604800
export const ONE_WEEK_DEFAULT = 604800
export const BOOST_WEIGHT = BigNumber.from('20000000000000')
export const DURATION_FACTOR = BigNumber.from('31536000')
const { MOONRIVER } = ChainId

const pools: SerializedPoolConfig[] = [
  {
    token1: new Token(ChainId.MOONRIVER, '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B', 18, '1SWAP', '1Swap'),
    token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
                  new Token(MOONRIVER, '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B', 18, '1SWAP', '1Swap'),],
    stakingToken: new Token(MOONRIVER, '0x99A26474EA98dA5223107061C50A423C6425d7Fd', 18, 'ZPT', 'Zircon Pool Token'),
    sousId: 1,
    contractAddress: '0x915C5248A7a37ea26A81CCBFDD13a85dBA712273',
    vaultAddress: '0x913201f0A4c7EC13f34F80D36cf0782cA8aBbd3a',
    lpAddress: "0x769358518DdBc986fde6d9F03166228DF40df496",
    pylonAddress: "0x1aCE9Be8AF59D7Fc7dC68C7CEfb5c9aFf9260275",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 2,
    token1: new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
    token2: new Token(MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USD Coin'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B', 18, '1SWAP', '1Swap Token')],
    stakingToken: new Token(MOONRIVER, '0xa22451B59d48eB0Ab6A7350A68c2Ceb542FceEd8', 18, 'ZPT', 'Zircon Pool Token'),
    contractAddress: '0x7e6F037885104b79E7AD6D48ec69E9d29C64C1Df',
    vaultAddress: '0x99d2129d801055BCAfC4D76Fb8Eeb4738325c013',
    lpAddress: "0x1C26C0765a6F36Dfd5C02378790c7d46FDccE695",
    pylonAddress: "0xbF9a6b4FBb4cbeBe70b29A05aab85da197509B14",
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
