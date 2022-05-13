// import React from 'react'
// import Trans from '../components/Trans'
import { NETWORK_CHAIN_ID } from '../connectors'
// import { serializeTokens } from './tokens'
import { SerializedPoolConfig, PoolCategory } from './types'



// enum VaultKey {
//   CakeVault = 'cakeVault',
//   IfoPool = 'ifoPool',
// }

// const serializedTokens = serializeTokens()

const pools: SerializedPoolConfig[] = [
  {
    sousId: 0,
    stakingToken: null,
    earningToken: null,
    contractAddress: {
      97: '0x1d32c2945C8FDCBc7156c553B7cEa4325a17f4f9',
      56: '0x73feaa1eE314F8c655E354234017bE2193C9E24E',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '10',
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 235,
    stakingToken: null,
    earningToken: null,
    contractAddress: {
      97: '',
      56: '0x2b8751B7141Efa7a9917f9C6fea2CEA071af5eE7',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 999,
    tokenPerBlock: '0.2516',
  }
].filter((p) => !!p.contractAddress[NETWORK_CHAIN_ID])

export default pools
