import { NETWORK_CHAIN_ID } from '../connectors'
import addresses from '../constants/contracts'

interface Address {
  97?: string
  56: string
}

export enum VaultKey {
  CakeVault = 'cakeVault',
  IfoPool = 'ifoPool',
}

export const getAddress = (address: Address): string => {
  const chainId = NETWORK_CHAIN_ID
  return address[chainId] ?? address[97] ?? address[56]
}

export const getMasterChefAddress = () => {
  return getAddress(addresses.masterChef)
}
export const getMulticallAddress = () => {
  return getAddress(addresses.multiCall)
}
export const getBunnyFactoryAddress = () => {
  return getAddress(addresses.bunnyFactory)
}

export const getVaultPoolAddress = (vaultKey: VaultKey) => {
  if (!vaultKey) {
    return null
  }
  return getAddress(addresses[vaultKey])
}

export const getCakeVaultAddress = () => {
  return getAddress(addresses.cakeVault)
}
export const getFarmAuctionAddress = () => {
  return getAddress(addresses.farmAuction)
}
