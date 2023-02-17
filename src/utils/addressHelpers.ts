import { NETWORK_CHAIN_ID } from '../connectors'
import addresses from '../constants/contracts'
import {FARM_FACTORY_ADDRESS, MULTICALL_ADDRESS} from "zircon-sdk";

// interface Address {
//   97?: string
//   56: string
// }

export enum VaultKey {
  CakeVault = 'cakeVault',
  IfoPool = 'ifoPool',
}
// TODO: When we have to use multiple chains, chainId value has to be dynamic based on   const { chainId } = useActiveWeb3React()
export const getAddress = (address: string): string => {
  const chainId = NETWORK_CHAIN_ID
  return address[chainId] ?? address
}

export const getMasterChefAddress = (chainId) => {
  return FARM_FACTORY_ADDRESS[chainId] //addresses.masterChef
}
export const getMulticallAddress = (chainId) => {
  return MULTICALL_ADDRESS[chainId] //addresses.multiCall
}

// TODO: Delete
export const getFarmAuctionAddress = () => {
  return addresses.farmAuction
}
