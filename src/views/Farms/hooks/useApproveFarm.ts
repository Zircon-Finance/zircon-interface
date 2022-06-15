import { useCallback } from 'react'
import { MaxUint256 } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
// import { useMasterchef } from '../../../hooks/useContract'
import { useCallWithGasPrice } from '../../../hooks/useCallWithGasPrice'
import { useWeb3React } from '@web3-react/core'
import { useSousChef } from '../../../hooks/useContract'
// import { VaultKey } from 'state/types'
// import { useSWRContract, UseSWRContractKey } from 'hooks/useSWRContract'
import useCatchTxError from '../../../hooks/useCatchTxError'
import { useDispatch } from 'react-redux'
import { updateUserAllowance } from '../../../state/pools'

const useApprovePool = (lpContract: Contract, sousId, earningTokenSymbol) => {
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const sousChefContract = useSousChef(sousId)

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256])
    })
    if (receipt?.status) {
      // toastSuccess(
      //   t('Contract Enabled'),
      //   <ToastDescriptionWithTx txHash={receipt.transactionHash}>
      //     {t('You can now stake in the %symbol% pool!', { symbol: earningTokenSymbol })}
      //   </ToastDescriptionWithTx>,
      // )
      dispatch(updateUserAllowance({ sousId, account }))
    }
  }, [
    account,
    dispatch,
    lpContract,
    sousChefContract,
    sousId,
    callWithGasPrice,
    fetchWithCatchTxError,
  ])

  return { handleApprove, pendingTx }
}

export default useApprovePool

// Approve CAKE auto pool
// export const useVaultApprove = (vaultKey: VaultKey, setLastUpdated: () => void) => {
//   const { t } = useTranslation()
//   const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
//   const vaultPoolContract = useVaultPoolContract(vaultKey)
//   const { callWithGasPrice } = useCallWithGasPrice()
//   const { signer: cakeContract } = useCake()

//   const handleApprove = async () => {
//     const receipt = await fetchWithCatchTxError(() => {
//       return callWithGasPrice(cakeContract, 'approve', [vaultPoolContract.address, MaxUint256])
//     })
//     if (receipt?.status) {
//       // toastSuccess(
//       //   t('Contract Enabled'),
//       //   <ToastDescriptionWithTx txHash={receipt.transactionHash}>
//       //     {t('You can now stake in the %symbol% vault!', { symbol: 'CAKE' })}
//       //   </ToastDescriptionWithTx>,
//       // )
//       setLastUpdated()
//     }
//   }

//   return { handleApprove, pendingTx }
// }

// export const useCheckVaultApprovalStatus = (vaultKey: VaultKey) => {
//   const { account } = useWeb3React()
//   const { reader: cakeContract } = useCake()
//   const vaultPoolContract = useVaultPoolContract(vaultKey)

//   const key = useMemo<UseSWRContractKey>(
//     () =>
//       account
//         ? {
//             contract: cakeContract,
//             methodName: 'allowance',
//             params: [account, vaultPoolContract.address],
//           }
//         : null,
//     [account, cakeContract, vaultPoolContract.address],
//   )

//   const { data, mutate } = useSWRContract(key)

//   return { isVaultApproved: data ? data.gt(0) : false, setLastUpdated: mutate }
// }


// const useApproveFarm = (lpContract: Contract) => {
//   const masterChefContract = useMasterchef()
//   const { callWithGasPrice } = useCallWithGasPrice()
//   const handleApprove = useCallback(async () => {
//     return callWithGasPrice(lpContract, 'approve', [masterChefContract.address, MaxUint256])
//   }, [lpContract, masterChefContract, callWithGasPrice])

//   return { onApprove: handleApprove }
// }

// export default useApproveFarm
