import {Currency, CurrencyAmount, JSBI, NATIVE_TOKEN, Pair, Percent, Price, Pylon} from 'zircon-sdk'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTotalSupply} from '../../data/TotalSupply'
import {useTranslation} from 'react-i18next'

import {useActiveWeb3React} from '../../hooks'
import {wrappedCurrency, wrappedCurrencyAmount} from '../../utils/wrappedCurrency'
import {AppDispatch, AppState} from '../index'
import {tryParseAmount} from '../swap/hooks'
import {useCurrencyBalances, useTokenBalance} from '../wallet/hooks'
import {Field, typeInput} from './actions'
import {PylonState, usePylon} from '../../data/PylonReserves'
import {useLastK, usePairInfo, usePylonConstants, usePylonInfo,} from "../../data/PylonData";
import {useBlockNumber, useBlockTimestamp} from "../application/hooks";
import {usePylonFactoryContract} from '../../hooks/useContract'
import axios from 'axios'
import {PRICE_API} from '../../constants/lists'
import {PairState} from '../../data/Reserves'
import {Decimals, MintSyncParams} from "zircon-sdk/dist/interfaces/pylonInterface";
import { ethers } from 'ethers'

const ZERO = JSBI.BigInt(0)

export function useMintState(): AppState['mint'] {
  return useSelector<AppState, AppState['mint']>(state => state.mint)
}

interface MintInfo extends MintSyncParams {
  extraFeeTreshold: JSBI;
  shouldBlock: boolean;
}

export interface HealthFactorParams {
  healthFactor: String,
  omega: JSBI,
  maxOfVab: JSBI,
  maxNoOmega: JSBI
}

export function useDerivedPylonMintInfo(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    isFloat: boolean,
    sync: string,
    decimals: Decimals
): {
  dependentField: Field
  currencies: { [field in Field]?: Currency }
  pylonPair?: Pylon | null
  pylonState: PylonState
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  price?: Price
  noPylon?: boolean
  mintInfo?: MintInfo
  gamma?: string | undefined
  poolTokenPercentage?: Percent
  error?: string,
  healthFactor?: HealthFactorParams,
  delta?: string,
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
  const timestamp = useBlockTimestamp()
  const pairInfo = usePairInfo(pylonPair ? Pair.getAddress(pylonPair.token0, pylonPair.token1) : "")
  const userLiquidity = useTokenBalance(account ?? undefined, isFloat ? pylonPair?.floatLiquidityToken : pylonPair?.anchorLiquidityToken)
  const pylonPoolBalance = useTokenBalance(pylonPair?.address, pylonPair?.pair.liquidityToken)
  const ptTotalSupply = useTotalSupply(isFloat ? pylonPair?.floatLiquidityToken : pylonPair?.anchorLiquidityToken)
  const totalSupply = useTotalSupply(pylonPair?.pair.liquidityToken)
  // const lastK = useLastK(pylonPair ? Pair.getAddress(pylonPair.token0, pylonPair.token1) : "");
  const pylonSupply = useTotalSupply(pylonPair?.pair.liquidityToken)
  const energyAddress = Pylon.getEnergyAddress(pylonPair?.token0, pylonPair?.token1) //useEnergyAddress(pylonPair?.token0, pylonPair?.token1)
  const ptbEnergy = useTokenBalance(energyAddress, pylonPair?.pair.liquidityToken)
  const reserveAnchor = useTokenBalance(energyAddress, pylonPair?.anchorLiquidityToken)
  const healthFactor = useMemo(() => {
    try {
      return pylonInfo && pylonState === PylonState.EXISTS && pylonPair && ptbEnergy && reserveAnchor && pylonPoolBalance && totalSupply && pylonConstants && pylonState === PylonState.EXISTS?
          pylonPair.getHealthFactor(
              pylonInfo,
              pairInfo,
              decimals,
              totalSupply,
              pylonPoolBalance,
              BigInt(blockNumber),
              pylonConstants,
              BigInt(timestamp),
              ptbEnergy.raw,
              reserveAnchor.raw,
              true
          ) : undefined
    }catch (e) {
      console.error("INTERFACE:: error health factor", e)
      return undefined
    }

  }, [pylonInfo, pairInfo, pylonPair, ptbEnergy, reserveAnchor, pylonPoolBalance, totalSupply, pylonConstants,pylonState])

  const delta = useMemo(() => {
    try {
      return pylonInfo && pylonState === PylonState.EXISTS && pylonPair && ptbEnergy && reserveAnchor && pylonPoolBalance && totalSupply && pylonConstants && pylonState === PylonState.EXISTS?
          pylonPair.getDelta(
              pylonInfo,
              pairInfo,
              decimals,
              totalSupply,
              pylonPoolBalance,
              BigInt(blockNumber),
              pylonConstants,
              BigInt(timestamp),
              true,
          ).toString() : undefined
    }catch (e) {
      console.error("INTERFACE:: error delta", e)
      return undefined
    }

  }, [pylonInfo, pairInfo, pylonPair, ptbEnergy, reserveAnchor, pylonPoolBalance, totalSupply, pylonConstants,pylonState])

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
  const independentAmount: CurrencyAmount | undefined = tryParseAmount(chainId, typedValue, currencies[independentField])
  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (noPylon) {
      if (otherTypedValue && currencies[dependentField]) {
        return tryParseAmount(chainId, otherTypedValue, currencies[dependentField])
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
                ? pylonPair.pair.priceOf(tokenA).quote(wrappedIndependentAmount, chainId)
                : pylonPair.pair.priceOf(tokenB).quote(wrappedIndependentAmount, chainId)
        return dependentCurrency === NATIVE_TOKEN[chainId] ? CurrencyAmount.ether(dependentTokenAmount.raw, chainId) : dependentTokenAmount
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
  const mintInfo = useMemo(() => {
    const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
    const [tokenAmountA, tokenAmountB] = [
      wrappedCurrencyAmount(currencyAAmount, chainId),
      wrappedCurrencyAmount(currencyBAmount, chainId)
    ]
    try{
      if (pylonState === PylonState.EXISTS && pylonPair && pylonSupply && tokenAmountA && tokenAmountB
          && totalSupply && ptTotalSupply && userLiquidity && pylonPoolBalance && pylonInfo && pairInfo && pylonConstants) {
        if (sync === "off") {
          let syncMintInfo;
          let extraFeeTreshold = ZERO;
          let shouldBlock = false;
          syncMintInfo = pylonPair.mintSync(
              pylonInfo,
              pairInfo,
              decimals,
              totalSupply,
              ptTotalSupply,
              isFloat ? tokenAmountA : tokenAmountB,
              pylonPoolBalance,
              BigInt(blockNumber),
              pylonConstants,
              BigInt(timestamp),
              !isFloat,
              true
          )
          if (JSBI.greaterThan(syncMintInfo?.amountsToInvest?.sync, ZERO) && JSBI.greaterThan(syncMintInfo?.amountsToInvest?.async, ZERO)) {
            extraFeeTreshold = JSBI.divide(syncMintInfo?.amountsToInvest?.async, JSBI.BigInt(isFloat ? decimals.float.toString() : decimals.anchor.toString()))
          }
          return {...syncMintInfo, extraFeeTreshold: extraFeeTreshold, shouldBlock}
        }else {
          let asyncMintInfo;

          if (isFloat) {
            asyncMintInfo = pylonPair.mintAsync(
                pylonInfo,
                pairInfo,
                decimals,
                totalSupply, ptTotalSupply, tokenAmountA, tokenAmountB,
                pylonPoolBalance,
                BigInt(blockNumber), pylonConstants,
                BigInt(timestamp),
                !isFloat,
                true
            )
          }else{
            asyncMintInfo = pylonPair.mintAsync(
                pylonInfo,
                pairInfo,
                decimals,
                totalSupply, ptTotalSupply, tokenAmountA, tokenAmountB,
                pylonPoolBalance,
                BigInt(blockNumber), pylonConstants,
                BigInt(timestamp),
                !isFloat,
                true
            )
          }
          return {...asyncMintInfo, extraFeeTreshold: ZERO, slippage: ZERO, shouldBlock: false}
        }
      } else {
        // console.error("INTERFACE:: error missing data")
        // console.log("INTERFACE:: pylonInfo", pylonInfo)
        // console.log("INTERFACE:: pylonPoolBalance", pylonPoolBalance)
        // console.log("INTERFACE:: blockNumber", blockNumber)
        // console.log("INTERFACE:: blockNumber", blockNumber)
        // console.log("INTERFACE:: tkA tkB", tokenAmountA, tokenAmountB)
        return undefined
      }
    }catch (e) {
      console.error("INTERFACE:: Crash in the SDK", e)
      console.log("INTERFACE:: isFloat", isFloat)
      console.log("INTERFACE:: pairRes, pylonRes", pylonPair?.pair.reserve0.raw.toString(), pylonPair?.pair.reserve1.raw.toString(), pylonPair?.reserve0.raw.toString(), pylonPair?.reserve1.raw.toString() )
      console.log("INTERFACE:: totalSupply, ptTotalSupply, tokenAmountA, tokenAmountA", totalSupply?.raw.toString(), ptTotalSupply?.raw.toString(), tokenAmountA?.raw.toString(), tokenAmountB?.raw.toString())
      console.log("INTERFACE:: ptb, lastk, blockNumber", pylonPoolBalance?.raw.toString(),  BigInt(blockNumber))
      console.log("INTERFACE:: pylonConstants", pylonConstants)
      console.log("INTERFACE:: timestamp", timestamp)
      console.log("INTERFACE:: pylonInfo", pylonInfo)

      return undefined
    }

  }, [parsedAmounts, chainId, pylonPair, pylonSupply, totalSupply, ptTotalSupply, pylonPoolBalance, isFloat, sync, userLiquidity, pylonInfo, pylonConstants])

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

  // if (!mintInfo || mintInfo?.isDerivedVFB) {
  //   error = !mintInfo ? 'Enter an amount' : 'Try a higher input amount'
  // }

  return {
    dependentField,
    currencies,
    pylonPair,
    pylonState,
    currencyBalances,
    parsedAmounts,
    price,
    noPylon,
    mintInfo,
    gamma: pylonInfo ? pylonInfo.gammaMulDecimals ? pylonInfo.gammaMulDecimals.toString() : undefined : undefined,
    //poolTokenPercentage,
    error,
    healthFactor,
    delta
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

export const useHealthFactorDelta = (  currencyA: Currency | undefined,
                                  currencyB: Currency | undefined,
                                  isFloat: boolean) => {
  const currencies: { [field in Field]?: Currency } = useMemo(
      () => ({
        [Field.CURRENCY_A]: currencyA ?? undefined,
        [Field.CURRENCY_B]: currencyB ?? undefined
      }),
      [currencyA, currencyB]
  )

  const [,pylonPair] = usePylon(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B])
  const pylonInfo = usePylonInfo(pylonPair?.address)
  const energyAddress = Pylon.getEnergyAddress(pylonPair?.token0, pylonPair?.token1) //useEnergyAddress(pylonPair?.token0, pylonPair?.token1)
  const ptbEnergy = useTokenBalance(energyAddress, pylonPair?.pair.liquidityToken)
  const reserveAnchor = useTokenBalance(energyAddress, pylonPair?.anchorLiquidityToken)
  const ptb = useTokenBalance(pylonPair?.address, pylonPair?.pair.liquidityToken)
  const ptt = useTotalSupply(pylonPair?.anchorLiquidityToken)
  const lastK = useLastK(pylonPair?.address)
  const pylonFactory = usePylonFactoryContract()
  const timestamp = useBlockTimestamp()
  const blockNumber = useBlockNumber()
  const pairInfo = usePairInfo(pylonPair ? Pair.getAddress(pylonPair.token0, pylonPair.token1) : "")
  const decimals = {
    float: ethers.BigNumber.from(10).pow(currencyA?.decimals || 18).toString(),
    anchor: ethers.BigNumber.from(10).pow(currencyB?.decimals || 18).toString(),
  }

  const healthFactorResult = useMemo(() => {
    return pylonInfo && pylonPair && ptbEnergy && reserveAnchor && ptb && ptt && lastK && pylonFactory ?
        pylonPair.getHealthFactor(
            pylonInfo,
            pairInfo,
            decimals,
            ptt,
            ptb,
            BigInt(blockNumber),
            pylonFactory,
            BigInt(timestamp),
            ptbEnergy.raw,
            reserveAnchor.raw
        ) : 'Loading...'
  }, [pylonInfo, pylonPair, ptbEnergy, reserveAnchor, ptb, ptt, lastK, pylonFactory])

  const deltaResult = useMemo(() => {
    return pylonInfo && pylonPair && ptbEnergy && reserveAnchor && ptb && ptt && lastK && pylonFactory ?
        pylonPair.getDelta(
            pylonInfo,
            pairInfo,
            decimals,
            ptt,
            ptb,
            BigInt(blockNumber),
            pylonFactory,
            BigInt(timestamp),
        ) : 'Loading...'
  }, [pylonInfo, pylonPair, ptbEnergy, reserveAnchor, ptb, ptt, lastK, pylonFactory])

  return {healthFactor: healthFactorResult, delta: deltaResult}
}

export function usePairPrices(token0: Currency, token1: Currency, pair: Pair, pairState: PairState) {
  async function getPrices() {
    const price0 = token0 && await axios.get(`${PRICE_API+(token0?.symbol === 'wMOVR' ? 'MOVR' : token0?.symbol === 'WBNB' ? 'BNB' : token0?.symbol)}BUSD`).then
    ((res) => res?.data?.price).catch((e) => console.log(e))
    const price1 = token1 && await axios.get(`${PRICE_API+(token1?.symbol === 'wMOVR' ? 'MOVR' : token1?.symbol === 'WBNB' ? 'BNB' : token1?.symbol)}BUSD`).then
    ((res) => res?.data?.price).catch((e) => console.log(e))
    return (price0 !== undefined && price1 !== undefined) ? [price0, price1] :
        price0 !== undefined
            ? [
              price0,
              (pair?.token0 === token0
                  ? parseFloat(pair?.reserve0?.toFixed(2)) /
                  parseFloat(pair?.reserve1?.toFixed(2))
                  : parseFloat(pair?.reserve1?.toFixed(2)) /
                  parseFloat(pair?.reserve0?.toFixed(2))) * price0,
            ]
            : price1 !== undefined
                ? [
                  (pair?.token1 === token1
                      ? parseFloat(pair?.reserve1?.toFixed(2)) /
                      parseFloat(pair?.reserve0?.toFixed(2))
                      : parseFloat(pair?.reserve1?.toFixed(2)) /
                      parseFloat(pair?.reserve0?.toFixed(2))) * price1,
                  price1,
                ]
                : [0, 0];
  }
  const [prices, setPrices] = useState([0,0])
  // console.log('reserves', pair?.reserve0?.toFixed(2), pair?.reserve1?.toFixed(2))
  useEffect(() => {
    getPrices().then((res) => setPrices(res)).catch((e) => console.log(e))
    // console.log('Prices: ', prices)
  }, [token0, token1, pairState])
  return prices
}

export const useVaultTokens = (vaultAddress: string, tokens: any[]) => {
  const [balances, setBalances] = useState<any[]>([])
  const tokenBalances = []
  tokenBalances.push(useTokenBalance(vaultAddress, tokens[0]))
  tokenBalances.push(useTokenBalance(vaultAddress, tokens[1]))
  useEffect(() => {
    setBalances(tokenBalances)
  }, [tokens])
  return balances
}
