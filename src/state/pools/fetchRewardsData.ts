import {SerializedPool} from "../types";
import {SerializedPoolConfig} from "../../constants/types";
import multicall from "../../utils/multicall";
import erc20 from "../../constants/abis/erc20.json";
import chunk from "lodash/chunk";

const fetchPoolCalls = (pool: SerializedPool) => {
    return pool.earningToken.map((token) => ({
        address: token.address,
        name: 'balanceOf',
        params: [pool.vaultAddress]
    }));
}

export const fetchRewardsData = async (pools: SerializedPoolConfig[]): Promise<any[]> => {
    const farmCalls = pools.flatMap((pool) => fetchPoolCalls(pool))
    const chunkSize = farmCalls.length / pools.length
    const farmMultiCallResult = await multicall(erc20, farmCalls)
    return chunk(farmMultiCallResult, chunkSize)
}
