import { createAsyncThunk, createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import {
  PoolsState,
  EarningTokenInfo,
} from '../../state/types'
import {
  fetchPoolsStakingLimits,
} from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserPendingRewards,
  fetchUserStakeBalances,
} from './fetchPoolsUser'

import { resetUserState } from '../global/actions'
import {BIG_ZERO} from '../../utils/bigNumber'
import { getApiData } from './helpers'
import { Token } from 'zircon-sdk'

const initialState: PoolsState = {
  data: [],
  userDataLoaded: false,
}

export const fetchPoolsPublicDataAsync = (chainId: number, currentBlock: number) => async (dispatch, getState) => {
  try {
    const apiData = await getApiData(chainId)

    // Get start-end block for each pool
    const blockLimits = apiData?.map((pool) => {
      return {
        contractAddress: pool.contractAddress,
        startBlock: parseInt(pool.startBlock),
        endBlock: parseInt(pool.endBlock)
      }
    })

    // const poolsInformation = await fetchPools(chainId, apiData)
    const priceZRGMOVR = {zrg: apiData[0]?.zrgPrice, movr: apiData[0]?.movrPrice}

    const liveData = apiData.map((pool, i) => {
      const apiPool = apiData.filter((poolArray) => poolArray.contractAddress === pool.contractAddress.toLowerCase());
      const blockLimit = blockLimits.find((entry) => entry.contractAddress.toLowerCase() === pool.contractAddress.toLowerCase())

      // Checking if pool is finished, either by the value on the files or because the block limit has been reached
      const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
      const isPoolFinished = isPoolEndBlockExceeded || !apiPool[0]
      const isPoolFinishedRecently = isPoolFinished && currentBlock - Number(blockLimit.endBlock) <= 195000
      const isPoolArchived = isPoolFinished && currentBlock - Number(blockLimit.endBlock) >= 195000
      
      let earningTokenInfo: EarningTokenInfo[] = apiPool[0]?.earningTokenInfo?.filter((entry) => entry.blockReward !== '0').map((earningInfo,index) => {
        return {
          symbol: earningInfo?.tokenSymbol,
          blockReward: earningInfo?.blockReward,
          blockRewardPrice: earningInfo?.blockRewardPrice,
          current: earningInfo?.current,
          currentPrice: earningInfo?.currentPrice,
        }
      }) || []

      return {
        ...pool,
        token1: new Token(chainId, apiPool[0]?.tokens?.token0?.address, apiPool[0]?.tokens?.token0?.decimals, 
          apiPool[0]?.tokens?.token0?.symbol === 'WMOVR' ? 'MOVR' : apiPool[0]?.tokens?.token0?.symbol,
          apiPool[0]?.tokens?.token0?.symbol === 'WMOVR' ? 'MOVR' : apiPool[0]?.tokens?.token0?.symbol),
        token2: new Token(chainId, apiPool[0]?.tokens?.token1?.address, apiPool[0]?.tokens?.token1?.decimals, 
          apiPool[0]?.tokens?.token1?.symbol === 'WMOVR' ? 'MOVR' : apiPool[0]?.tokens?.token1?.symbol,
          apiPool[0]?.tokens?.token1?.symbol === 'WMOVR' ? 'MOVR' : apiPool[0]?.tokens?.token1?.symbol),
        ...blockLimit,
        isClassic: false,
        isAnchor: apiPool[0]?.isAnchor,
        stakingToken: new Token(chainId, apiPool[0]?.stakedToken, 18, 'ZPT', 'Zircon Pool Token'),
        earningToken: apiPool[0]?.earningTokenInfo?.filter((entry) => entry.blockReward !== '0').map((earningInfo) => {
          return new Token(chainId, 
            (earningInfo?.tokenSymbol === 'wMOVR' ? '0x98878B06940aE243284CA214f92Bb71a2b032B8A' : '0x4545E94974AdACb82FC56BCf136B07943e152055'), 
            18, earningInfo?.tokenSymbol, earningInfo?.tokenSymbol)
        }),
        earningTokenInfo: earningTokenInfo || [],
        vTotalSupply: apiPool[0]?.psiTS,
        liquidity: {pylon: parseFloat(apiPool[0]?.tvl.tvlPylon), pair: parseFloat(apiPool[0]?.tvl.tvlPair)},
        reserves: {reserve0: parseFloat(apiPool[0]?.reserves.r0Complete), reserve1: parseFloat(apiPool[0]?.reserves.r1Complete)},
        zrgPrice: priceZRGMOVR?.zrg,
        movrPrice: priceZRGMOVR?.movr,
        staked: new BigNumber(apiPool[0]?.staked).toString(),
        apr: parseFloat(apiPool[0]?.apr) + parseFloat(apiPool[0]?.feesAPR),
        baseApr: parseFloat(apiPool[0]?.apr),
        feesApr: parseFloat(apiPool[0]?.feesAPR),
        isFinished: isPoolFinished,
        isFinishedRecently: isPoolFinishedRecently,
        isArchived: isPoolArchived,
        quotingPrice: apiPool[0]?.stablePrice,
        tokenPrice: apiPool[0]?.tokenPrice,
        stakedRatio: new BigNumber(apiPool[0]?.stakedRatio).toNumber(),
        stakedBalancePool: new BigNumber(apiPool[0]?.totalStaked).toString(),
        contractAddress: apiPool[0]?.contractAddress,
        vaultAddress: apiPool[0]?.vaultAddress,
        lpAddress: apiPool[0]?.lpAddress,
        pylonAddress: apiPool[0]?.pylonAddress,
      }
    })
    if (getState().pools.data.length === 0 || getState().pools.data[0]?.tokens?.token0?.chainId !== chainId) {dispatch(setPoolsPublicData(liveData))}
  } catch (error) {
    console.error('[Pools Action] error when getting public data', error)
  }
}

export const fetchPoolsStakingLimitsAsync = () => async (dispatch, getState, chainId) => {
  const poolsWithStakingLimit = getState().pools.data

  try {
    const stakingLimits = await fetchPoolsStakingLimits(chainId, poolsWithStakingLimit)

    const stakingLimitData = poolsWithStakingLimit.map((pool) => {
      if (poolsWithStakingLimit.includes(pool.contractAddress)) {
        return { contractAddress: pool.contractAddress }
      }
      const { stakingLimit, numberBlocksForUserLimit } = stakingLimits[pool.contractAddress] || {
        stakingLimit: BIG_ZERO,
        numberBlocksForUserLimit: 0,
      }
      return {
        contractAddress: pool.contractAddress,
        stakingLimit: stakingLimit.toJSON(),
        numberBlocksForUserLimit,
      }
    })

    getState().pools.data.length === 0 && dispatch(setPoolsPublicData(stakingLimitData))
  } catch (error) {
    console.error('[Pools Action] error when getting staking limits', error)
  }
}

export const fetchPoolsUserDataAsync = createAsyncThunk<
    { contractAddress: string; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[],
    {chainId: number; account: string; pools: any[] }
    >('pool/fetchPoolsUserData', async ({chainId, account, pools}, { rejectWithValue }) => {
  try {
    const [allowances, stakingTokenBalances, stakedBalances, pendingRewards] = await Promise.all([
      fetchPoolsAllowance(account, chainId, pools),
      fetchUserBalances(account, chainId, pools),
      fetchUserStakeBalances(account, chainId, pools),
      fetchUserPendingRewards(account, chainId, pools),
    ])

    const userData = pools.map((pool) => ({
      contractAddress: pool.contractAddress,
      allowance: allowances[pool.contractAddress],
      stakingTokenBalance: stakingTokenBalances[pool.contractAddress],
      stakedBalance: stakedBalances[pool.contractAddress],
      pendingReward: pendingRewards[pool.contractAddress],
    }))
    return userData
  } catch (e) {
    return rejectWithValue(e)
  }
})

export const updateUserAllowance = createAsyncThunk<
    { contractAddress: string; field: string; value: any },
    { contractAddress: string; account: string, chainId: number, pools: any[] }
    >('pool/updateUserAllowance', async ({ contractAddress, account, chainId, pools }) => {
  const allowances = await fetchPoolsAllowance(account, chainId, pools)
  return { contractAddress, field: 'allowance', value: allowances[contractAddress] }
})

export const updateUserBalance = createAsyncThunk<
    { contractAddress: string; field: string; value: any },
    { contractAddress: string; account: string; chainId: number, pools: any[] }
    >('pool/updateUserBalance', async ({ contractAddress, account, chainId, pools }) => {
  const tokenBalances = await fetchUserBalances(account, chainId, pools)
  return { contractAddress, field: 'stakingTokenBalance', value: tokenBalances[contractAddress] }
})

export const updateUserStakedBalance = createAsyncThunk<
    { contractAddress: string; field: string; value: any },
    { contractAddress: string; account: string, chainId: number, pools: any[] }
    >('pool/updateUserStakedBalance', async ({ contractAddress, account, chainId, pools }) => {
  const stakedBalances = await fetchUserStakeBalances(account, chainId, pools)
  return { contractAddress, field: 'stakedBalance', value: stakedBalances[contractAddress] }
})

export const updateUserPendingReward = createAsyncThunk<
    { contractAddress: string; field: string; value: any },
    { contractAddress: string; account: string, chainId: number, pools: any[] }
    >('pool/updateUserPendingReward', async ({ contractAddress, account, chainId, pools}) => {
  const pendingRewards = await fetchUserPendingRewards(account, chainId, pools)
  return { contractAddress, field: 'pendingReward', value: pendingRewards[contractAddress] }
})

export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    setPoolPublicData: (state, action) => {
      const { contractAddress } = action.payload
      const poolIndex = state.data.findIndex((pool) => pool.contractAddress === contractAddress)
      state.data[poolIndex] = {
        ...state.data[poolIndex],
        ...action.payload.data,
      }
    },
    setPoolUserData: (state, action) => {
      const { contractAddress } = action.payload
      state.data = state.data.map((pool) => {
        if (pool.contractAddress === contractAddress) {
          return { ...pool, userDataLoaded: true, userData: action.payload.data }
        }
        return pool
      })
    },
    setPoolsPublicData: (state, action) => {
      state.data = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map(({ userData, ...pool }) => {
        return { ...pool }
      })
      state.userDataLoaded = false
    })
    builder.addCase(
        fetchPoolsUserDataAsync.fulfilled,
        (
            state,
            action: PayloadAction<
                { contractAddress: string; allowance: any; stakingTokenBalance: any; stakedBalance: any; pendingReward: any }[]
                >,
        ) => {
          const userData = action.payload
          state.data = state.data.map((pool) => {
            const userPoolData = userData.find((entry) => entry.contractAddress === pool.contractAddress)
            return { ...pool, userDataLoaded: true, userData: userPoolData }
          })
          state.userDataLoaded = true
        },
    )
    builder.addCase(fetchPoolsUserDataAsync.rejected, (state, action) => {
      console.error('[Pools Action] Error fetching pool user data', action.payload)
    })
    builder.addMatcher(
        isAnyOf(
            updateUserAllowance.fulfilled,
            updateUserBalance.fulfilled,
            updateUserStakedBalance.fulfilled,
            updateUserPendingReward.fulfilled,
        ),
        (state, action: PayloadAction<{ contractAddress: string; field: string; value: any }>) => {
          const { field, value, contractAddress } = action.payload
          const index = state.data.findIndex((p) => p.contractAddress === contractAddress)

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
