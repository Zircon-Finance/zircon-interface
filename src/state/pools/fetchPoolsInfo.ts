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

        // let it = index%2===0 ? index : Math.abs(index/2)-1
        // console.log("index", it)
        // const [gamma, virtualAnchorBalance] = gammas[it]
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
        const pylonTokenToQuote = (new BigNumber(pylonTokenBalanceLP).multipliedBy(ratio)).div(BIG_TEN.pow(tokenDecimals))

        const pylonRatio = new BigNumber(ptb).div(lpTotalSupply) // Ratio of LP Tokens that are in the Pylon
        const gammaTotal = new BigNumber(gamma).div(BIG_TEN.pow(18)) // Ratio of LP Tokens that are in the Pylon
        const vabTotal = new BigNumber(virtualAnchorBalance).div(BIG_TEN.pow(quoteTokenDecimals)) // Ratio of LP Tokens that are in the Pylon

        console.log("pylon ratio", lpTotalInQuoteToken.toString(), gammaTotal.toString(), pylonTokenToQuote.toString(), pylonRatio.toString(), virtualAnchorBalance.toString(), lpTokenRatio.toString())

        const floatStaked = ((new BigNumber(lpTotalInQuoteToken).multipliedBy(gammaTotal)).multipliedBy(pylonRatio)).plus(pylonTokenToQuote)

        // const stakedFL = floatStaked.multipliedBy(BIG_TEN.pow(18)).dividedBy(stakedTokenBalanceMC)
        // console.log("stakedFL", stakedFL.toString(), lpTokenRatio.toString())
        //
        // const stakedSL = new BigNumber(virtualAnchorBalance).dividedBy(stakedTotalSupply)
        // console.log("vab", virtualAnchorBalance.toString(), stakedTotalSupply.toString(), stakedSL.toString())
        // For APR Calculation

        const staked = pool.isAnchor ? new BigNumber(vabTotal).multipliedBy(lpTokenRatio) : floatStaked;

        // const stakedRatio = staked.div(stakedTokenBalanceMC)
        console.log("staRa: ", pool.token1.symbol, pool.token2.symbol, pool.isAnchor, staked.toString())
        // console.log("staked", staked.toString(), stakedFL.toString(), stakedSL.toString(), staked.toString())

        return {
            ...pool,
            token1: pool.token1,
            token2: pool.token2,
            tokenAmountTotal: tokenAmountTotal.toJSON(),
            quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
            lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
            lpTotalInQuoteToken: quoteTokenAmountMc.toJSON(),
            quoteTokenDecimals: new BigNumber(quoteTokenDecimals).toJSON(),
            tokenDecimals: new BigNumber(tokenDecimals).toJSON(),
            lpTokenRatio: lpTokenRatio.toJSON(),
            tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
            gamma: new BigNumber(gamma).toJSON(),
            ptb: new BigNumber(ptb).toJSON(),
            stakedBalancePool: new BigNumber(stakedTokenBalanceMC).toJSON(),
            staked: new BigNumber(staked).toJSON(),
            quoteTokenBalanceTotal: (new BigNumber(quoteTokenBalanceLP).plus(pylonQuoteBalanceLP)).toJSON(),
            tokenBalanceTotal: (new BigNumber(tokenBalanceLP).plus(pylonTokenBalanceLP)).toJSON(),
            vaultTotalSupply: new BigNumber(vaultTotalSupply).toJSON()
            // poolWeight: poolWeight.toJSON(),
            // multiplier: `${allocPoint.div(100).toString()}X`,
        }
    })
}

export default fetchPools
