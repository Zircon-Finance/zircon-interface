import { createAction } from '@reduxjs/toolkit'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export enum FarmStakedOnly {
  ON_FINISHED = 'onFinished',
  TRUE = 'true',
  FALSE = 'false',
}

export enum ViewMode {
  TABLE = 'TABLE',
  CARD = 'CARD',
}

export enum FarmFilter {
  CLASSIC = 'CLASSIC',
  PYLON = 'PYLON',
}

export enum FarmFilterAnchorFloat {
  ALL = 'ALL',
  ANCHOR = 'STABLE',
  FLOAT = 'FLOAT',
}

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('user/updateMatchesDarkMode')
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('user/updateUserDarkMode')
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>('user/updateUserExpertMode')
export const updateShowMobileSearchBar = createAction<{ showMobileSearchBar: boolean }>('user/updateShowMobileSearchBar')
export const updateUserSlippageTolerance = createAction<{ userSlippageTolerance: number }>(
  'user/updateUserSlippageTolerance'
)
export const updateUserFarmsViewMode = createAction<{ userFarmsViewMode: ViewMode }>('user/updateUserFarmsViewMode')
export const updateuserFarmsFilterPylonClassic = createAction<{ userFarmsFilterPylonClassic: FarmFilter }>(
  'user/updateuserFarmsFilterPylonClassic'
  )
export const updateuserFarmsFilterAnchorFloat = createAction<{ userFarmsFilterAnchorFloat: FarmFilterAnchorFloat }>(
  'user/updateuserFarmsFilterAnchorFloat'
  )
export const updateUserFarmStakedOnly = createAction<{ userFarmStakedOnly: FarmStakedOnly }>(
  'user/updateUserFarmStakedOnly',
)
export const updateUserDeadline = createAction<{ userDeadline: number }>('user/updateUserDeadline')
export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('user/addSerializedToken')
export const removeSerializedToken = createAction<{ chainId: number; address: string }>('user/removeSerializedToken')
export const addSerializedPair = createAction<{ serializedPair: SerializedPair }>('user/addSerializedPair')
export const removeSerializedPair = createAction<{ chainId: number; tokenAAddress: string; tokenBAddress: string }>(
  'user/removeSerializedPair'
)
export const updateGasPrice = createAction<{ gasPrice: string }>('user/updateGasPrice')
export { fetchFarmsPublicDataAsync, fetchFarmUserDataAsync } from '../farms'

