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
import { fetchPoolsUserDataAsync } from '../../../state/pools'
import { useAddPopup } from '../../../state/application/hooks'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { usePools } from '../../../state/pools/hooks'

const useApprovePool = (pool, lpContract: Contract, contractAddress) => {
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const dispatch = useDispatch()
  const {pools} = usePools()
  const { account, chainId } = useWeb3React()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const sousChefContract = useSousChef(pool.contractAddress)

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256]).then(response => {
        addTransaction(response, {
          summary:  `Enable ${pool.token1.symbol}-${pool.token2.symbol} stake contract`
        })
        return response
      })
    })

    if (receipt?.status) {
      addPopup(
        {
          txn: {
            hash: receipt.transactionHash,
            success: true,
            summary: 'Contract enabled!',
          }
        },
        receipt.transactionHash
      )
      dispatch(fetchPoolsUserDataAsync({chainId, account, pools}))
    }
  }
  , [account, addPopup, addTransaction, dispatch, lpContract, pool, sousChefContract, fetchWithCatchTxError, callWithGasPrice])

  return { handleApprove, pendingTx }
}

export default useApprovePool
