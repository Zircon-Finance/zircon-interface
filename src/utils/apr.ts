import BigNumber from 'bignumber.js'
import lpAprs from '..//constants/lpAprs.json'

const BSC_BLOCK_TIME = 13.5
export const CAKE_PER_BLOCK = 40
export const BLOCKS_PER_YEAR = (60 / BSC_BLOCK_TIME) * 60 * 24 * 365 // 10512000
export const CAKE_PER_YEAR = CAKE_PER_BLOCK * BLOCKS_PER_YEAR

/**
 * Get the APR value in %
 * @param stakingTokenPrice Token price in the same quote currency
 * @param rewardTokenPrice Token price in the same quote currency
 * @param totalStaked Total amount of stakingToken in the pool
 * @param tokenPerBlock Amount of new cake allocated to the pool for each new block
 * @returns Null if the APR is NaN or infinite.
 */
export const getPoolApr = (
  stakingTokenPrice: number,
  rewardTokenPrice: number[],
  // totalStaked: number,
  // tokenPerBlock: number,
): number => {
  const totalRewardPricePerYear = rewardTokenPrice.reduce((o, n) => {
    return new BigNumber(o).times(BLOCKS_PER_YEAR).plus(new BigNumber(n).times(BLOCKS_PER_YEAR)).toNumber()
  })

  console.log("totalRewardPricePerYear", totalRewardPricePerYear)
  // To fix ^
  const totalStakingTokenInPool = new BigNumber(stakingTokenPrice)//.times(totalStaked)
  console.log("totalStakingTokenInPool", totalStakingTokenInPool.toString())

  const apr = new BigNumber(totalRewardPricePerYear).div(totalStakingTokenInPool).times(100)
  return apr.isNaN() || !apr.isFinite() ? null : apr.toNumber()
}

export const getPoolAprAddress = (
  address: string): string => {
  const lpApr = lpAprs[address]
  if (!lpApr) {
    return null
  }
  return lpApr
}

/**
 * Get farm APR value in %
 * @param poolWeight allocationPoint / totalAllocationPoint
 * @param cakePriceUsd Cake price in USD
 * @param poolLiquidityUsd Total pool liquidity in USD
 * @param farmAddress Farm Address
 * @returns Farm Apr
 */
export const getFarmApr = (
  poolWeight: BigNumber,
  cakePriceUsd: BigNumber,
  poolLiquidityUsd: BigNumber,
  farmAddress: string,
): { cakeRewardsApr: number; lpRewardsApr: number } => {
  const yearlyCakeRewardAllocation = poolWeight ? poolWeight.times(CAKE_PER_YEAR) : new BigNumber(NaN)
  const cakeRewardsApr = yearlyCakeRewardAllocation.times(cakePriceUsd).div(poolLiquidityUsd).times(100)
  let cakeRewardsAprAsNumber = null
  if (!cakeRewardsApr.isNaN() && cakeRewardsApr.isFinite()) {
    cakeRewardsAprAsNumber = cakeRewardsApr.toNumber()
  }
  const lpRewardsApr = lpAprs[farmAddress?.toLocaleLowerCase()] ?? 0
  return { cakeRewardsApr: cakeRewardsAprAsNumber, lpRewardsApr }
}

export default null
