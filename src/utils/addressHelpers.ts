import { NETWORK_CHAIN_ID } from '../connectors'
import addresses from '../constants/contracts'

// interface Address {
//   97?: string
//   56: string
// }

export enum VaultKey {
  CakeVault = 'cakeVault',
  IfoPool = 'ifoPool',
}

export const getAddress = (address: string): string => {
  const chainId = NETWORK_CHAIN_ID
  return address[chainId] ?? address
}

export const getMasterChefAddress = () => {
  return addresses.masterChef
}
export const getMulticallAddress = () => {
  return addresses.multiCall
}
export const getBunnyFactoryAddress = () => {
  return addresses.bunnyFactory
}

export const getVaultPoolAddress = (vaultKey: VaultKey) => {
  if (!vaultKey) {
    return null
  }
  return getAddress(addresses[vaultKey])
}

export const getCakeVaultAddress = () => {
  return addresses.cakeVault
}
export const getFarmAuctionAddress = () => {
  return addresses.farmAuction
}
