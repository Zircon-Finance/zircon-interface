import {SerializedPoolConfig} from '../../constants/types'
import BigNumber from 'bignumber.js'
import { BIG_TEN } from '../../utils/bigNumber'
import {fetchGammas, fetchPublicPoolData} from './fetchPublicPoolsData'
import { SerializedPool} from '../types'


const fetchPools = async (poolsToFetch: SerializedPoolConfig[]): Promise<SerializedPool[]> => {
    const poolResult = await fetchPublicPoolData(poolsToFetch)
    const gammas = await fetchGammas(poolsToFetch)
    return poolsToFetch.map((pool, index) => {
        const [tokenBalanceLP, quoteTokenBalanceLP, stakedTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals, ptb, stakedTotalSupply, vaultTotalSupply] =
            poolResult[index]
        const [gamma] = gammas[index]
        // const [info, totalAllocPoint] = masterChefResult[index]

        // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
        const lpTokenRatio = new BigNumber(stakedTokenBalanceMC).div(new BigNumber(stakedTotalSupply))
        // Raw amount of token in the LP, including those not staked
        const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
        const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP) //.div(BIG_TEN.pow(quoteTokenDecimals))

        // Amount of quoteToken in the LP that are staked in the MC
        const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)

        // Total staked in LP, in quote token value
        // const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2))
        console.log("tokenRatio", lpTokenRatio.toString(), quoteTokenAmountMc.toString())

        console.log(tokenBalanceLP, quoteTokenBalanceLP)

        // const { pool } = usePool(details.sousId)
        // const balance = useTokenBalance(pool.vaultAddress, token)
        // const blocksLeft = endBlock - Math.max(currentBlock, startBlock)
        // // console.log("current", currentBlock)
        // // console.log("start", startBlock)
        // // console.log("end", endBlock)
        // const rewardBlocksPerDay = (parseFloat((balance?.toFixed(6)))/blocksLeft)*6600


        // const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO
        // const poolWeight = totalAllocPoint ? allocPoint.div(new BigNumber(totalAllocPoint)) : BIG_ZERO
        return {
            ...pool,
            token1: pool.token1,
            token2: pool.token2,
            tokenAmountTotal: tokenAmountTotal.toJSON(),
            quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
            lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
            lpTotalInQuoteToken: quoteTokenAmountMc.toJSON(),
            quoteTokenDecimals: new BigNumber(quoteTokenDecimals).toJSON(),
            lpTokenRatio: lpTokenRatio.toJSON(),
            tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
            gamma: BigNumber(gamma).toJSON(),
            ptb: BigNumber(ptb).toJSON(),
            quoteTokenBalanceLP: BigNumber(quoteTokenBalanceLP).toJSON(),
            vaultTotalSupply: BigNumber(vaultTotalSupply).toJSON(),
            // poolWeight: poolWeight.toJSON(),
            // multiplier: `${allocPoint.div(100).toString()}X`,
        }
    })
}

export default fetchPools
