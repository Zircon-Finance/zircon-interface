import poolsConfig from '../../constants/pools'
import psionicFarmABI from '../../constants/abi/psionicFarmABI.json'
import erc20ABI from '../../constants/abi/erc20.json'
import BigNumber from 'bignumber.js'
import uniq from 'lodash/uniq'
import { getAddress } from '../../utils/addressHelpers'
import multicall from '../../utils/multicall'

export const fetchPoolsAllowance = async (account) => {
    if (!account ) return {};
    const calls = poolsConfig.map((pool) => ({
        address: pool.stakingToken.address,
        name: 'allowance',
        params: [account, getAddress(pool.contractAddress)],
    }))
    const allowances = await multicall(erc20ABI, calls)
    console.log(allowances)
    return poolsConfig.reduce(
        (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }),
        {},
    )
}

export const fetchUserBalances = async (account) => {
    if (!account ) return {};
    const tokens = uniq(poolsConfig.map((pool) => pool.stakingToken.address))
    const calls = tokens.map((token) => ({
        address: token,
        name: 'balanceOf',
        params: [account],
    }))
    console.log("tokens", tokens)

    const tokenBalancesRaw = await multicall(erc20ABI, calls)
    const tokenBalances = tokens.reduce((acc, token, index) => ({ ...acc, [token]: tokenBalancesRaw[index] }), {})
    const poolTokenBalances = poolsConfig.reduce(
        (acc, pool) => ({
            ...acc,
            ...(tokenBalances[pool.stakingToken.address] && {
                [pool.sousId]: new BigNumber(tokenBalances[pool.stakingToken.address]).toJSON(),
            }),
        }),
        {},
    )

    return poolTokenBalances
}

export const fetchUserStakeBalances = async (account) => {
    const calls = poolsConfig.map((p) => ({
        address: getAddress(p.contractAddress),
        name: 'userInfo',
        params: [account],
    }))
    const userInfo = await multicall(psionicFarmABI, calls)
    return poolsConfig.reduce(
        (acc, pool, index) => ({
            ...acc,
            [pool.sousId]: new BigNumber(userInfo[index].amount._hex).toJSON(),
        }),
        {},
    )
}

export const fetchUserPendingRewards = async (account) => {
    const calls = poolsConfig.map((p) => ({
        address: getAddress(p.contractAddress),
        name: 'pendingReward',
        params: [account],
    }))
    const res = await multicall(psionicFarmABI, calls)
    return poolsConfig.reduce(
        (acc, pool, index) => ({
            ...acc,
            [pool.sousId]: new BigNumber(res[index]).toJSON(),
        }),
        {},
    )
}
