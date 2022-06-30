import { useEffect, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { batch, useDispatch, useSelector } from 'react-redux'
import { useFastRefreshEffect, useSlowRefreshEffect } from '../../hooks/useRefreshEffect'
import { farms } from '../../constants/farms'
import {providers} from "ethers";
import {
  fetchPoolsPublicDataAsync,
  fetchPoolsUserDataAsync,
  // fetchCakeVaultPublicData,
  // fetchCakeVaultUserData,
  // fetchCakeVaultFees,
  fetchPoolsStakingLimitsAsync,
} from '.'
import { DeserializedPool, 
  // VaultKey 
} from '../types'
import { fetchFarmsPublicDataAsync } from '../farms'
import {
  poolsWithUserDataLoadingSelector,
  makePoolWithUserDataLoadingSelector,
  // makeVaultPoolByKey,
  // poolsWithVaultSelector,
} from './selectors'
import { usePylon } from '../../data/PylonReserves'
import { useCurrency } from '../../hooks/Tokens'
import { useTokenBalance } from '../wallet/hooks'
import { usePair } from '../../data/Reserves'
import { useSousChef } from '../../hooks/useContract'

export const useFetchPublicPoolsData = () => {
  const dispatch = useDispatch()

  useSlowRefreshEffect(
    (currentBlock) => {
      const fetchPoolsDataWithFarms = async () => {
        const activeFarms = farms.filter((farm) => farm.pid !== 0)
        await dispatch(fetchFarmsPublicDataAsync(activeFarms.map((farm) => farm.pid)))
        batch(() => {
          dispatch(fetchPoolsPublicDataAsync(currentBlock))
          dispatch(fetchPoolsStakingLimitsAsync())
        })
      }

      fetchPoolsDataWithFarms()
    },
    [dispatch],
  )
}

export const useFetchUserPools = (account) => {
  const dispatch = useDispatch()

  useFastRefreshEffect(() => {
    if (account) {
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }, [account, dispatch])
}

export const usePools = (): { pools: DeserializedPool[]; userDataLoaded: boolean } => {
  return useSelector(poolsWithUserDataLoadingSelector)
}

export const usePool = (sousId: number): { pool: DeserializedPool; userDataLoaded: boolean } => {
  const poolWithUserDataLoadingSelector = useMemo(() => makePoolWithUserDataLoadingSelector(sousId), [sousId])
  return useSelector(poolWithUserDataLoadingSelector)
}

export const usePairLiquidity = (token1, token2) => {
  const [tokenA, tokenB] = [useCurrency(token1.address), useCurrency(token2.address)]
  const [, pair] = usePair(tokenA, tokenB)
  const [, pylon] = usePylon(tokenA, tokenB)

  const anchorPoolBalancePylon = useTokenBalance(pylon?.address,pylon?.token0)
  const floatPoolBalancePylon = useTokenBalance(pylon?.address,pylon?.token1)

  const anchorPoolBalancePair = useTokenBalance(pair?.liquidityToken.address,pylon?.token0)
  const floatPoolBalancePair = useTokenBalance(pair?.liquidityToken.address,pylon?.token1)
  
  const anchorPoolBalance = anchorPoolBalancePylon?.add(anchorPoolBalancePair)
  const floatPoolBalance = floatPoolBalancePylon?.add(floatPoolBalancePair)
  return `${anchorPoolBalance?.toFixed(3) as unknown as number} ${tokenA?.symbol} - 
  ${floatPoolBalance?.toFixed(3) as unknown as number} ${tokenB?.symbol}`
}

// export const usePoolsWithVault = () => {
//   return useSelector(poolsWithVaultSelector)
// }

export const useStartBlock = async(sousId) => {
  const {account} = useWeb3React()
  const sousChefContract = useSousChef(sousId)
  const startBlock = account ? await sousChefContract.startBlock().then((value) => value.toNumber()) : 0
  return startBlock
}

export const useEndBlock = async(sousId) => {
  const {account} = useWeb3React()
  const sousChefContract = useSousChef(sousId)
  const endBlock = account ? await sousChefContract.bonusEndBlock().then((value) => value.toNumber()) : 0
  return endBlock
}

export const useCurrentBlock = async() => {
  const {account} = useWeb3React()
  const provider = window.ethereum ? new providers.Web3Provider(window.ethereum) : null
  const blockNumber = account ? await provider.getBlockNumber() : 0
  return blockNumber
}


export const usePoolsPageFetch = () => {
  const { account } = useWeb3React()
  const dispatch = useDispatch()
  useFetchPublicPoolsData()

  useFastRefreshEffect(() => {
    batch(() => {
      // dispatch(fetchCakeVaultPublicData())
      if (account) {
        dispatch(fetchPoolsUserDataAsync(account))
        // dispatch(fetchCakeVaultUserData({ account }))
      }
    })
  }, [account, dispatch])

  useEffect(() => {
    batch(() => {
      // dispatch(fetchCakeVaultFees())
    })
  }, [dispatch])
}

// export const useCakeVault = () => {
//   return useVaultPoolByKey(VaultKey.CakeVault)
// }

// export const useVaultPools = () => {
//   const cakeVault = useVaultPoolByKey(VaultKey.CakeVault)
//   const vaults = useMemo(() => {
//     return {
//       [VaultKey.CakeVault]: cakeVault,
//     }
//   }, [cakeVault])
//   return vaults
// }

// export const useVaultPoolByKey = (key: VaultKey) => {
//   const vaultPoolByKey = useMemo(() => makeVaultPoolByKey(key), [key])

//   return useSelector(vaultPoolByKey)
// }
