import { createAsyncThunk, createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import poolsConfig from '../../constants/pools'
import axios from 'axios'
import {
  PoolsState,
  SerializedPool,
  EarningTokenInfo,
  // SerializedCakeVault,
  // SerializedLockedVaultUser,
} from '../../state/types'
// import { getCakeVaultAddress } from 'utils/addressHelpers'
import {
  // fetchPoolsProfileRequirement,
  fetchPoolsStakingLimits,
} from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserPendingRewards,
  fetchUserStakeBalances,
} from './fetchPoolsUser'
// import { fetchPublicVaultData, fetchVaultFees } from './fetchVaultPublic'
// import fetchVaultUser from './fetchVaultUser'

import { resetUserState } from '../global/actions'
import {BIG_ZERO} from '../../utils/bigNumber'
// import { getBalanceNumber } from '../../utils/formatBalance'
// import { getPoolApr } from '../../utils/apr'
import fetchPools from "./fetchPoolsInfo";
import getPoolsPrices from "./getPoolsPrices";
// import {fetchRewardsData} from "./fetchRewardsData";
import {fetchRewardsData} from "./fetchRewardsData";
import {simpleRpcProvider} from "../../utils/providers";
// import {JSBI, Pylon} from "zircon-sdk";
// import {getPoolApr} from "../../utils/apr";

export const initialPoolVaultState = Object.freeze({
  totalShares: null,
  totalLockedAmount: null,
  pricePerFullShare: null,
  totalCakeInVault: null,
  fees: {
    performanceFee: null,
    withdrawalFee: null,
    withdrawalFeePeriod: null,
  },
  userData: {
    isLoading: true,
    userShares: null,
    cakeAtLastUserAction: null,
    lastDepositedTime: null,
    lastUserActionTime: null,
    credit: null,
    locked: null,
    lockStartTime: null,
    lockEndTime: null,
    userBoostedShare: null,
    lockedAmount: null,
    currentOverdueFee: null,
    currentPerformanceFee: null,
  },
  creditStartBlock: null,
})

const initialState: PoolsState = {
  data: [...poolsConfig],
  userDataLoaded: false,
  // cakeVault: initialPoolVaultState,
}

export const fetchPoolsPublicDataAsync = (currentBlockNumber: number) => async (dispatch, getState) => {
  try {
    const [currentBlock] = await Promise.all([
      currentBlockNumber ? Promise.resolve(currentBlockNumber) : simpleRpcProvider.getBlockNumber(),
    ])

    const apiData = await axios.get('https://edgeapi.zircon.finance/static/yield').then((res) => res.data)

    const blockLimits = apiData?.map((pool) => {
      return {
        contractAddress: pool.contractAddress,
        startBlock: parseInt(pool.startBlock),
        endBlock: parseInt(pool.endBlock)
    }})

    const rewardsData = []
    for (let i = 0; i < poolsConfig.length; i++) {
      rewardsData[i] = {contractAddress: poolsConfig[i].contractAddress, balances:  await fetchRewardsData(apiData, poolsConfig[i])}
    }
    const poolsInformation = await fetchPools(poolsConfig)
    
    let poolsPrices = await getPoolsPrices(poolsInformation)

    const priceZRGMOVR = {zrg: apiData[0]?.zrgPrice, movr: apiData[0]?.movrPrice}

    const liveData = poolsPrices.map((pool, i) => {
      const apiPool = apiData.filter((poolArray) => poolArray.contractAddress === pool.contractAddress.toLowerCase());
      // Checking for block limits and total Staking
      const blockLimit = blockLimits.find((entry) => entry.contractAddress === pool.contractAddress.toLowerCase())

      // Checking if pool is finished, either by the value on the files or because the block limit has been reached
      const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
      const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded || !apiPool[0]
      const blockRemaining = blockLimit?.endBlock-currentBlock

      // Checking Rewards already distributed
      // As of Contract calculation on initialize it is minted 1e18 Psionic tokens to the farm contract so...
      const tokensRemaining = new BigNumber(blockRemaining).times(1e18)
      const pendingRewards = new BigNumber(apiPool[0]?.psiBalance).minus(tokensRemaining)
      
      // Price of staked Token in USD

      // Earning Tokens Information (ZRG, MOVR)
      const earningData = rewardsData?.find((entry) => entry.contractAddress.toLowerCase() === pool.contractAddress.toLowerCase())
      let earningTokenInfo: EarningTokenInfo[] = pool.earningToken.map((token,index) => {
        // Calculating remaining balance
        const balance = new BigNumber(earningData?.balances?.find((entry) => entry.symbol.toLowerCase() === 
        (token.symbol.toLowerCase() === 'movr' ? 'wmovr' : token.symbol.toLowerCase()))?.balance)
        const balanceDivided = balance.dividedBy(new BigNumber(1e18))

        // Calculating rewards per block (removing the pending exceeding rewards)
        const pending = new BigNumber(pendingRewards).multipliedBy(balanceDivided).dividedBy(apiPool[0]?.psiTS)
        const remaining = (balanceDivided).minus(pending)
        let blockReward = remaining.dividedBy(blockRemaining)

        // Obtaining Price (Normally ZRG will be Float side and MOVR Stable Side
        let price = token.symbol === "ZRG" ? priceZRGMOVR?.zrg : priceZRGMOVR?.movr

        return {
          symbol: token.symbol,
          blockReward: blockReward.toNumber(),
          blockRewardPrice: new BigNumber(price).times(blockReward).toNumber(),
          current: balance.dividedBy(apiPool[0]?.psiTS).toNumber(),
          currentPrice: balance.dividedBy(apiPool[0]?.psiTS).multipliedBy(price).toNumber(),
        }
      }) || []


      return {
        sousId: pool.sousId,
        ...blockLimit,
        earningTokenInfo: earningTokenInfo || [],
        rewardsData: rewardsData,
        vTotalSupply: apiPool[0]?.psiTS,
        liquidity: apiPool[0]?.tvl,
        zrgPrice: priceZRGMOVR?.zrg,
        movrPrice: priceZRGMOVR?.movr,
        staked: new BigNumber(apiPool[0]?.staked).toString(),
        stakedBalancePool: new BigNumber(pool.stakedBalancePool).toString(),
        apr: parseFloat(apiPool[0]?.apr) + parseFloat(apiPool[0]?.feesAPR),
        isFinished: isPoolFinished,
        quotingPrice: pool.quotePrice,
        tokenPrice: pool.tokenPrice,
      }
    })
    dispatch(setPoolsPublicData(liveData))
  } catch (error) {
    console.error('[Pools Action] error when getting public data', error)
  }
}

export const fetchPoolsStakingLimitsAsync = () => async (dispatch, getState) => {
  const poolsWithStakingLimit = getState().pools.data
  // .filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
  // .map((pool) => pool.sousId)

  try {
    const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)

    const stakingLimitData = poolsConfig.map((pool) => {
      if (poolsWithStakingLimit.includes(pool.sousId)) {
        return { sousId: pool.sousId }
      }
      const { stakingLimit, numberBlocksForUserLimit } = stakingLimits[pool.sousId] || {
        stakingLimit: BIG_ZERO,
        numberBlocksForUserLimit: 0,
      }
      return {
        sousId: pool.sousId,
        stakingLimit: stakingLimit.toJSON(),
        numberBlocksForUserLimit,
      }
    })

    dispatch(setPoolsPublicData(stakingLimitData))
  } catch (error) {
    console.error('[Pools Action] error when getting staking limits', error)
  }
}

export const fetchPoolsUserDataAsync = createAsyncThunk<
    { sousId: number; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[],
    string
    >('pool/fetchPoolsUserData', async (account, { rejectWithValue }) => {
  try {
    const [allowances, stakingTokenBalances, stakedBalances, pendingRewards] = await Promise.all([
      fetchPoolsAllowance(account),
      fetchUserBalances(account),
      fetchUserStakeBalances(account),
      fetchUserPendingRewards(account),
    ])

    const userData = poolsConfig.map((pool) => ({
      sousId: pool.sousId,
      allowance: allowances[pool.sousId],
      stakingTokenBalance: stakingTokenBalances[pool.sousId],
      stakedBalance: stakedBalances[pool.sousId],
      pendingReward: pendingRewards[pool.sousId],
    }))
    return userData
  } catch (e) {
    return rejectWithValue(e)
  }
})

export const updateUserAllowance = createAsyncThunk<
    { sousId: number; field: string; value: any },
    { sousId: number; account: string }
    >('pool/updateUserAllowance', async ({ sousId, account }) => {
  const allowances = await fetchPoolsAllowance(account)
  return { sousId, field: 'allowance', value: allowances[sousId] }
})

export const updateUserBalance = createAsyncThunk<
    { sousId: number; field: string; value: any },
    { sousId: number; account: string }
    >('pool/updateUserBalance', async ({ sousId, account }) => {
  const tokenBalances = await fetchUserBalances(account)
  return { sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }
})

export const updateUserStakedBalance = createAsyncThunk<
    { sousId: number; field: string; value: any },
    { sousId: number; account: string }
    >('pool/updateUserStakedBalance', async ({ sousId, account }) => {
  const stakedBalances = await fetchUserStakeBalances(account)
  return { sousId, field: 'stakedBalance', value: stakedBalances[sousId] }
})

export const updateUserPendingReward = createAsyncThunk<
    { sousId: number; field: string; value: any },
    { sousId: number; account: string }
    >('pool/updateUserPendingReward', async ({ sousId, account }) => {
  const pendingRewards = await fetchUserPendingRewards(account)
  return { sousId, field: 'pendingReward', value: pendingRewards[sousId] }
})

// export const fetchCakeVaultPublicData = createAsyncThunk<SerializedCakeVault>('cakeVault/fetchPublicData', async () => {
//   const publicVaultInfo = await fetchPublicVaultData()
//   return publicVaultInfo
// })

// export const fetchCakeVaultFees = createAsyncThunk<SerializedVaultFees>('cakeVault/fetchFees', async () => {
//   const vaultFees = await fetchVaultFees()
//   return vaultFees
// })

// export const fetchCakeVaultUserData = createAsyncThunk<SerializedLockedVaultUser, { account: string }>(
//   'cakeVault/fetchUser',
//   async ({ account }) => {
//     const userData = await fetchVaultUser(account)
//     return userData
//   },
// )

export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    setPoolPublicData: (state, action) => {
      const { sousId } = action.payload
      const poolIndex = state.data.findIndex((pool) => pool.sousId === sousId)
      state.data[poolIndex] = {
        ...state.data[poolIndex],
        ...action.payload.data,
      }
    },
    setPoolUserData: (state, action) => {
      const { sousId } = action.payload
      state.data = state.data.map((pool) => {
        if (pool.sousId === sousId) {
          return { ...pool, userDataLoaded: true, userData: action.payload.data }
        }
        return pool
      })
    },
    setPoolsPublicData: (state, action) => {
      const livePoolsData: SerializedPool[] = action.payload
      state.data = state.data.map((pool) => {
        const livePoolData = livePoolsData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, ...livePoolData }
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map(({ userData, ...pool }) => {
        return { ...pool }
      })
      state.userDataLoaded = false
      // state.cakeVault = { ...state.cakeVault, userData: initialPoolVaultState.userData }
    })
    builder.addCase(
        fetchPoolsUserDataAsync.fulfilled,
        (
            state,
            action: PayloadAction<
                { sousId: number; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[]
                >,
        ) => {
          const userData = action.payload
          state.data = state.data.map((pool) => {
            const userPoolData = userData.find((entry) => entry.sousId === pool.sousId)
            return { ...pool, userDataLoaded: true, userData: userPoolData }
          })
          state.userDataLoaded = true
        },
    )
    builder.addCase(fetchPoolsUserDataAsync.rejected, (state, action) => {
      console.error('[Pools Action] Error fetching pool user data', action.payload)
    })
    // // Vault public data that updates frequently
    // builder.addCase(fetchCakeVaultPublicData.fulfilled, (state, action: PayloadAction<SerializedCakeVault>) => {
    //   state.cakeVault = { ...state.cakeVault, ...action.payload }
    // })
    // // Vault fees
    // builder.addCase(fetchCakeVaultFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
    //   const fees = action.payload
    //   state.cakeVault = { ...state.cakeVault, fees }
    // })
    // // Vault user data
    // builder.addCase(fetchCakeVaultUserData.fulfilled, (state, action: PayloadAction<SerializedLockedVaultUser>) => {
    //   const userData = action.payload
    //   userData.isLoading = false
    //   state.cakeVault = { ...state.cakeVault, userData }
    // })
    builder.addMatcher(
        isAnyOf(
            updateUserAllowance.fulfilled,
            updateUserBalance.fulfilled,
            updateUserStakedBalance.fulfilled,
            updateUserPendingReward.fulfilled,
        ),
        (state, action: PayloadAction<{ sousId: number; field: string; value: any }>) => {
          const { field, value, sousId } = action.payload
          const index = state.data.findIndex((p) => p.sousId === sousId)

          if (index >= 0) {
            state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
          }
        },
    )
  },
})

// Actions
export const { setPoolsPublicData, setPoolPublicData, setPoolUserData } = PoolsSlice.actions

export default PoolsSlice.reducer
