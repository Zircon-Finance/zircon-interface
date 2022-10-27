import {SerializedPoolConfig} from "../../constants/types";

export const fetchRewardsData = async (data: any[], pool: SerializedPoolConfig): Promise<any[]> => {
    const rewardPool = data.filter((poolArray) => poolArray.contractAddress === pool.contractAddress.toLowerCase());
    const rewardBalances = rewardPool[0]?.earningTokenInfo.map((token) => {
        return {
            balance: token.balance,
            symbol: token.tokenSymbol,
        };
    });
    return rewardBalances
}
