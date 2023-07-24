import { Contract } from '@ethersproject/contracts'
import { ChainId, WDEV } from 'diffuse-sdk'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { abi as DiffusePylonABI } from '../constants/abi/DiffusePylon.json'
import { abi as DiffusePylonFactory } from '../constants/abi/DiffusePylonFactory.json'
import { abi as DiffuseFactory } from '../constants/abi/DiffuseFactory.json'
import { abi as DiffuseEnergyFactory } from '../constants/abi/DiffuseEnergyFactory.json'
import BatchPrecompileABI from '../constants/abi/batch_precompile.json'
import { useMemo } from 'react'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import WDEV_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { getContract, getProviderOrSigner } from '../utils'
import { useActiveWeb3React } from './index'
import { getBep20Contract, getMasterchefContract, getSouschefContract } from '../utils/contractHelpers'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export const useERC20 = (address: string, withSignerIfPossible = true) => {
  const { library, account, chainId } = useActiveWeb3React()
  return useMemo(
    () => getBep20Contract(chainId, address, withSignerIfPossible ? getProviderOrSigner(library, account) : null),
    [account, address, library, withSignerIfPossible],
  )
}

export const useMasterchef = () => {
  const { library, chainId } = useActiveWeb3React()
  return useMemo(() => getMasterchefContract(chainId, library.getSigner()), [library])
}

export const useSousChef = (contractAddress: string) => {
  const { library, chainId } = useActiveWeb3React()
  return useMemo(() => getSouschefContract(chainId, contractAddress, library.getSigner()), [contractAddress, library])
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWDEVContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WDEV[chainId].address : undefined, WDEV_ABI, withSignerIfPossible)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
      case ChainId.STANDALONE:
        break
      case ChainId.MOONRIVER:
        break
      case ChainId.BSC:
        break
      case ChainId.BSCT:
        break
      case ChainId.ARBGOERLY:
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function usePylonContract(pylonAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pylonAddress, DiffusePylonABI, withSignerIfPossible)
}

export function usePylonFactoryContract(pylonFactoryAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pylonFactoryAddress, DiffusePylonFactory, withSignerIfPossible)
}

export function usePairFactoryContract(factoryAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(factoryAddress, DiffuseFactory, withSignerIfPossible)
}

export function useEnergyFactoryContract(energyFactoryAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(energyFactoryAddress, DiffuseEnergyFactory, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useBatchPrecompileContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && '0x0000000000000000000000000000000000000808', BatchPrecompileABI, true)
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
      chainId === ChainId.MAINNET ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
      UNISOCKS_ABI,
      false
  )
}
