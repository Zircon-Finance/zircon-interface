import { Token } from 'diffuse-sdk'

export type TranslatableText =
  | string
  | {
      key: string
      data?: {
        [key: string]: string | number
      }
    }

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
  projectLink?: string
}

export enum PoolIds {
  poolBasic = 'poolBasic',
  poolUnlimited = 'poolUnlimited',
}

export type IfoStatus = 'idle' | 'coming_soon' | 'live' | 'finished'

interface IfoPoolInfo {
  saleAmount: string
  raiseAmount: string
  cakeToBurn: string
  distributionRatio: number // Range [0-1]
}

export interface Ifo {
  id: string
  isActive: boolean
  address: string
  name: string
  currency: Token
  token: Token
  releaseBlockNumber: number
  articleUrl: string
  campaignId: string
  tokenOfferingPrice: number
  description?: string
  twitterUrl?: string
  telegramUrl?: string
  version: number
  [PoolIds.poolBasic]?: IfoPoolInfo
  [PoolIds.poolUnlimited]: IfoPoolInfo
}

export enum PoolCategory {
  'COMMUNITY' = 'Community',
  'CORE' = 'Core',
  'BINANCE' = 'Binance', // Pools using native BNB behave differently than pools using a token
  'AUTO' = 'Auto',
}

interface FarmConfigBaseProps {
  pid: number
  lpSymbol: string
  lpAddress: string
  multiplier?: string
  isCommunity?: boolean
  isAnchor: boolean
  dual?: {
    rewardPerBlock: number
    earnLabel: string
    endBlock: number
  }
}

export interface SerializedFarmConfig extends FarmConfigBaseProps {
  token: SerializedToken
  quoteToken: SerializedToken
}

export interface DeserializedFarmConfig extends FarmConfigBaseProps {
  token: Token
  quoteToken: Token
}

export interface PoolDeployedBlockNumber {
  [key: string]: number
}

interface PoolConfigBaseProps {
  contractAddress: string
  vaultAddress: string
  lpAddress: string
  pylonAddress: string
  isFinished?: boolean
  isArchived?: boolean
  isFinishedRecently?: boolean
  isAnchor? : boolean
}

export interface SerializedPoolConfig extends PoolConfigBaseProps {
  isClassic: boolean
  isAnchor?: boolean
  token1: SerializedToken
  token2: SerializedToken
  earningToken: SerializedToken[]
  stakingToken: SerializedToken
}

export interface DeserializedPoolConfig extends PoolConfigBaseProps {
  isClassic: boolean
  isAnchor?: boolean
  token1: SerializedToken
  token2: SerializedToken
  earningToken: Token[]
  stakingToken: Token
}
