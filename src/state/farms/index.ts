import type {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
  // eslint-disable-next-line import/no-unresolved
} from '@reduxjs/toolkit/dist/matchers'
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import stringify from 'fast-json-stable-stringify'
import farmsConfig from '../../constants/farms'
import isArchivedPid from '../../utils/farmHelpers'
import type { AppState } from '../../state'
import priceHelperLpsConfig from '../../constants/priceHelperLps'
import fetchFarms from './fetchFarms'
import getFarmsPrices from './getFarmsPrices'
import {
  fetchFarmUserEarnings,
  fetchFarmUserAllowances,
  fetchFarmUserTokenBalances,
  fetchFarmUserStakedBalances,
} from './fetchFarmUser'
import { SerializedFarmsState, SerializedFarm } from '../types'
import { fetchMasterChefFarmPoolLength } from './fetchMasterChefData'
import { resetUserState } from '../global/actions'
import { Token } from 'zircon-sdk'

// const noAccountFarmConfig = farmsConfig.map((farm) => ({
//   ...farm,
//   userData: {
//     allowance: '0',
//     tokenBalance: '0',
//     stakedBalance: '0',
//     earnings: '0',
//   },
// }))

const initialState: SerializedFarmsState = {
  data: [{
    pid: 438,
    lpSymbol: 'UNS-ERTH LP',
    lpAddresses: {
      97: '',
      56: '0x37Ff7D4459ad96E0B01275E5efffe091f33c2CAD',
    },
    token: new Token(1,'0x37Ff7D4459ad96E0B01275E5efffe091f33c2CAD',18, 'UNS', 'Uranus'),
    quoteToken: new Token(1,'0x365c3F921b2915a480308D0b1C04aEF7B99c2876',18, 'ERTH', 'Earth'),
    isCommunity: false,
    userData: {
      stakedBalance: '10',
      earnings: '0',
      allowance: '0',
      tokenBalance: '0',
      },
    multiplier: '2X',
    dual: {
      rewardPerBlock: 2,
      earnLabel: 'test',
      endBlock: 5,
    },
    quoteTokenPriceBusd: 'quoteTokenPriceBusd',
    tokenPriceBusd: 'tokenPriceBusd',
  },
  {
    pid: 428,
    lpSymbol: 'JUP-MARS LP',
    lpAddresses: {
      97: '',
      56: '0x37Ff7D4459ad96E0B01275E5efffe091f33c2CAD',
    },
    token: new Token(1,'0x37Ff7D4459ad96E0B01275E5efffe091f33c2CAD',18, 'JUP', 'Jupiter'),
    quoteToken: new Token(1,'0x365c3F921b2915a480308D0b1C04aEF7B99c2876',18, 'MARS', 'Mars'),
    isCommunity: false,
    userData: {
      stakedBalance: '2',
      earnings: '3',
      allowance: '1',
      tokenBalance: '2',
      },
    multiplier: '4X',
    dual: {
      rewardPerBlock: 2,
      earnLabel: 'test',
      endBlock: 5,
    },
    quoteTokenPriceBusd: 'quoteTokenPriceBusd',
    tokenPriceBusd: 'tokenPriceBusd',
  }],
  loadArchivedFarmsData: false,
  userDataLoaded: false,
  loadingKeys: {},
}

export const nonArchivedFarms = farmsConfig.filter(({ pid }) => !isArchivedPid(pid))

// Async thunks
export const fetchFarmsPublicDataAsync = createAsyncThunk<
  [SerializedFarm[], number],
  number[],
  {
    state: AppState
  }
>(
  'farms/fetchFarmsPublicDataAsync',
  async (pids) => {
    const poolLength = await fetchMasterChefFarmPoolLength()
    const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))
    const farmsCanFetch = farmsToFetch.filter((f) => poolLength.gt(f.pid))

    // Add price helper farms
    const farmsWithPriceHelpers = farmsCanFetch.concat(priceHelperLpsConfig)

    const farms = await fetchFarms(farmsWithPriceHelpers)
    const farmsWithPrices = getFarmsPrices(farms)

    // Filter out price helper LP config farms
    const farmsWithoutHelperLps = farmsWithPrices.filter((farm: SerializedFarm) => {
      return farm.pid || farm.pid === 0
    })
    return [farmsWithoutHelperLps, poolLength.toNumber()]
  },
  {
    condition: (arg, { getState }) => {
      const { farms } = getState()
      if (farms.loadingKeys[stringify({ type: fetchFarmsPublicDataAsync.typePrefix, arg })]) {
        console.debug('farms action is fetching, skipping here')
        return false
      }
      return true
    },
  },
)

interface FarmUserDataResponse {
  pid: number
  allowance: string
  tokenBalance: string
  stakedBalance: string
  earnings: string
}

export const fetchFarmUserDataAsync = createAsyncThunk<
  FarmUserDataResponse[],
  { account: string; pids: number[] },
  {
    state: AppState
  }
>(
  'farms/fetchFarmUserDataAsync',
  async ({ account, pids }) => {
    const poolLength = await fetchMasterChefFarmPoolLength()
    const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))
    const farmsCanFetch = farmsToFetch.filter((f) => poolLength.gt(f.pid))
    const userFarmAllowances = await fetchFarmUserAllowances(account, farmsCanFetch)
    const userFarmTokenBalances = await fetchFarmUserTokenBalances(account, farmsCanFetch)
    const userStakedBalances = await fetchFarmUserStakedBalances(account, farmsCanFetch)
    const userFarmEarnings = await fetchFarmUserEarnings(account, farmsCanFetch)

    return userFarmAllowances.map((farmAllowance, index) => {
      return {
        pid: farmsCanFetch[index].pid,
        allowance: userFarmAllowances[index],
        tokenBalance: userFarmTokenBalances[index],
        stakedBalance: userStakedBalances[index],
        earnings: userFarmEarnings[index],
      }
    })
  },
  {
    condition: (arg, { getState }) => {
      const { farms } = getState()
      if (farms.loadingKeys[stringify({ type: fetchFarmUserDataAsync.typePrefix, arg })]) {
        console.debug('farms user action is fetching, skipping here')
        return false
      }
      return true
    },
  },
)

type UnknownAsyncThunkFulfilledOrPendingAction =
  | UnknownAsyncThunkFulfilledAction
  | UnknownAsyncThunkPendingAction
  | UnknownAsyncThunkRejectedAction

const serializeLoadingKey = (
  action: UnknownAsyncThunkFulfilledOrPendingAction,
  suffix: UnknownAsyncThunkFulfilledOrPendingAction['meta']['requestStatus'],
) => {
  const type = action.type.split(`/${suffix}`)[0]
  return stringify({
    arg: action.meta.arg,
    type,
  })
}

export const farmsSlice = createSlice({
  name: 'Farms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map((farm) => {
        return {
          ...farm,
          userData: {
            allowance: '0',
            tokenBalance: '0',
            stakedBalance: '0',
            earnings: '0',
          },
        }
      })
      state.userDataLoaded = false
    })
    // Update farms with live data
    builder.addCase(fetchFarmsPublicDataAsync.fulfilled, (state, action) => {
      const [farmPayload, poolLength] = action.payload
      state.data = state.data.map((farm) => {
        const liveFarmData = farmPayload.find((farmData) => farmData.pid === farm.pid)
        return { ...farm, ...liveFarmData }
      })
      state.poolLength = poolLength
    })

    // Update farms with user data
    builder.addCase(fetchFarmUserDataAsync.fulfilled, (state, action) => {
      action.payload.forEach((userDataEl) => {
        const { pid } = userDataEl
        const index = state.data.findIndex((farm) => farm.pid === pid)
        state.data[index] = { ...state.data[index], userData: userDataEl }
      })
      state.userDataLoaded = true
    })

    builder.addMatcher(isAnyOf(fetchFarmUserDataAsync.pending, fetchFarmsPublicDataAsync.pending), (state, action) => {
      state.loadingKeys[serializeLoadingKey(action, 'pending')] = true
    })
    builder.addMatcher(
      isAnyOf(fetchFarmUserDataAsync.fulfilled, fetchFarmsPublicDataAsync.fulfilled),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'fulfilled')] = false
      },
    )
    builder.addMatcher(
      isAnyOf(fetchFarmsPublicDataAsync.rejected, fetchFarmUserDataAsync.rejected),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'rejected')] = false
      },
    )
  },
})

export default farmsSlice.reducer
