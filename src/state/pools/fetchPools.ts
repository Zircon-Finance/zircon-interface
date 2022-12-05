import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import poolsConfig from '../../constants/pools'
import chunk from 'lodash/chunk'
import sousChefV2 from '../../constants/abi/psionicFarmABI.json'
// import sousChefV3 from '../../config/abi/sousChefV3.json'
import { BIG_ZERO } from '../../utils/bigNumber'
import { getAddress } from '../../utils/addressHelpers'
import multicall from '../../utils/multicall'

export const fetchPoolsStakingLimits = async (
  chainId: number,
  poolsWithStakingLimit: number[],
): Promise<{ [key: string]: { stakingLimit: BigNumber; numberBlocksForUserLimit: number } }> => {
  const validPools = poolsConfig
    .filter((p) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)
    .filter((p) => !poolsWithStakingLimit.includes(p.sousId))

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
      [validPools[index].sousId]: { stakingLimit, numberBlocksForUserLimit },
    }
  }, {})
}

// const poolsWithV3 = poolsConfig.filter((pool) => pool?.version === 3)

// export const fetchPoolsProfileRequirement = async (): Promise<{
//   [key: string]: {
//     required: boolean
//     thresholdPoints: BigNumber
//   }
// }> => {
//   const poolProfileRequireCalls = poolsWithV3
//     .map((validPool) => {
//       const contractAddress = getAddress(validPool.contractAddress)
//       return ['pancakeProfileIsRequested', 'pancakeProfileThresholdPoints'].map((method) => ({
//         address: contractAddress,
//         name: method,
//       }))
//     })
//     .flat()

//   const poolProfileRequireResultRaw = await multicallv2(sousChefV3, poolProfileRequireCalls, { requireSuccess: false })
//   const chunkSize = poolProfileRequireCalls.length / poolsWithV3.length
//   const poolStakingChunkedResultRaw = chunk(poolProfileRequireResultRaw.flat(), chunkSize)
//   return poolStakingChunkedResultRaw.reduce((accum, poolProfileRequireRaw, index) => {
//     const hasProfileRequired = poolProfileRequireRaw[0]
//     const profileThresholdPoints = poolProfileRequireRaw[1]
//       ? new BigNumber(poolProfileRequireRaw[1].toString())
//       : BIG_ZERO
//     return {
//       ...accum,
//       [poolsWithV3[index].sousId]: {
//         required: hasProfileRequired,
//         thresholdPoints: profileThresholdPoints.toJSON(),
//       },
//     }
//   }, {})
// }
