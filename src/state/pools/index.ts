import { createAsyncThunk, createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import poolsConfig from '../../constants/pools'
import {
  PoolsState,
  SerializedPool,
  EarningTokenInfo,
  // SerializedCakeVault,
  // SerializedLockedVaultUser,
} from '../../state/types'
import cakeAbi from '../../constants/abis/erc20.json'
// import { getCakeVaultAddress } from 'utils/addressHelpers'
import tokens from '../../constants/tokens'
import {
  fetchPoolsBlockLimits,
  // fetchPoolsProfileRequirement,
  fetchPoolsStakingLimits,
  fetchPoolsTotalStaking,
} from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserPendingRewards,
  fetchUserStakeBalances,
} from './fetchPoolsUser'
// import { fetchPublicVaultData, fetchVaultFees } from './fetchVaultPublic'
// import fetchVaultUser from './fetchVaultUser'
import priceHelperLpsConfig from '../../constants/poolsHelperLps'

import { resetUserState } from '../global/actions'
import {BIG_TEN, BIG_ZERO} from '../../utils/bigNumber'
import multicall from '../../utils/multicall'
// import { getBalanceNumber } from '../../utils/formatBalance'
// import { getPoolApr } from '../../utils/apr'
import fetchPools from "./fetchPoolsInfo";
import getPoolsPrices from "./getPoolsPrices";
// import {fetchRewardsData} from "./fetchRewardsData";
import {getPoolApr} from "../../utils/apr";
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

export const fetchCakePoolUserDataAsync = (account: string) => async (dispatch) => {
  const allowanceCall = {
    address: tokens.cake.address,
    name: 'allowance',
    params: [account,
      // cakeVaultAddress
    ],
  }
  const balanceOfCall = {
    address: tokens.cake.address,
    name: 'balanceOf',
    params: [account],
  }
  const cakeContractCalls = [allowanceCall, balanceOfCall]
  const [[allowance], [stakingTokenBalance]] = await multicall(cakeAbi, cakeContractCalls)

  dispatch(
      setPoolUserData({
        sousId: 0,
        data: {
          allowance: new BigNumber(allowance.toString()).toJSON(),
          stakingTokenBalance: new BigNumber(stakingTokenBalance.toString()).toJSON(),
        },
      }),
  )
}

export const fetchPoolsPublicDataAsync = (currentBlockNumber: number) => async (dispatch, getState) => {
  try {
    const [blockLimits, totalStakings, currentBlock] = await Promise.all([
      fetchPoolsBlockLimits(),
      fetchPoolsTotalStaking(),
      currentBlockNumber ? Promise.resolve(currentBlockNumber) : simpleRpcProvider.getBlockNumber(),
    ])

    const rewardsData = []
    for (let i = 0; i < poolsConfig.length; i++) {
      rewardsData[i] = await fetchRewardsData(poolsConfig[i])
    }
    const poolsInformation = await fetchPools(poolsConfig)
    let poolsPrices = await getPoolsPrices(poolsInformation)

    const priceHelperInformation = await fetchPools(priceHelperLpsConfig)
    let priceZRGMOVR = await getPoolsPrices(priceHelperInformation)

    const liveData = poolsPrices.map((pool, i) => {
      // Checking for block limits and total Staking
      const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
      const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)

      // Checking if pool is finished, either by the value on the files or because the block limit has been reached
      const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
      const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded
      const blockRemaining = blockLimit?.endBlock-currentBlock

      // Checking Rewards already distributed
      // As of Contract calculation on initialize it is minted 1e18 Psionic tokens to the farm contract so...
      const tokensRemaining = new BigNumber(blockRemaining).times(1e18)
      const pendingRewards = new BigNumber(pool.psionicFarmBalance).minus(tokensRemaining)
      
      // Price of staked Token in USD
      const stakingTokenPrice = new BigNumber(pool.staked.toString()).multipliedBy(new BigNumber(pool.quotePrice)).toNumber()

      // Earning Tokens Information (ZRG, MOVR)
      let earningTokenInfo: EarningTokenInfo[] = pool.earningToken.map((token,index) => {
        // Calculating remaining balance
        const balance = new BigNumber(rewardsData[i][0][index]?.balance?.toString())
        const balanceDivided = balance.dividedBy(new BigNumber(1e18))

        // Calculating rewards per block (removing the pending exceeding rewards)
        const pending = new BigNumber(pendingRewards).multipliedBy(balanceDivided).dividedBy(pool.vaultTotalSupply)
        const remaining = (balanceDivided).minus(pending)
        let blockReward = remaining.dividedBy(blockRemaining)

        // Obtaining Price (Normally ZRG will be Float side and MOVR Stable Side
        let price = token.symbol === "ZRG" ? priceZRGMOVR[0]?.tokenPrice : priceZRGMOVR[0]?.quotePrice

        return {
          symbol: token.symbol,
          blockReward: blockReward.toNumber(),
          blockRewardPrice: new BigNumber(price).times(blockReward).toNumber(),
          current: balance.dividedBy(pool.vaultTotalSupply).toNumber(),
          currentPrice: balance.dividedBy(pool.vaultTotalSupply).multipliedBy(price).toNumber(),
        }
      }) || []



      // Calculating Total Liquidity in USD
      let tokenLiquidity = BigNumber(pool.tokenPrice.toString()).multipliedBy(pool.tokenBalanceTotal).dividedBy(BIG_TEN.pow(pool.tokenDecimals))
      let quoteLiquidity = BigNumber(pool.quotePrice.toString()).multipliedBy(pool.quoteTokenBalanceTotal).dividedBy(BIG_TEN.pow(pool.quoteTokenDecimals))
      let liquidity = String(tokenLiquidity.plus(quoteLiquidity).toString())

      // Calculating APR
      const apr = !isPoolFinished
          ? getPoolApr(
              stakingTokenPrice,
              earningTokenInfo,
          )
          : 0


      return {
        ...blockLimit,
        ...totalStaking,
        earningTokenInfo: earningTokenInfo || [],
        rewardsData: rewardsData[i][0].map((reward) => reward[0].toString()),
        vTotalSupply: pool.vaultTotalSupply,
        liquidity: liquidity,
        zrgPrice: priceZRGMOVR[0]?.tokenPrice,
        movrPrice: priceZRGMOVR[0]?.quotePrice,
        staked: new BigNumber(pool.staked).toString(),
        stakedBalancePool: new BigNumber(pool.stakedBalancePool).toString(),
        apr,
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
