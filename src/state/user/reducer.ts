import { INITIAL_ALLOWED_SLIPPAGE, DEFAULT_DEADLINE_FROM_NOW } from '../../constants'
import { createReducer } from '@reduxjs/toolkit'
import { updateVersion } from '../global/actions'
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedPair,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserExpertMode,
  updateUserSlippageTolerance,
  updateUserDeadline,
  updateUserFarmStakedOnly,
  updateUserFarmsViewMode,
  updateuserFarmsFilterPylonClassic,
  ViewMode,
  FarmStakedOnly,
  FarmFilter,
  updateuserFarmsFilterAnchorFloat,
  FarmFilterAnchorFloat,
  updateGasPrice,
  updateShowMobileSearchBar,
  updateUserFarmFinishedOnly,
  FarmFinishedOnly,
  addChosenToken,
  removeChosenToken,
  updateShowBanner
} from './actions'
import { GAS_PRICE_GWEI } from '../../utils/getGasPrice'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  matchesDarkMode: boolean // whether the dark mode media query matches

  userExpertMode: boolean
  showMobileSearchBar: boolean

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number

  // deadline set by user in minutes, used in all txns
  userDeadline: number

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }

  pairs: {
    [chainId: number]: {
      // keyed by token0Address:token1Address
      [key: string]: SerializedPair
    }
  }

  timestamp: number
  userFarmStakedOnly: FarmStakedOnly
  userFarmsViewMode: ViewMode
  userFarmsFilterPylonClassic: FarmFilter
  userFarmsFilterAnchorFloat: FarmFilterAnchorFloat
  userFarmFinishedOnly: FarmFinishedOnly
  gasPrice: string
  chosenTokens: string[]
  showBanner: boolean
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`
}

export const initialState: UserState = {
  userDarkMode: null,
  matchesDarkMode: false,
  userExpertMode: false,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  pairs: {},
  timestamp: currentTimestamp(),
  userFarmStakedOnly: FarmStakedOnly.FALSE,
  userFarmsViewMode: ViewMode.TABLE,
  userFarmsFilterPylonClassic: FarmFilter.PYLON,
  userFarmsFilterAnchorFloat: FarmFilterAnchorFloat.ALL,
  userFarmFinishedOnly: FarmFinishedOnly.FALSE,
  gasPrice: GAS_PRICE_GWEI.default,
  showMobileSearchBar: false,
  chosenTokens: ["0x4545e94974adacb82fc56bcf136b07943e152055", "0x808a3f2639a5cd54d64ed768192369bcd729100e"],
  showBanner: true
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateVersion, state => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userSlippageTolerance !== 'number') {
        state.userSlippageTolerance = INITIAL_ALLOWED_SLIPPAGE
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (typeof state.userDeadline !== 'number') {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW
      }

      if(!state.chosenTokens) {
        state.chosenTokens = initialState.chosenTokens
      }

      if(state.showBanner === undefined) {
        state.showBanner = initialState.showBanner
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserExpertMode, (state, action) => {
      state.userExpertMode = action.payload.userExpertMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateShowMobileSearchBar, (state, action) => {
      state.showMobileSearchBar = action.payload.showMobileSearchBar
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserFarmsViewMode, (state, { payload: { userFarmsViewMode } }) => {
      state.userFarmsViewMode = userFarmsViewMode
    })
    .addCase(updateuserFarmsFilterPylonClassic, (state, { payload: { userFarmsFilterPylonClassic } }) => {
      state.userFarmsFilterPylonClassic = userFarmsFilterPylonClassic
    })
    .addCase(updateUserFarmStakedOnly, (state, { payload: { userFarmStakedOnly } }) => {
      state.userFarmStakedOnly = userFarmStakedOnly
    })
    .addCase(updateUserFarmFinishedOnly, (state, { payload: { userFarmFinishedOnly } }) => {
      state.userFarmFinishedOnly = userFarmFinishedOnly
    })
    .addCase(updateuserFarmsFilterAnchorFloat, (state, { payload: { userFarmsFilterAnchorFloat } }) => {
      state.userFarmsFilterAnchorFloat = userFarmsFilterAnchorFloat
    })
    .addCase(addChosenToken, (state, { payload: {id} }) => {
      state.chosenTokens?.push(id)
    })
    .addCase(removeChosenToken, (state, { payload: {id} }) => {
      state.chosenTokens = state.chosenTokens?.filter(token => token !== id)
    })
    .addCase(updateShowBanner, (state, { payload: {showBanner} }) => {
      state.showBanner = showBanner
    })
    .addCase(updateUserDeadline, (state, action) => {
      state.userDeadline = action.payload.userDeadline
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = currentTimestamp()
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      state.tokens[chainId] = state.tokens[chainId] || {}
      delete state.tokens[chainId][address]
      state.timestamp = currentTimestamp()
    })
    .addCase(addSerializedPair, (state, { payload: { serializedPair } }) => {
      if (
        serializedPair.token0.chainId === serializedPair.token1.chainId &&
        serializedPair.token0.address !== serializedPair.token1.address
      ) {
        const chainId = serializedPair.token0.chainId
        state.pairs[chainId] = state.pairs[chainId] || {}
        state.pairs[chainId][pairKey(serializedPair.token0.address, serializedPair.token1.address)] = serializedPair
      }
      state.timestamp = currentTimestamp()
    })
    .addCase(updateGasPrice, (state, action) => {
      state.gasPrice = action.payload.gasPrice
    })
    .addCase(removeSerializedPair, (state, { payload: { chainId, tokenAAddress, tokenBAddress } }) => {
      if (state.pairs[chainId]) {
        // just delete both keys if either exists
        delete state.pairs[chainId][pairKey(tokenAAddress, tokenBAddress)]
        delete state.pairs[chainId][pairKey(tokenBAddress, tokenAAddress)]
      }
      state.timestamp = currentTimestamp()
    })
)
