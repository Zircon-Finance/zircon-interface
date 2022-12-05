import BigNumber from 'bignumber.js'
import poolsConfig from '../../constants/pools'
import sousChefV2 from '../../constants/abi/psionicFarmABI.json'
import multicall from '../multicall'
import { simpleRpcProvider } from '../providers'
import { getAddress } from '../addressHelpers'

export const DEFAULT_GAS_LIMIT = 200000

/**
 * Returns the total number of pools that were active at a given block
 */
 export const getActivePools = async (chainId: number, block?: number) => {
  const eligiblePools = poolsConfig
    .filter((pool) => pool.sousId !== 0)
    .filter((pool) => pool.isFinished === false || pool.isFinished === undefined)
  const blockNumber = block || (await simpleRpcProvider(chainId).getBlockNumber())
  const startBlockCalls = eligiblePools.map(({ contractAddress }) => ({
    address: getAddress(contractAddress),
    name: 'startBlock',
  }))
  const endBlockCalls = eligiblePools.map(({ contractAddress }) => ({
    address: getAddress(contractAddress),
    name: 'bonusEndBlock',
  }))
  const [startBlocks, endBlocks] = await Promise.all([
    multicall(chainId, sousChefV2, startBlockCalls),
    multicall(chainId, sousChefV2, endBlockCalls),
  ])

  return eligiblePools.reduce((accum, poolCheck, index) => {
    const startBlock = startBlocks[index] ? new BigNumber(startBlocks[index]) : null
    const endBlock = endBlocks[index] ? new BigNumber(endBlocks[index]) : null

    if (!startBlock || !endBlock) {
      return accum
    }

    if (startBlock.gte(blockNumber) || endBlock.lte(blockNumber)) {
      return accum
    }

    return [...accum, poolCheck]
  }, [])
}
