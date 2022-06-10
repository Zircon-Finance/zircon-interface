import { useCallback } from 'react'
import { DEFAULT_GAS_LIMIT, 
  // harvestFarm 
} from '../../../utils/calls'
import { 
  // useMasterchef,
   useSousChef } from '../../../hooks/useContract'
import getGasPrice from '../../../utils/getGasPrice'
import { BIG_ZERO } from '../../../utils/bigNumber'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const harvestPool = async (sousChefContract) => {
  const gasPrice = getGasPrice()
  return sousChefContract.deposit('0', { ...options, gasPrice })
}

const harvestPoolBnb = async (sousChefContract) => {
  const gasPrice = getGasPrice()
  return sousChefContract.deposit({ ...options, value: BIG_ZERO, gasPrice })
}

const useHarvestFarm = (sousId, isUsingBnb = false) => {
  const sousChefContract = useSousChef(sousId)

  const handleHarvest = useCallback(async () => {
    if (isUsingBnb) {
      return harvestPoolBnb(sousChefContract)
    }

    return harvestPool(sousChefContract)
  }, [isUsingBnb, sousChefContract])

  return { onReward: handleHarvest }
}

export default useHarvestFarm


// const useHarvestFarm = (farmPid: number) => {
//   const masterChefContract = useMasterchef()

//   const handleHarvest = useCallback(async () => {
//     return harvestFarm(masterChefContract, farmPid)
//   }, [farmPid, masterChefContract])

//   return { onReward: handleHarvest }
// }

// export default useHarvestFarm
