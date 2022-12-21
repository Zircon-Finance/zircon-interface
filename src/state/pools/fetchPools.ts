import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import chunk from 'lodash/chunk'
import sousChefV2 from '../../constants/abi/psionicFarmABI.json'
// import sousChefV3 from '../../config/abi/sousChefV3.json'
import { BIG_ZERO } from '../../utils/bigNumber'
import { getAddress } from '../../utils/addressHelpers'
import multicall from '../../utils/multicall'

export const fetchPoolsStakingLimits = async (
  chainId: number,
  pools: any[],
): Promise<{ [key: string]: { stakingLimit: BigNumber; numberBlocksForUserLimit: number } }> => {
  const validPools = pools
    .filter((p) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)

  // Get the staking limit for each valid pool
  const poolStakingCalls = validPools
    .map((validPool) => {
      const contractAddress = getAddress(validPool.contractAddress)
      return ['hasUserLimit', 'poolLimitPerUser', 'numberBlocksForUserLimit'].map((method) => ({
        address: contractAddress,
        name: method,
      }))
    })
    .flat()

  const poolStakingResultRaw = await multicall(chainId, sousChefV2, poolStakingCalls)
  const chunkSize = poolStakingCalls.length / validPools.length
  const poolStakingChunkedResultRaw = chunk(poolStakingResultRaw.flat(), chunkSize)
  return poolStakingChunkedResultRaw.reduce((accum, stakingLimitRaw, index) => {
    const hasUserLimit = stakingLimitRaw[0]
    const stakingLimit = hasUserLimit && stakingLimitRaw[1] ? new BigNumber(stakingLimitRaw[1].toString()) : BIG_ZERO
    const numberBlocksForUserLimit = stakingLimitRaw[2] ? (stakingLimitRaw[2] as EthersBigNumber).toNumber() : 0
    return {
      ...accum,
      [validPools[index].contractAddress]: { stakingLimit, numberBlocksForUserLimit },
    }
  }, {})
}
