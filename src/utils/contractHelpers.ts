import type { Signer } from '@ethersproject/abstract-signer'
import type { Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { simpleRpcProvider } from './providers'
import tokens from '../constants/tokens'


// Addresses
import {
  getMasterChefAddress,
  getMulticallAddress,
  getFarmAuctionAddress,
} from './addressHelpers'

// ABI
import bep20Abi from '../constants/abi/erc20.json'
import cakeAbi from '../constants/abi/cake.json'
import masterChef from '../constants/abi/masterchef.json'
import MultiCallAbi from '../constants/abi/Multicall.json'
import farmAuctionAbi from '../constants/abi/farmAuction.json'

const getContract = (abi: any, address: string, signer?: Signer | Provider) => {
  const signerOrProvider = signer ?? simpleRpcProvider
  return new Contract(address, abi, signerOrProvider)
}

export const getBep20Contract = (address: string, signer?: Signer | Provider) => {
  return getContract(bep20Abi, address, signer)
}
export const getCakeContract = (signer?: Signer | Provider) => {
  return getContract(cakeAbi, tokens.cake.address, signer)
}
export const getMasterchefContract = (signer?: Signer | Provider) => {
  return getContract(masterChef, getMasterChefAddress(), signer)
}
export const getMulticallContract = () => {
  return getContract(MultiCallAbi, getMulticallAddress(), simpleRpcProvider)
}
export const getFarmAuctionContract = (signer?: Signer | Provider) => {
  return getContract(farmAuctionAbi, getFarmAuctionAddress(), signer)
}