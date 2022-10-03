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
        const [tokenBalanceLP, quoteTokenBalanceLP, pylonTokenBalanceLP, pylonQuoteBalanceLP, stakedTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals, ptb, stakedTotalSupply, vaultTotalSupply] =
            poolResult[index]
        const [gamma, virtualAnchorBalance] = gammas[index]
        // const [info, totalAllocPoint] = masterChefResult[index]
        // console.log("pylon balances", pylonTokenBalanceLP.toString(), pylonQuoteBalanceLP.toString())

        // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
        const lpTokenRatio = new BigNumber(stakedTokenBalanceMC).div(new BigNumber(stakedTotalSupply))
        // Raw amount of token in the LP, including those not staked
        const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
        const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))

        // Amount of quoteToken in the LP that are staked in the MC
        const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)

        // Total staked in LP, in quote token value
        const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2))
        // let inverseGamma = new BigNumber(BIG_TEN.pow(18)).minus(new BigNumber(gamma))

        const ratio = new BigNumber(quoteTokenBalanceLP).div(tokenBalanceLP)
        const pylonRatio = new BigNumber(ptb).div(lpTotalSupply)
        console.log("gamma", gamma.toString())
        const floatStaked = (new BigNumber(lpTotalInQuoteToken).multipliedBy(gamma)).multipliedBy(pylonRatio).plus(new BigNumber(pylonTokenBalanceLP).multipliedBy(ratio)).dividedBy(BIG_TEN.pow(18))
        const stakedFL = floatStaked.multipliedBy(BIG_TEN.pow(18)).dividedBy(stakedTotalSupply)
        const stakedSL = new BigNumber(virtualAnchorBalance).dividedBy(stakedTotalSupply)
        const staked = pool.isAnchor ? new BigNumber(virtualAnchorBalance).multipliedBy(lpTokenRatio).dividedBy(BIG_TEN.pow(quoteTokenDecimals)) : floatStaked;

        console.log("staked", staked.toString(), stakedFL.toString(), stakedSL.toString(), staked.toString())
        // console.log("values::", pool.lpTotalInQuoteToken, pool.gamma, new BigNumber(pool.ptb.toString()), pool.lpTotalSupply)
        // let liquidityBySDK = Pylon.calculateLiquidity(pool.gamma, JSBI.BigInt(new BigNumber(pool.lpTotalInQuoteToken.toString()).toString()),
        //     JSBI.BigInt(new BigNumber(pool.ptb.toString()).toString()), JSBI.BigInt(new BigNumber(pool.lpTotalSupply.toString()).toString()))
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
            gamma: new BigNumber(gamma).toJSON(),
            ptb: new BigNumber(ptb).toJSON(),
            stakedFL: new BigNumber(stakedFL).toJSON(),
            stakedSL: new BigNumber(stakedSL).toJSON(),
            staked: new BigNumber(staked).toJSON(),
            quoteTokenBalanceLP: (new BigNumber(quoteTokenBalanceLP).plus(pylonQuoteBalanceLP)).toJSON(),
            vaultTotalSupply: new BigNumber(vaultTotalSupply).toJSON()
            // poolWeight: poolWeight.toJSON(),
            // multiplier: `${allocPoint.div(100).toString()}X`,
        }
    })
}

export default fetchPools
