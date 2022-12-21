import psionicFarmABI from '../../constants/abi/psionicFarmABI.json'
import erc20ABI from '../../constants/abi/erc20.json'
import BigNumber from 'bignumber.js'
import uniq from 'lodash/uniq'
import { getAddress } from '../../utils/addressHelpers'
import multicall from '../../utils/multicall'

export const fetchPoolsAllowance = async (account, chainId, pools) => {
    if (!account ) return {};

    const calls = pools.map((pool) => ({
        address: pool.stakingToken.address,
        name: 'allowance',
        params: [account, getAddress(pool.contractAddress)],
    }))

    const allowances = await multicall(chainId, erc20ABI, calls)

    return pools.reduce(
        (acc, pool, index) => ({ ...acc, [pool.contractAddress]: new BigNumber(allowances[index]).toJSON() }),
        {},
    )
}



export const fetchUserBalances = async (account, chainId, pools: any[]) => {
    if (!account ) return {};
    const tokens = uniq(pools.map((pool) => pool.stakingToken.address))
    const calls = tokens.map((token) => ({
        address: token,
        name: 'balanceOf',
        params: [account],
    }))

    const tokenBalancesRaw = await multicall(chainId, erc20ABI, calls)
    const tokenBalances = tokens.reduce((acc, token, index) => ({ ...acc, [token]: tokenBalancesRaw[index] }), {})
    const poolTokenBalances = pools.reduce(
        (acc, pool) => ({
            ...acc,
            ...(tokenBalances[pool.stakingToken.address] && {
                [pool.contractAddress]: new BigNumber(tokenBalances[pool.stakingToken.address]).toJSON(),
            }),
        }),
        {},
    )

    return poolTokenBalances
}

export const fetchUserStakeBalances = async (account, chainId, pools) => {
    const calls = pools.map((p) => ({
        address: getAddress(p.contractAddress),
        name: 'userInfo',
        params: [account],
    }))
    const userInfo = await multicall(chainId, psionicFarmABI, calls)
    return pools.reduce(
        (acc, pool, index) => ({
            ...acc,
            [pool.contractAddress]: new BigNumber(userInfo[index].amount._hex).toJSON(),
        }),
        {},
    )
}

export const fetchUserPendingRewards = async (account, chainId, pools) => {
    const calls = pools.map((p) => ({
        address: getAddress(p.contractAddress),
        name: 'pendingReward',
        params: [account],
    }))
    const res = await multicall(chainId, psionicFarmABI, calls)
    return pools.reduce(
        (acc, pool, index) => ({
            ...acc,
            [pool.contractAddress]: new BigNumber(res[index]).toJSON(),
        }),
        {},
    )
}
