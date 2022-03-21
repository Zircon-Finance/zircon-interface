import { Web3Provider } from '@ethersproject/providers'
import { ChainId, Currency, Pair, Token } from 'zircon-sdk'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected } from '../connectors'
import { NetworkContextName } from '../constants'
import { useDispatch, useSelector } from 'react-redux'
import { derivedPairByDataIdSelector, pairByDataIdSelector } from '../components/Chart/selector'
import { normalizeChartData, normalizePairDataByActiveToken } from '../pages/Swap/normalizers'
import { updatePairData } from '../pages/Swap/actions'
import fetchPairPriceData from '../pages/Swap/fetch/fetchPairPriceData'
import { pairHasEnoughLiquidity } from '../pages/Swap/fetch/utils'
import { getTokenAddress } from '../components/Chart/utils'
import { tryParseAmount } from '../state/swap/hooks'
import { useTradeExactIn } from './Trades'

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3ReactCore<Web3Provider>()
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(error => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

type useFetchPairPricesParams = {
  token0Address: string
  token1Address: string
  timeWindow: any
  currentSwapPrice: {
    [key: string]: number
  }
}

export const useFetchPairPrices = ({
  token0Address,
  token1Address,
  timeWindow,
  currentSwapPrice,
}: useFetchPairPricesParams) => {
  const [pairId, setPairId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const pairData = useSelector(pairByDataIdSelector({ pairId, timeWindow }))

  console.log('Pair Data: ', pairData )
  const derivedPairData = useSelector(derivedPairByDataIdSelector({ pairId, timeWindow }))
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchAndUpdatePairPrice = async () => {
      setIsLoading(true)
      const { data } = await fetchPairPriceData({ pairId, timeWindow })
      if (data) {
        // Find out if Liquidity Pool has enough liquidity
        // low liquidity pool might mean that the price is incorrect
        // in that case try to get derived price
        const hasEnoughLiquidity = pairHasEnoughLiquidity(data, timeWindow)
        const newPairData = normalizeChartData(data, timeWindow) || []
        if (newPairData.length > 0 && hasEnoughLiquidity) {
          dispatch(updatePairData({ pairData: newPairData, pairId, timeWindow }))
          setIsLoading(false)
        } else {
          console.info(`[Price Chart]: Liquidity too low for ${pairId}`)
          dispatch(updatePairData({ pairData: [], pairId, timeWindow }))
        }
      } else {
        dispatch(updatePairData({ pairData: [], pairId, timeWindow }))
      }
    }
    if (!pairData && !derivedPairData && pairId && !isLoading) {
      fetchAndUpdatePairPrice()
    }
    fetchAndUpdatePairPrice()
  }, [
    pairId,
    timeWindow,
    pairData,
    currentSwapPrice,
    token0Address,
    token1Address,
    derivedPairData,
    dispatch,
    isLoading,
  ])

  useEffect(() => {
    const updatePairId = () => {
      try {
        const token0AsTokenInstance = new Token(ChainId.MOONBASE, token0Address, 18)
        console.log('Token 0 address: ', token0Address)
        const token1AsTokenInstance = new Token(ChainId.MOONBASE, token1Address, 18)
        console.log('Token 1 address: ', token1Address)
        const pairAddress = Pair.getAddress(token0AsTokenInstance, token1AsTokenInstance).toLowerCase()
        console.log('Pair address is: ', pairAddress)
        if (pairAddress !== pairId) {
          setPairId(pairAddress)
        }
      } catch (error) {
        setPairId(null)
      }
    }

    updatePairId()
  }, [token0Address, token1Address, pairId])

  const normalizedPairData = useMemo(
    () => normalizePairDataByActiveToken({ activeToken: token0Address, pairData }),
    [token0Address, pairData],
  )

  const hasSwapPrice = currentSwapPrice && currentSwapPrice[token0Address] > 0
  
  const normalizedPairDataWithCurrentSwapPrice =
    normalizedPairData?.length > 0 && hasSwapPrice
      ? [...normalizedPairData, { time: new Date(), value: currentSwapPrice[token0Address] }]
      : normalizedPairData

  // undefined is used for loading
  let pairPrices
  if (normalizedPairDataWithCurrentSwapPrice && normalizedPairDataWithCurrentSwapPrice?.length > 0) {
    pairPrices = normalizedPairDataWithCurrentSwapPrice
  }
  console.log('THIS IS THE FINAL DATA: ', pairPrices, pairId)
  return { pairPrices, pairId }
}

export function useSingleTokenSwapInfo(
  inputCurrencyId: string | undefined,
  inputCurrency: Currency | undefined,
  outputCurrencyId: string | undefined,
  outputCurrency: Currency | undefined,
): { [key: string]: number } {
  const token0Address = getTokenAddress(inputCurrencyId)
  const token1Address = getTokenAddress(outputCurrencyId)

  const parsedAmount = tryParseAmount('1', inputCurrency ?? undefined)

  const bestTradeExactIn = useTradeExactIn(parsedAmount, outputCurrency ?? undefined)
  if (!inputCurrency || !outputCurrency || !bestTradeExactIn) {
    return null
  }

  const inputTokenPrice = parseFloat(bestTradeExactIn?.executionPrice?.toSignificant(6))
  const outputTokenPrice = 1 / inputTokenPrice

  return {
    [token0Address]: inputTokenPrice,
    [token1Address]: outputTokenPrice,
  }
}

