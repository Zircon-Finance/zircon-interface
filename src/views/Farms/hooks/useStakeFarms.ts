import { useCallback } from 'react'
import { DEFAULT_GAS_LIMIT,
  //  stakeFarm
   } from '../../../utils/calls'
import {
  useBatchPrecompileContract,
  useERC20,
  // useMasterchef,
  useSousChef } from '../../../hooks/useContract'
import BigNumber from 'bignumber.js'
import getGasPrice from '../../../utils/getGasPrice'
import { BIG_TEN } from '../../../utils/bigNumber'
import { useActiveWeb3React } from '../../../hooks'
import { MaxUint256 } from '@ethersproject/constants'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const sousStake = async (sousChefContract, amount, decimals = 18, stakingTokenContract, batchContract, chainId) => {
  
  const gasPrice = getGasPrice()
  const callData = sousChefContract.interface.encodeFunctionData('deposit', [new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString(10)])
  const approvalCallData = stakingTokenContract.interface.encodeFunctionData('approve', [sousChefContract.address, MaxUint256])

  return chainId === 1285 ?
  batchContract.batchAll(
    [stakingTokenContract.address, sousChefContract.address], 
    ["000000000000000000", "000000000000000000"],
    [approvalCallData, callData],
    []
  )
  : sousChefContract.deposit(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString(10), {
    ...options,
    gasPrice,
  })
}

const useStakePool = (sousId: number, stakingTokenAddress) => {
  const sousChefContract = useSousChef(sousId)
  const batchContract = useBatchPrecompileContract()
  const approvalContract = useERC20(stakingTokenAddress)
  const {chainId} = useActiveWeb3React()
  const handleStake = useCallback(
    async (amount: string, decimals: number) => {
      return sousStake(sousChefContract, amount, decimals, approvalContract, batchContract, chainId)
    },
    [sousChefContract],
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
