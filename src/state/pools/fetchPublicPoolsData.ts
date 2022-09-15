import {SerializedPool} from "../types";
import {getMasterChefAddress} from "../../utils/addressHelpers";
import {SerializedPoolConfig} from "../../constants/types";
import multicall from "../../utils/multicall";
import erc20 from "../../constants/abis/erc20.json";
import chunk from "lodash/chunk";
import {abi as PYLON_ABI} from "../../constants/abi/ZirconPylon.json";

const fetchPoolCalls = (pool: SerializedPool) => {
    const { token1, token2, stakingToken, lpAddress, pylonAddress} = pool
    return [
        {
            address: token1.address,
            name: 'balanceOf',
            params: [lpAddress],
        },
        // Balance of quote token on LP contract
        {
            address: token2.address,
            name: 'balanceOf',
            params: [lpAddress],
        },
        // Balance of LP tokens in the master chef contract
        {
            address: stakingToken.address,
            name: 'balanceOf',
            params: [getMasterChefAddress()],
        },
        // Total supply of LP tokens
        {
            address: lpAddress,
            name: 'totalSupply',
        },
        // Token decimals
        {
            address: token1.address,
            name: 'decimals',
        },
        // Quote token decimals
        {
            address: token2.address,
            name: 'decimals',
        },
        {
            address: lpAddress,
            name: 'balanceOf',
            params: [pylonAddress],
        },
    ]

}

export const fetchPublicPoolData = async (pools: SerializedPoolConfig[]): Promise<any[]> => {
    const farmCalls = pools.flatMap((pool) => fetchPoolCalls(pool))
    const chunkSize = farmCalls.length / pools.length
    const farmMultiCallResult = await multicall(erc20, farmCalls)
    return chunk(farmMultiCallResult, chunkSize)
}


export const fetchGammas = async (pools: SerializedPoolConfig[]): Promise<any[]> => {
    const farmCalls = pools.map((pool) => ({address: pool.pylonAddress, name: 'gammaMulDecimals'}))
    const farmMultiCallResult = await multicall(PYLON_ABI, farmCalls)
    const chunkSize = farmCalls.length / pools.length
    return chunk(farmMultiCallResult, chunkSize)

}