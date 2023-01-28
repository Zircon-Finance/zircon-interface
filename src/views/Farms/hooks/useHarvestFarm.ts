import { useCallback } from 'react'
import { 
  useBatchPrecompileContract,
  // useMasterchef,
   useSousChef } from '../../../hooks/useContract'
import getGasPrice from '../../../utils/getGasPrice'
import { usePool } from '../../../state/pools/hooks'
import { DeserializedPool } from '../../../state/types'
import { useUserDeadline } from '../../../state/user/hooks'
import { useActiveWeb3React } from '../../../hooks'
import { getPylonRouterContract } from '../../../utils'
import { DEFAULT_GAS_LIMIT } from './useStakeFarms'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const harvestPool = async (sousChefContract) => {
  const gasPrice = getGasPrice()
  return sousChefContract.deposit('0', { ...options, gasPrice })
}

const compoundPool = async (sousChefContract, batchContract, earnings, pool: DeserializedPool, deadline, account, router) => {
  const args = [
  pool.token1.address,
  pool.token2.address,
  earnings,
  '0',
  pool.isAnchor,
  account,
  pool.contractAddress,
  Math.ceil(Date.now() / 1000) + deadline]
  console.log('args', args)


  const harvestTokenCallData = sousChefContract.interface.encodeFunctionData('deposit', ['0'])
  const addLiquidityData = router.interface.encodeFunctionData('addSyncLiquidity', args)

  return batchContract.batchAll(
    [sousChefContract.address, router.address],
    ["000000000000000000", "000000000000000000"],
    [harvestTokenCallData, addLiquidityData],
    []
  )
}

const useHarvestFarm = (contractAddress, earnings) => {
  const {pool} = usePool(contractAddress)
  const sousChefContract = useSousChef(contractAddress)
  const batchContract = useBatchPrecompileContract()
  const [deadline] = useUserDeadline();
  const {account, chainId, library} = useActiveWeb3React()
  const router = getPylonRouterContract(chainId, library, account);

  const handleHarvest = useCallback(async () => {
    return harvestPool(sousChefContract)
  }, [ sousChefContract])

  const handleCompound = useCallback(async () => {
    return compoundPool(sousChefContract, batchContract, earnings, pool, deadline, account, router)
  }, [ sousChefContract])

  return { onReward: handleHarvest, onCompound: handleCompound }
}

export default useHarvestFarm
