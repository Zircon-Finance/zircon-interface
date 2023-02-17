import type { Signer } from '@ethersproject/abstract-signer'
import type { Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { simpleRpcProvider } from './providers'

// Addresses
import {
  getMasterChefAddress,
  getMulticallAddress,
  getAddress,
} from './addressHelpers'

// ABI
import bep20Abi from '../constants/abi/erc20.json'
import masterChef from '../constants/abi/masterchef.json'
import MultiCallAbi from '../constants/abi/Multicall.json'
import psionicFarm from '../constants/abi/psionicFarmABI.json'
import { useBatchPrecompileContract } from '../hooks/useContract'

const getContract = (chainId: number, abi: any, address: string, signer?: Signer | Provider) => {
  const signerOrProvider = signer ?? simpleRpcProvider(chainId)
  return new Contract(address, abi, signerOrProvider)
}

export const getBep20Contract = (chainId: number, address: string, signer?: Signer | Provider) => {
  return getContract(chainId, bep20Abi, address, signer)
}
export const getMasterchefContract = (chainId: number, signer?: Signer | Provider) => {
  return getContract(chainId, masterChef, getAddress(getMasterChefAddress(chainId)), signer)
}
export const getMulticallContract = (chainId: number) => {
  return getContract(chainId, MultiCallAbi, getAddress(getMulticallAddress(chainId)), simpleRpcProvider(chainId))
}
export const getSouschefContract = (chainId: number, contractAddress: string, signer?: Signer | Provider) => {
  return getContract(chainId, psionicFarm, getAddress(contractAddress), signer)
}

export async function useBatchTransactions(addressList: string[], values: any[], transactionsData: any[], gasPrices: any[]){
  try{
      const batchPrecompileContract = useBatchPrecompileContract()
      const tx = await batchPrecompileContract.batchAll(addressList,values, transactionsData, gasPrices)
      return tx
  }catch(error){
    console.log('Batch all tx error: ', error)
      throw error
  }
}
