import {SerializedPoolConfig} from '../../constants/types'
import BigNumber from 'bignumber.js'
import { BIG_TEN } from '../../utils/bigNumber'
import {fetchGammas, fetchPublicPoolData} from './fetchPublicPoolsData'
import { SerializedPool} from '../types'
// import poolsConfig from "../../constants/pools";
// import {JSBI, Pylon} from "zircon-sdk";


const fetchPools = async (poolsToFetch: SerializedPoolConfig[]): Promise<SerializedPool[]> => {
    const poolResult = await fetchPublicPoolData(poolsToFetch)
    const gammas = await fetchGammas(poolsToFetch)

    return poolsToFetch.map((pool, index) => {
        const [tokenBalanceLP, quoteTokenBalanceLP, stakedTokenBalanceMC, tokenDecimals, quoteTokenDecimals] =
            poolResult[index]
        const [gamma] = gammas[index]

        // Raw amount of token in the LP, including those not staked
        const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
        const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))

        return {
            ...pool,
            token1: pool.token1,
            token2: pool.token2,
            tokenAmountTotal: tokenAmountTotal.toJSON(),
            quoteTokenDecimals: new BigNumber(quoteTokenDecimals).toJSON(),
            tokenDecimals: new BigNumber(tokenDecimals).toJSON(),
            tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
            gamma: new BigNumber(gamma).toJSON(),
            stakedBalancePool: new BigNumber(stakedTokenBalanceMC).toJSON(),
        }
    })
}

export default fetchPools
