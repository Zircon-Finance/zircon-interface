import {Currency, CurrencyAmount, DEV, JSBI, Percent, Price, Pylon, TokenAmount} from 'zircon-sdk'
import { useCallback, useMemo } from 'react'
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
import {
  useGamma,
  useLastK,
  useLastPoolTokens,
  useVirtualAnchorBalance,
  useVirtualFloatBalance
} from "../../data/PylonData";

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

  const userLiquidity = useTokenBalance(account ?? undefined, isFloat ? pylonPair?.floatLiquidityToken : pylonPair?.anchorLiquidityToken)
  const pylonPoolBalance = useTokenBalance(pylonPair?.address, pylonPair?.pair.liquidityToken)
  const ptTotalSupply = useTotalSupply(isFloat ? pylonPair?.floatLiquidityToken : pylonPair?.anchorLiquidityToken)
  const totalSupply = useTotalSupply(pylonPair?.pair.liquidityToken)

  const vab = useVirtualAnchorBalance(pylonPair?.address)
  const vfb = useVirtualFloatBalance(pylonPair?.address)
  const lastK = useLastK(pylonPair?.address)
  const gamma = useGamma(pylonPair?.address)
  const lpt = useLastPoolTokens(pylonPair?.address)
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
    if (pylonPair && pylonSupply && tokenAmountA && tokenAmountB && totalSupply && ptTotalSupply && userLiquidity && pylonPoolBalance) {
      if (sync === "off") {
        if (isFloat) {
          return pylonPair.getFloatSyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountA, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))
        }else{
          return pylonPair.getAnchorSyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountB, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))
        }
      }else if (sync === "full") {
        if (isFloat) {
          return pylonPair.getFloatAsync100LiquidityMinted(totalSupply, ptTotalSupply, tokenAmountA, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))
        }else{
          return pylonPair.getAnchorAsync100LiquidityMinted(totalSupply, ptTotalSupply, tokenAmountB, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))
        }
      }else {
        if (isFloat) {
          return pylonPair.getFloatAsyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountA, tokenAmountB, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))
        }else{
          return pylonPair.getAnchorAsyncLiquidityMinted(totalSupply, ptTotalSupply, tokenAmountA, tokenAmountB, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))
        }
      }
    } else {
      return undefined
    }
  }, [parsedAmounts, chainId, pylonPair, pylonSupply, totalSupply, ptTotalSupply, vab, vfb, gamma, lastK, pylonPoolBalance, lpt, isFloat, sync, userLiquidity])

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
