import {SerializedPool} from "../types";
import {SerializedPoolConfig} from "../../constants/types";
import multicall from "../../utils/multicall";
import erc20 from "../../constants/abis/erc20.json";
import chunk from "lodash/chunk";
import {abi as PYLON_ABI} from "../../constants/abi/ZirconPylon.json";

const fetchPoolCalls = (pool: SerializedPool) => {
    const { token1, token2, stakingToken, lpAddress, pylonAddress} = pool
    console.log(`We are fetching pool: ${pool.sousId}`, pool)
    console.log(`For sousId: ${pool.sousId} tokenBalanceLP is the call of the balance of token 1 ${token1.address} and token 2 ${token2.address} in the LP contract ${lpAddress},
    quoteTokenBalanceLp is the same thing but for token 2 ${token2.address}, pylonTokenBalanceLP is the balance of token 1 ${token1.address} in the pylon contract ${pylonAddress},
    and pylonQuote thing is for token2, stakedTokenBalanceMC is the balance of the staking token ${stakingToken.address} in the contractAddress ${pool.contractAddress},
    lpTotalSupply is the total supply of Lp tokens, so calling totalSupply at ${lpAddress}, token decimals are what they say, ptb is the balance of liquidityPoolTokens
    in the pylon, staked totalSupply is the ts of the staking token ${stakingToken.address}, vaultTotalSupply is the ts of the vault token ${pool.vaultAddress},
    psionicFarmBalance is the balance of VaultTokens inside the contractAddress`)
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
            params: [pool.contractAddress],
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
    ]

}

export const fetchPublicPoolData = async (pools: SerializedPoolConfig[]): Promise<any[]> => {
    const farmCalls = pools.flatMap((pool) => fetchPoolCalls(pool))
    const chunkSize = farmCalls.length / pools.length
    const farmMultiCallResult = await multicall(erc20, farmCalls)
    return chunk(farmMultiCallResult, chunkSize)
}


export const fetchGammas = async (pools: SerializedPoolConfig[]): Promise<any[]> => {
    const farmCalls = pools.flatMap((pool) => ([{address: pool.pylonAddress, name: 'gammaMulDecimals'}, {address: pool.pylonAddress, name: 'virtualAnchorBalance'}]))
    const farmMultiCallResult = await multicall(PYLON_ABI, farmCalls)
    const chunkSize = farmCalls.length / pools.length
    return chunk(farmMultiCallResult, chunkSize)
}


// export const fetchGammas = async (poolsToFetch: SerializedPoolConfig[]): Promise<any[]> => {
//
//     let pools = Array.from(new Set(poolsToFetch.map(pool => pool.pylonAddress)))
//     const farmCalls = pools.flatMap((address) => ([{address, name: 'gammaMulDecimals'}, {address, name: 'virtualAnchorBalance'}]))
//     const farmMultiCallResult = await multicall(PYLON_ABI, farmCalls)
//     console.log("farmMultiCallResult",farmMultiCallResult)
//     const chunkSize = farmCalls.length / pools.length
//     return chunk(farmMultiCallResult, chunkSize)
//
// }
