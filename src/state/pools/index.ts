import { createAsyncThunk, createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import poolsConfig from '../../constants/pools'
import {
  PoolsState,
  SerializedPool,
  // SerializedVaultFees,
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
    const [blockLimits, totalStakings] = await Promise.all([
      fetchPoolsBlockLimits(),
      fetchPoolsTotalStaking(),
      // currentBlockNumber ? Promise.resolve(currentBlockNumber) : simpleRpcProvider.getBlockNumber(),
    ])

    // const activePriceHelperLpsConfig = priceHelperLpsConfig.filter((priceHelperLpConfig) => {
    //   return (
    //     poolsConfig
    //       .filter((pool) => pool.earningToken.map((token) => token.address.toLowerCase() === priceHelperLpConfig.token.address.toLowerCase())).length > 0
    //       // .filter((pool) => {
    //       //   // const poolBlockLimit = blockLimits.find((blockLimit) => blockLimit.sousId === pool.sousId)
    //       //   // if (poolBlockLimit) {
    //       //   //   return poolBlockLimit.endBlock > currentBlock
    //       //   // }
    //       //   return false
    //       // })
    //   )
    // })
    const rewardsData = []
    for (let i = 0; i < poolsConfig.length; i++) {
      rewardsData[i] = await fetchRewardsData(poolsConfig[i])
    }
    const poolsInformation = await fetchPools(poolsConfig)
    let poolsPrices = await getPoolsPrices(poolsInformation)

    const priceHelperInformation = await fetchPools(priceHelperLpsConfig)
    let priceZRG = await getPoolsPrices(priceHelperInformation)

    // const farmsWithPricesOfDifferentTokenPools = bnbBusdFarm
    //   ? getFarmsPrices([bnbBusdFarm])
    //   : []
    // console.log("prices",farmsData, farmsWithPricesOfDifferentTokenPools);
    // usd * reward / (1 - gamma) * resTR*2*usd
    // const prices = getTokenPricesFromFarm([...farmsData, ...farmsWithPricesOfDifferentTokenPools])
    const liveData = poolsPrices.map((pool, i) => {
      const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
      const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
      // // const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
      const isPoolFinished = pool.isFinished
      // // || isPoolEndBlockExceeded
      //


      // const stakingTokenAddress = pool.stakingToken.address ? pool.stakingToken.address.toLowerCase() : null
      // const stakingTokenPrice = pool.price
      //
      // const earningTokenAddress = pool.earningToken.map((token) => token.address ? token.address.toLowerCase() : null)
      // const earningTokenPrice = earningTokenAddress ? earningTokenAddress.map((token) => prices[token]) : [0,0]
      // return JSBI.divide(JSBI.multiply(JSBI.subtract(BASE, parseBigintIsh(gamme)), JSBI.divide(JSBI.multiply(JSBI.multiply(parseBigintIsh(reserve), TWO), parseBigintIsh(ptb)), parseBigintIsh(ptt))), BASE);

      // console.log("values::", pool.lpTotalInQuoteToken, pool.gamma, new BigNumber(pool.ptb.toString()), pool.lpTotalSupply)
      // let liquidityBySDK = Pylon.calculateLiquidity(pool.gamma, JSBI.BigInt(new BigNumber(pool.lpTotalInQuoteToken.toString()).toString()),
      //     JSBI.BigInt(new BigNumber(pool.ptb.toString()).toString()), JSBI.BigInt(new BigNumber(pool.lpTotalSupply.toString()).toString()))

      // console.log("liquidityBySDK", liquidityBySDK.toString())
      const stakingTokenPrice = new BigNumber(pool.staked.toString()).multipliedBy(new BigNumber(pool.quotePrice)).toNumber()

      /// TODO: do the calculations here instead of in the component
      // let earningTokenPerBlock = pool.earningToken.map((token,index) => {
      //   if (token.symbol === "1SWAP") {
      //     return new BigNumber(rewardsData[i][index].balance.toString()).dividedBy(new BigNumber(10).pow(18)).dividedBy(blockLimit.endBlock-blockLimit.startBlock).toNumber()
      //   } else if (token.symbol === "MOVR") {
      //     return new BigNumber(rewardsData[i][index].balance.toString()).dividedBy(new BigNumber(10).pow(18)).dividedBy(blockLimit.endBlock-blockLimit.startBlock).toNumber()
      //   }else {
      //     return 0
      //   }
      // })

      // console.log("rewardsData", rewardsData)
      let earningTokenPrice = pool.earningToken.map((token,index) => {
        if (token.symbol === "ZRG") {
          return new BigNumber(priceZRG[0]?.tokenPrice).times(rewardsData[i][0][index]?.balance?.toString()).dividedBy(new BigNumber(10).pow(18)).dividedBy(blockLimit?.endBlock-blockLimit?.startBlock).toNumber()
        } else if (token.symbol === "MOVR") {
          return new BigNumber(priceZRG[0]?.quotePrice).times(rewardsData[i][0][index]?.balance?.toString()).dividedBy(new BigNumber(10).pow(18)).dividedBy(blockLimit?.endBlock-blockLimit?.startBlock).toNumber()
        }else {
          return 0
        }
      })
      let liquidity  = String(BigNumber(pool.quotePrice.toString()).multipliedBy(pool.quoteTokenBalanceLP).multipliedBy(2).dividedBy(BIG_TEN.pow(pool.quoteTokenDecimals)).toString())

      const apr = !isPoolFinished
          ? getPoolApr(
              stakingTokenPrice,
              earningTokenPrice,
          )
          : 0
      return {
        ...blockLimit,
        ...totalStaking,
        earningTokenPrice: earningTokenPrice,
        rewardsData: rewardsData[i][0].map((reward) => reward[0].toString()),
        vTotalSupply: pool.vaultTotalSupply,
        liquidity: liquidity ,
        apr,
        isFinished: isPoolFinished,
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
