import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import poolsConfig from '../../constants/pools'
import psionicFarmABI from '../../constants/abi/psionicFarmABI.json'
import chunk from 'lodash/chunk'
import sousChefV2 from '../../constants/abi/psionicFarmABI.json'
// import sousChefV3 from '../../config/abi/sousChefV3.json'
import { BIG_ZERO } from '../../utils/bigNumber'
import { getAddress } from '../../utils/addressHelpers'
import multicall from '../../utils/multicall'
import erc20ABI from '../../constants/abi/erc20.json'

const poolsWithEnd = poolsConfig.filter((p) => p.sousId !== 0)

const startEndBlockCalls = poolsWithEnd.flatMap((poolConfig) => {
  return [
    {
      address: getAddress(poolConfig.contractAddress),
      name: 'startBlock',
    },
    {
      address: getAddress(poolConfig.contractAddress),
      name: 'bonusEndBlock',
    },
  ]
})

export const fetchPoolsBlockLimits = async () => {
  const startEndBlockRaw = await multicall(psionicFarmABI, startEndBlockCalls)

  const startEndBlockResult = startEndBlockRaw.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 2)

    if (!resultArray[chunkIndex]) {
      // eslint-disable-next-line no-param-reassign
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  return poolsWithEnd.map((cakePoolConfig, index) => {
    const [[startBlock], [endBlock]] = startEndBlockResult[index]
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: startBlock.toNumber(),
      endBlock: endBlock.toNumber(),
    }
  })
}

const poolsBalanceOf = poolsConfig.map((poolConfig) => {
  return {
    address: poolConfig.stakingToken.address,
    name: 'balanceOf',
    params: [getAddress(poolConfig.contractAddress)],
  }
})

export const fetchPoolsTotalStaking = async () => {
  const poolsTotalStaked = await multicall(erc20ABI, poolsBalanceOf)

  return poolsConfig.map((p, index) => ({
    sousId: p.sousId,
    totalStaked: new BigNumber(poolsTotalStaked[index]).toJSON(),
  }))
}

export const fetchPoolsStakingLimits = async (
  poolsWithStakingLimit: number[],
): Promise<{ [key: string]: { stakingLimit: BigNumber; numberBlocksForUserLimit: number } }> => {
  console.log('Poolsconfig', poolsConfig)
  const validPools = poolsConfig
    .filter((p) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)
    .filter((p) => !poolsWithStakingLimit.includes(p.sousId))

  // Get the staking limit for each valid pool
  console.log('fetchPoolsStakingLimits', validPools)
  const poolStakingCalls = validPools
    .map((validPool) => {
      const contractAddress = getAddress(validPool.contractAddress)
      console.log('contractAddress', contractAddress)
      return ['hasUserLimit', 'poolLimitPerUser', 'numberBlocksForUserLimit'].map((method) => ({
        address: contractAddress,
        name: method,
      }))
    })
    .flat()

  const poolStakingResultRaw = await multicall(sousChefV2, poolStakingCalls)
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
