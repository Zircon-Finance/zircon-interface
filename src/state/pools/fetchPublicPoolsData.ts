import {SerializedPoolConfig} from "../../constants/types";
import multicall from "../../utils/multicall";
import chunk from "lodash/chunk";
import {abi as PYLON_ABI} from "../../constants/abi/ZirconPylon.json";

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
