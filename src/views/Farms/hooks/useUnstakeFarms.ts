import { useCallback } from 'react'
// import { unstakeFarm } from '../../../utils/calls'
import { 
  // useMasterchef,
   useSousChef } from '../../../hooks/useContract'
import { parseUnits } from '@ethersproject/units'
import getGasPrice from '../../../utils/getGasPrice'

const sousUnstake = (sousChefContract: any, amount: string, decimals: number) => {
  const gasPrice = getGasPrice()
  const units = parseUnits(amount, decimals)

  return sousChefContract.withdraw(units.toString(), {
    gasPrice,
  })
}

const sousEmergencyUnstake = (sousChefContract: any) => {
  const gasPrice = getGasPrice()
  return sousChefContract.emergencyWithdraw({ gasPrice })
}

const useUnstakePool = (contractAddress: string, enableEmergencyWithdraw = false) => {
  const sousChefContract = useSousChef(contractAddress)
  const handleUnstake = useCallback(
    async (amount: string, decimals: number) => {
      if (enableEmergencyWithdraw) {
        return sousEmergencyUnstake(sousChefContract)
      }

      return sousUnstake(sousChefContract, amount, decimals)
    },
    [enableEmergencyWithdraw, sousChefContract],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstakePool

// const useUnstakeFarms = (pid: number) => {
//   const masterChefContract = useMasterchef()

//   const handleUnstake = useCallback(
//     async (amount: string) => {
//       return unstakeFarm(masterChefContract, pid, amount)
//     },
//     [masterChefContract, pid],
//   )

//   return { onUnstake: handleUnstake }
// }

// export default useUnstakeFarms
