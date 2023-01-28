import { ThunkAction } from 'redux-thunk'
import { AnyAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import {
  SerializedFarmConfig,
  DeserializedPoolConfig,
  SerializedPoolConfig,
  DeserializedFarmConfig,
} from '../constants/types'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, AnyAction>

export interface BigNumberToJson {
  type: 'BigNumber'
  hex: string
}

export type SerializedBigNumber = string

interface SerializedFarmUserData {
  allowance: string
  tokenBalance: string
  stakedBalance: string
  earnings: string
}

export interface DeserializedFarmUserData {
  allowance: BigNumber
  tokenBalance: BigNumber
  stakedBalance: BigNumber
  earnings: BigNumber
}

export interface SerializedFarm extends SerializedFarmConfig {
  tokenPriceBusd?: string
  quoteTokenPriceBusd?: string
  tokenAmountTotal?: SerializedBigNumber
  lpTotalInQuoteToken?: SerializedBigNumber
  lpTotalSupply?: SerializedBigNumber
  poolWeight?: SerializedBigNumber
  userData?: SerializedFarmUserData
}

export interface DeserializedFarm extends DeserializedFarmConfig {
  tokenPriceBusd?: string
  quoteTokenPriceBusd?: string
  tokenAmountTotal?: BigNumber
  lpTotalInQuoteToken?: BigNumber
  lpTotalSupply?: BigNumber
  poolWeight?: BigNumber
  userData?: DeserializedFarmUserData
}

export enum VaultKey {
  CakeVault = 'cakeVault',
  IfoPool = 'ifoPool',
}
export interface EarningTokenInfo {
  blockReward: number,
  blockRewardPrice: number,
  symbol: string,
  current: number,
  currentPrice: number
}

interface CorePoolProps {
  startBlock?: number
  endBlock?: number
  apr?: number
  baseApr?: number
  feesApr?: number
  liquidity?: {pair:number, pylon:number}
  zrgPrice?: number
  movrPrice?: number
  rawApr?: number
  stakingTokenPrice?: number
  // earningTokenPrice?: number[]
  earningTokenInfo?: EarningTokenInfo[]
  vaultKey?: VaultKey
  vTotalSupply?: number,
}

export interface DeserializedPool extends DeserializedPoolConfig, CorePoolProps {
  totalStaked?: BigNumber
  staked: BigNumber
  stakedRatio: number
  stakedBalancePool: number
  quotingPrice?: string
  tokenPrice?: string
  stakingLimit?: BigNumber
  gamma?: BigNumber
  stakingLimitEndBlock?: number
  userData?: {
    allowance: BigNumber
    stakingTokenBalance: BigNumber
    stakedBalance: BigNumber
    pendingReward: BigNumber
  }
}

export interface SerializedPool extends SerializedPoolConfig, CorePoolProps {
  totalStaked?: SerializedBigNumber
  stakingLimit?: SerializedBigNumber
  quotingPrice?: SerializedBigNumber
  numberBlocksForUserLimit?: number
  userData?: {
    allowance: SerializedBigNumber
    stakingTokenBalance: SerializedBigNumber
    stakedBalance: SerializedBigNumber
    pendingReward: SerializedBigNumber
  }
  gamma?: SerializedBigNumber
  ptb?: SerializedBigNumber
  quoteTokenBalanceTotal?: SerializedBigNumber
  tokenBalanceTotal?: SerializedBigNumber
  lpTotalSupply?: SerializedBigNumber
  quotePrice?: SerializedBigNumber
  tokenPrice?: SerializedBigNumber
  lpTotalInQuoteToken?: SerializedBigNumber
  vaultTotalSupply?: SerializedBigNumber
  psionicFarmBalance?: SerializedBigNumber
  staked?: SerializedBigNumber
  stakedBalancePool?: SerializedBigNumber
  stakedRatio?: SerializedBigNumber
}

// Slices states

export interface SerializedFarmsState {
  data: SerializedFarm[]
  loadArchivedFarmsData: boolean
  userDataLoaded: boolean
  loadingKeys: Record<string, boolean>
  poolLength?: number
}

export interface DeserializedFarmsState {
  data: DeserializedFarm[]
  loadArchivedFarmsData: boolean
  userDataLoaded: boolean
  poolLength?: number
}

export interface PoolsState {
  data: SerializedPool[]
  // cakeVault: SerializedCakeVault
  // ifoPool: SerializedIfoCakeVault
  userDataLoaded: boolean
}

export enum HistoryFilter {
  ALL = 'all',
  COLLECTED = 'collected',
  UNCOLLECTED = 'uncollected',
}


// Voting

/* eslint-disable camelcase */
/**
 * @see https://hub.snapshot.page/graphql
 */


export enum ProposalType {
  ALL = 'all',
  CORE = 'core',
  COMMUNITY = 'community',
}

export enum ProposalState {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export interface Space {
  id: string
  name: string
}

// Global state

export interface State {
  farms: SerializedFarmsState
  pools: PoolsState
}

export interface PoolsState {
  data: SerializedPool[]
  //cakeVault: SerializedCakeVault
  userDataLoaded: boolean
}

export interface SerializedPool extends SerializedPoolConfig, CorePoolProps {
  totalStaked?: SerializedBigNumber
  stakingLimit?: SerializedBigNumber
  quotingPrice?: SerializedBigNumber
  tokenPrice?: SerializedBigNumber
  numberBlocksForUserLimit?: number
  userData?: {
    allowance: SerializedBigNumber
    stakingTokenBalance: SerializedBigNumber
    stakedBalance: SerializedBigNumber
    pendingReward: SerializedBigNumber
  }
}
