import {TokenAmount, Pair, Currency, Pylon} from 'zircon-sdk'
import { useMemo } from 'react'
import { abi as ZirconPylonABI } from '../constants/abi/ZirconPylon.json'
import { Interface } from '@ethersproject/abi'
import { useActiveWeb3React } from '../hooks'
import { abi as ZirconPairABI } from '../constants/abi/ZirconPair.json'
import {useMultipleContractSingleData} from '../state/multicall/hooks'
import { wrappedCurrency } from '../utils/wrappedCurrency'
// import {useLiquidityFee} from "./PylonData";
const PAIR_INTERFACE = new Interface(ZirconPairABI)
const PYLON_INTERFACE = new Interface(ZirconPylonABI)

export enum PylonState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
  ONLY_PAIR
}

export function usePylons(currencies: [Currency | undefined, Currency | undefined][] ): [PylonState, Pylon | null][] {
  const { chainId } = useActiveWeb3React()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId)
      ]),
    [chainId, currencies]

  )

  const pylonAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pylon.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens]
  )
  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens]
  )

  const results = useMultipleContractSingleData(pylonAddresses, PYLON_INTERFACE, 'getSyncReserves')
  const resultsPair = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')
  // const liquidityFee = useLiquidityFee()

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      // console.log(resultsPair[i])
      const resPair = resultsPair[i]
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading || resPair.loading) return [PylonState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PylonState.INVALID, null]
      if (!reserves || !resPair.result){
        if(resPair.result) {
          // console.log(resPair.result)
          const reserve0 = resPair.result[0]
          const reserve1 = resPair.result[1]
          // const { _reserve0, reserve1 } = resPair.result;
          // console.log(reserve0, reserve1)
          const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
          return [
            PylonState.ONLY_PAIR,
            new Pylon(new Pair(
                new TokenAmount(token0, reserve0.toString()),
                new TokenAmount(token1, reserve1.toString())),new TokenAmount(tokenA, "0"), new TokenAmount(tokenB, "0"))
          ]
        }else{
          return [PylonState.NOT_EXISTS, null]
        }
      }
      const { _reserve0, _reserve1 } = reserves
      const reserve0 = resPair.result[0]
      const reserve1 = resPair.result[1]
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PylonState.EXISTS,
        new Pylon(new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),new TokenAmount(tokenA, _reserve0.toString()), new TokenAmount(tokenB, _reserve1.toString()))
      ]
    })
  }, [results, tokens, resultsPair])
}

export function usePylon(tokenA?: Currency, tokenB?: Currency): [PylonState, Pylon | null] {
  return usePylons([[tokenA, tokenB]])[0]
}
