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

export type DeserializedPoolVault = DeserializedPool & (DeserializedCakeVault | DeserializedIfoCakeVault)

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
  quoteTokenAmountTotal?: SerializedBigNumber
  lpTotalInQuoteToken?: SerializedBigNumber
  lpTotalSupply?: SerializedBigNumber
  tokenPriceVsQuote?: SerializedBigNumber
  poolWeight?: SerializedBigNumber
  userData?: SerializedFarmUserData
}

export interface DeserializedFarm extends DeserializedFarmConfig {
  tokenPriceBusd?: string
  quoteTokenPriceBusd?: string
  tokenAmountTotal?: BigNumber
  quoteTokenAmountTotal?: BigNumber
  lpTotalInQuoteToken?: BigNumber
  lpTotalSupply?: BigNumber
  tokenPriceVsQuote?: BigNumber
  poolWeight?: BigNumber
  userData?: DeserializedFarmUserData
}

export enum VaultKey {
  CakeVault = 'cakeVault',
  IfoPool = 'ifoPool',
}

interface CorePoolProps {
  startBlock?: number
  endBlock?: number
  apr?: number
  rawApr?: number
  stakingTokenPrice?: number
  earningTokenPrice?: number
  vaultKey?: VaultKey
}

export interface DeserializedPool extends DeserializedPoolConfig, CorePoolProps {
  totalStaked?: BigNumber
  stakingLimit?: BigNumber
  stakingLimitEndBlock?: number
  profileRequirement?: {
    required: boolean
    thresholdPoints: BigNumber
  }
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
  numberBlocksForUserLimit?: number
  profileRequirement?: {
    required: boolean
    thresholdPoints: SerializedBigNumber
  }
  userData?: {
    allowance: SerializedBigNumber
    stakingTokenBalance: SerializedBigNumber
    stakedBalance: SerializedBigNumber
    pendingReward: SerializedBigNumber
  }
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

export interface SerializedVaultFees {
  performanceFee: number
  callFee: number
  withdrawalFee: number
  withdrawalFeePeriod: number
}

export interface DeserializedVaultFees extends SerializedVaultFees {
  performanceFeeAsDecimal: number
}

export interface SerializedVaultUser {
  isLoading: boolean
  userShares: SerializedBigNumber
  cakeAtLastUserAction: SerializedBigNumber
  lastDepositedTime: string
  lastUserActionTime: string
}

export interface DeserializedVaultUser {
  isLoading: boolean
  userShares: BigNumber
  cakeAtLastUserAction: BigNumber
  lastDepositedTime: string
  lastUserActionTime: string
}

export interface DeserializedIfoVaultUser extends DeserializedVaultUser {
  credit: string
}

export interface SerializedIfoVaultUser extends SerializedVaultUser {
  credit: string
}

export interface DeserializedCakeVault {
  totalShares?: BigNumber
  pricePerFullShare?: BigNumber
  totalCakeInVault?: BigNumber
  estimatedCakeBountyReward?: BigNumber
  totalPendingCakeHarvest?: BigNumber
  fees?: DeserializedVaultFees
  userData?: DeserializedVaultUser
}

export interface SerializedCakeVault {
  totalShares?: SerializedBigNumber
  pricePerFullShare?: SerializedBigNumber
  totalCakeInVault?: SerializedBigNumber
  estimatedCakeBountyReward?: SerializedBigNumber
  totalPendingCakeHarvest?: SerializedBigNumber
  fees?: SerializedVaultFees
  userData?: SerializedVaultUser
}

export interface SerializedIfoCakeVault extends Omit<SerializedCakeVault, 'userData'> {
  userData?: SerializedIfoVaultUser
  creditStartBlock?: number
  creditEndBlock?: number
}

export interface DeserializedIfoCakeVault extends Omit<DeserializedCakeVault, 'userData'> {
  userData?: DeserializedIfoVaultUser
  creditStartBlock?: number
  creditEndBlock?: number
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
  // cakeVault: SerializedCakeVault
  userDataLoaded: boolean
}

export interface SerializedPool extends SerializedPoolConfig, CorePoolProps {
  totalStaked?: SerializedBigNumber
  stakingLimit?: SerializedBigNumber
  numberBlocksForUserLimit?: number
  profileRequirement?: {
    required: boolean
    thresholdPoints: SerializedBigNumber
  }
  userData?: {
    allowance: SerializedBigNumber
    stakingTokenBalance: SerializedBigNumber
    stakedBalance: SerializedBigNumber
    pendingReward: SerializedBigNumber
  }
}