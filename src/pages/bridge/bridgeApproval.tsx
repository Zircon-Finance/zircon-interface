import { useCallback } from 'react'
import { MaxUint256 } from '@ethersproject/constants'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import useCatchTxError from '../../hooks/useCatchTxError'
import { useCallWithGasPrice } from '../../hooks/useCallWithGasPrice'
import { useAddPopup } from '../../state/application/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'

const useApproveContract = (contractAddress, tokenAddress) => {
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { callWithGasPrice } = useCallWithGasPrice()
  const dispatch = useDispatch()
  const { account, chainId } = useWeb3React()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(contractAddress, 'approve', [tokenAddress, MaxUint256]).then(response => {
        addTransaction(response, {
          summary:  `Enable bridging contract`
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
    }
  }
  , [account, addPopup, addTransaction, dispatch, chainId, callWithGasPrice, contractAddress, tokenAddress, fetchWithCatchTxError])

  return { handleApprove, pendingTx }
}

export default useApproveContract
