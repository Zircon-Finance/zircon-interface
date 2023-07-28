import { createSelector } from '@reduxjs/toolkit'
import { ChainId, Token } from 'diffuse-sdk'
import { State,
  // VaultKey
} from '../types'
import { transformPool,
  // transformLockedVault
} from './helpers'

export const basePool = {
  token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
  token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 6, 'USDC', 'USDC'),
  isClassic: false,
  isAnchor: true,
  earningToken: [new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'DFS', 'DIFFUSE Gamma'),],
  stakingToken: new Token(ChainId.MOONRIVER, '0x17Bd5A512ac2906C89C37B3b863D69e418fBdaAa', 18, 'sDPT', 'DIFFUSE Stable Token'),
  contractAddress: '0x5d69EDd498b7a335F0FC8d4a797b7a33654C6A28',
  vaultAddress: '0xDd3D81193dc9AfE0a03f425BaA6a081CAeDb32C4',
  lpAddress: "0xcc2a7ceF44CAa59847699104629E034eA7D89F6a",
  pylonAddress: "0x68238a12CDf9437DBc969A3D35F21e572227089e",
  isFinished: false,
}

const selectPoolsData = (state: State) => state.pools.data
const selectPoolData = (contractAddress) => (state: State) => state.pools.data.find((p) => p.contractAddress === contractAddress)
const selectUserDataLoaded = (state: State) => state.pools.userDataLoaded

export const makePoolWithUserDataLoadingSelector = (contractAddress) =>
  createSelector([selectPoolData(contractAddress), selectUserDataLoaded], (pool, userDataLoaded) => {
    return { pool: transformPool(pool ?? basePool), userDataLoaded }
  })

export const poolsWithUserDataLoadingSelector = createSelector(
  [selectPoolsData, selectUserDataLoaded],
  (pools, userDataLoaded) => {
    return { pools: pools.map(transformPool), userDataLoaded }
  },
)
