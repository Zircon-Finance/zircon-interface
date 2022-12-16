import { useCallback, useEffect, useState } from 'react'
import { useActiveWeb3React } from '../../hooks'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import {updateBlockNumber} from './actions'
import { useDispatch } from 'react-redux'
import {Block} from "@ethersproject/abstract-provider";

export default function Updater(): null {
  const { library, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null; timestamp: number | null }>({
    chainId,
    blockNumber: null,
    timestamp: null,
  })

  const blockNumberCallback = useCallback(
    (block: Block) => {
      setState(state => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber: block.number, timestamp: block.timestamp }
          return { chainId, blockNumber: Math.max(block.number, state.blockNumber), timestamp: block.timestamp }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null, timestamp: null })


    library
      .getBlock('latest')
      .then(blockNumberCallback)
      .catch(error => console.error(`Failed to get block number for chainId: ${chainId}`, error))

    library.on('block', blockNumberCallback)
    return () => {
      library.removeListener('block', blockNumberCallback)
    }
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return

    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber, timestamp: debouncedState.timestamp }))

  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
