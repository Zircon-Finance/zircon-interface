import {Currency, CurrencyAmount, DEV, Pair, JSBI, Percent, Price, Pylon, TokenAmount} from 'zircon-sdk'
import {useCallback, useMemo, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTotalSupply } from '../../data/TotalSupply'
import { useTranslation } from 'react-i18next'

import { useActiveWeb3React } from '../../hooks'
import { wrappedCurrency, wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import {useCurrencyBalances, useTokenBalance} from '../wallet/hooks'
import { Field, typeInput } from './actions'
import { usePylon, PylonState } from '../../data/PylonReserves'
import {useEnergyAddress, useLastK, usePylonConstants, usePylonInfo,} from "../../data/PylonData";
import {useBlockNumber} from "../application/hooks";
import { useSingleCallResult } from '../multicall/hooks'
import { usePylonContract, usePylonFactoryContract } from '../../hooks/useContract'

const ZERO = JSBI.BigInt(0)

export function useMintState(): AppState['mint'] {
  return useSelector<AppState, AppState['mint']>(state => state.mint)
}


export function useDerivedPylonMintInfo(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    isFloat: boolean,
    sync: string
): {
  dependentField: Field
  currencies: { [field in Field]?: Currency }
  pylonPair?: Pylon | null
  pylonState: PylonState
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  price?: Price
  noPylon?: boolean
  liquidityMinted?: TokenAmount
  poolTokenPercentage?: Percent
  error?: string
} {
  const { account, chainId } = useActiveWeb3React()

  const { t } = useTranslation()

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // tokens
  const currencies: { [field in Field]?: Currency } = useMemo(
      () => ({
        [Field.CURRENCY_A]: currencyA ?? undefined,
        [Field.CURRENCY_B]: currencyB ?? undefined
      }),
      [currencyA, currencyB]
  )

  // Pylon
  const [pylonState, pylonPair] = usePylon(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B])
  const pylonInfo = usePylonInfo(pylonPair?.address)
  const pylonConstants = usePylonConstants()
  const blockNumber = useBlockNumber()
  const userLiquidity = useTokenBalance(account ?? undefined, isFloat ? pylonPair?.floatLiquidityToken : pylonPair?.anchorLiquidityToken)
  const pylonPoolBalance = useTokenBalance(pylonPair?.address, pylonPair?.pair.liquidityToken)
  const ptTotalSupply = useTotalSupply(isFloat ? pylonPair?.floatLiquidityToken : pylonPair?.anchorLiquidityToken)
  const totalSupply = useTotalSupply(pylonPair?.pair.liquidityToken)
  const lastK = useLastK(pylonPair ? Pair.getAddress(pylonPair.token0, pylonPair.token1) : "");
  const pylonSupply = useTotalSupply(pylonPair?.pair.liquidityToken)

  const noPylon: boolean =
      pylonState === PylonState.NOT_EXISTS || Boolean(pylonSupply && JSBI.equal(pylonSupply.raw, ZERO))

  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B]
  ])
  const currencyBalances: { [field in Field]?: CurrencyAmount } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1]
  }

  // amounts
  const independentAmount: CurrencyAmount | undefined = tryParseAmount(typedValue, currencies[independentField])
  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (noPylon) {
      if (otherTypedValue && currencies[dependentField]) {
        return tryParseAmount(otherTypedValue, currencies[dependentField])
      }
      return undefined
    } else if (independentAmount) {
      // we wrap the currencies just to get the price in terms of the other token
      const wrappedIndependentAmount = wrappedCurrencyAmount(independentAmount, chainId)
      const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
      if (tokenA && tokenB && wrappedIndependentAmount && pylonPair) {
        const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA
        const dependentTokenAmount =
            dependentField === Field.CURRENCY_B
                ? pylonPair.pair.priceOf(tokenA).quote(wrappedIndependentAmount)
                : pylonPair.pair.priceOf(tokenB).quote(wrappedIndependentAmount)
        return dependentCurrency === DEV ? CurrencyAmount.ether(dependentTokenAmount.raw) : dependentTokenAmount
      }
      return undefined
    } else {
      return undefined
    }
  }, [noPylon, otherTypedValue, currencies, dependentField, independentAmount, currencyA, chainId, currencyB, pylonPair])
  const parsedAmounts: { [field in Field]: CurrencyAmount | undefined } = {
    [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
    [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount
  }

  const price = useMemo(() => {
    if (noPylon) {
      const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
      if (currencyAAmount && currencyBAmount) {
        return new Price(currencyAAmount.currency, currencyBAmount.currency, currencyAAmount.raw, currencyBAmount.raw)
      }
      return undefined
    } else {
      const wrappedCurrencyA = wrappedCurrency(currencyA, chainId)
      return pylonPair && wrappedCurrencyA ? pylonPair.pair.priceOf(wrappedCurrencyA) : undefined
    }
  }, [chainId, currencyA, noPylon, pylonPair, parsedAmounts])

  // liquidity minted
  const liquidityMinted = useMemo(() => {
    const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
    const [tokenAmountA, tokenAmountB] = [
      wrappedCurrencyAmount(currencyAAmount, chainId),
      wrappedCurrencyAmount(currencyBAmount, chainId)
    ]

    if (pylonPair && pylonSupply && tokenAmountA && tokenAmountB && totalSupply && ptTotalSupply && userLiquidity && pylonPoolBalance && pylonInfo.length > 8 && pylonConstants) {
      if (sync === "off") {
        if (isFloat) {
          return pylonPair.getFloatSyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountA,
              pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
              pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], BigInt(lastK)).liquidity
        }else{
          return pylonPair.getAnchorSyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountB,
              pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
              pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], BigInt(lastK)).liquidity
        }
      }else {
        if (isFloat) {
          return pylonPair.getFloatAsyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountA, tokenAmountB,
              pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
              pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], BigInt(lastK)).liquidity
        }else{
          return pylonPair.getAnchorAsyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountA, tokenAmountB,
              pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
              pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], BigInt(lastK)).liquidity
        }
      }
    } else {
      return undefined
    }
  }, [parsedAmounts, chainId, pylonPair, pylonSupply, totalSupply, ptTotalSupply,lastK, pylonPoolBalance, isFloat, sync, userLiquidity, pylonInfo, pylonConstants])

  // const poolTokenPercentage = useMemo(() => {
  //   if (liquidityMinted && pylonSupply) {
  //     return new Percent(liquidityMinted.raw, pylonSupply.add(liquidityMinted).raw)
  //   } else {
  //     return undefined
  //   }
  // }, [liquidityMinted, pylonSupply])

  let error: string | undefined

  if (!account) {
    error = t('connectWallet')
  }

  if (pylonState === PylonState.INVALID) {
    error = error ?? t('invalidPair')
  }

  if (!parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? t('enterAnAmount')
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts

  if ((sync === "half" || isFloat || pylonState !== PylonState.EXISTS) && currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
    error = 'Insufficient ' + currencies[Field.CURRENCY_A]?.symbol + ' balance'
  }

  if ((sync === "half" || !isFloat || pylonState !== PylonState.EXISTS) && currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
    error = 'Insufficient ' + currencies[Field.CURRENCY_B]?.symbol + ' balance'
  }

  return {
    dependentField,
    currencies,
    pylonPair,
    pylonState,
    currencyBalances,
    parsedAmounts,
    price,
    noPylon,
    liquidityMinted,
    //poolTokenPercentage,
    error
  }
}

export function useMintActionHandlers(
    noPylon: boolean | undefined
): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onFieldAInput = useCallback(
      (typedValue: string) => {
        dispatch(typeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noPylon === true }))
      },
      [dispatch, noPylon]
  )
  const onFieldBInput = useCallback(
      (typedValue: string) => {
        dispatch(typeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noPylon === true }))
      },
      [dispatch, noPylon]
  )

  return {
    onFieldAInput,
    onFieldBInput
  }
}

export const useHealthFactor = (pylonPair : Pylon) => {
  const [healthFactor, setHealthFactor] = useState('')
  const pylonInfo = usePylonInfo(pylonPair?.address)
  const energyAddress = useEnergyAddress(pylonPair?.token0.address, pylonPair?.token1.address)
  const ptbEnergy = useTokenBalance(energyAddress, pylonPair?.pair.liquidityToken)
  const reserveAnchor = useTokenBalance(energyAddress, pylonPair?.anchorLiquidityToken)
  const ptb = useTokenBalance(pylonPair?.address, pylonPair?.pair.liquidityToken)
  const ptt = useTotalSupply(pylonPair?.anchorLiquidityToken)
  const pylonContract = usePylonContract(pylonPair?.address, false)
  const lastK = useLastK(pylonPair?.address)
  const pylonFactory = usePylonFactoryContract()

  const healthFactorResult = useSingleCallResult(pylonContract, "gethealth", [
      pylonInfo[0],
      ptb,
      ptt,
      reserveAnchor,
      ptbEnergy,
      pylonInfo[9],
      pylonInfo[1],
      pylonInfo[7],
      pylonInfo[8],
      lastK,
      pylonFactory
  ])?.result?.[0]
  setHealthFactor(healthFactorResult?.toString())
  
  return healthFactor?.toString()
}
