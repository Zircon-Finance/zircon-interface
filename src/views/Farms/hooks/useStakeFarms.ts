import { useCallback } from 'react'
import { DEFAULT_GAS_LIMIT,
  //  stakeFarm
   } from '../../../utils/calls'
import {
  // useMasterchef,
  useSousChef } from '../../../hooks/useContract'
import BigNumber from 'bignumber.js'
import getGasPrice from '../../../utils/getGasPrice'
import { BIG_TEN } from '../../../utils/bigNumber'

const DEFAULT_TOKEN_DECIMAL = BIG_TEN.pow(18)

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const sousStake = async (sousChefContract, amount, decimals = 18) => {
  const gasPrice = getGasPrice()
  console.log(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString(10))
  return sousChefContract.deposit(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString(10), {
    ...options,
    gasPrice,
  })
}

const sousStakeBnb = async (sousChefContract, amount) => {
  const gasPrice = getGasPrice()
  return sousChefContract.deposit(new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString(), {
    ...options,
    gasPrice,
  })
}

const useStakePool = (sousId: number, isUsingBnb = false) => {
  const sousChefContract = useSousChef(sousId)

  const handleStake = useCallback(
    async (amount: string, decimals: number) => {
      if (isUsingBnb) {
        return sousStakeBnb(sousChefContract, amount)
      }
      return sousStake(sousChefContract, amount, decimals)
    },
    [isUsingBnb, sousChefContract],
  )

  return { onStake: handleStake }
}

export default useStakePool



// const useStakeFarms = (pid: number) => {
//   const masterChefContract = useMasterchef()

//   const handleStake = useCallback(
//     async (amount: string) => {
//       return stakeFarm(masterChefContract, pid, amount)
//     },
//     [masterChefContract, pid],
//   )

//   return { onStake: handleStake }
// }

// export default useStakeFarms
