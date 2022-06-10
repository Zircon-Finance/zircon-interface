import { useEffect, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { batch, useDispatch, useSelector } from 'react-redux'
import { useFastRefreshEffect, useSlowRefreshEffect } from '../../hooks/useRefreshEffect'
import { farms } from '../../constants/farms'
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

// export const usePoolsWithVault = () => {
//   return useSelector(poolsWithVaultSelector)
// }

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
