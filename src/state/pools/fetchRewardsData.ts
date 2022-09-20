import {SerializedPoolConfig, SerializedToken} from "../../constants/types";
import multicall from "../../utils/multicall";
import erc20 from "../../constants/abis/erc20.json";
import chunk from "lodash/chunk";

const fetchPoolCalls = (token: SerializedToken, vault) => {
    return {
        address: token.address,
        name: 'balanceOf',
        params: [vault]
    };
}

export const fetchRewardsData = async (pool: SerializedPoolConfig): Promise<any[]> => {
    const farmCalls = pool.earningToken.flatMap((token) => fetchPoolCalls(token, pool.vaultAddress))
    const chunkSize = farmCalls.length
    const farmMultiCallResult = await multicall(erc20, farmCalls)
    return chunk(farmMultiCallResult, chunkSize)
}
