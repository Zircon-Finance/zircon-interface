import { BigNumber } from '@ethersproject/bignumber'
// import Trans from 'components/Trans'
// import { VaultKey } from 'state/types'
import { NETWORK_CHAIN_ID } from '../connectors'

import { SerializedPoolConfig, PoolCategory } from './types'
import { serializedTokens } from './farms'

export const MAX_LOCK_DURATION = 31536000
export const UNLOCK_FREE_DURATION = 604800
export const ONE_WEEK_DEFAULT = 604800
export const BOOST_WEIGHT = BigNumber.from('20000000000000')
export const DURATION_FACTOR = BigNumber.from('31536000')

const pools: SerializedPoolConfig[] = [
  {
    sousId: 0,
    stakingToken: serializedTokens.pluto,
    earningToken: serializedTokens.saturn,
    contractAddress: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '10',
    sortOrder: 1,
    isFinished: false,
  },
].filter((p) => !!p.contractAddress[NETWORK_CHAIN_ID])

// known finished pools
const finishedPools = [
  {
    sousId: 278,
    stakingToken: serializedTokens.cake,
    earningToken: serializedTokens.pluto,
    contractAddress: '0xD1c395BCdC2d64ac6544A34A36185483B00530a1',
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 999,
    tokenPerBlock: '0.06794',
    version: 3,
  },
]
  .filter((p) => !!p.contractAddress[NETWORK_CHAIN_ID])
  .map((p) => ({ ...p, isFinished: true }))

export default [...pools, ...finishedPools]
