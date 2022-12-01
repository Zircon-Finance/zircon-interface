import {Currency, CurrencyAmount, JSBI, Pair, Percent, Pylon, PylonFactory, TokenAmount} from 'zircon-sdk'
import {useCallback, useMemo} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { usePair } from '../../data/Reserves'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import {useTokenBalance, useTokenBalances} from '../wallet/hooks'
import { Field, typeInput } from './actions'

import {usePylon} from "../../data/PylonReserves";
import BigNumber from 'bignumber.js'
import {useLastK, usePairInfo, usePylonConstants, usePylonInfo} from "../../data/PylonData";
import {useBlockNumber} from "../application/hooks";

export function useBurnState(): AppState['burn'] {
  return useSelector<AppState, AppState['burn']>(state => state.burn)
}

export function useDerivedBurnInfo(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined
): {
  pair?: Pair | null
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: CurrencyAmount
    [Field.CURRENCY_B]?: CurrencyAmount
  }
  error?: string
} {
  const { account, chainId } = useActiveWeb3React()

  const { independentField, typedValue } = useBurnState()

  // pair + totalsupply
  const [, pair] = usePair(currencyA, currencyB)

  // balances
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [pair?.liquidityToken])
  const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[pair?.liquidityToken?.address ?? '']

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
  const tokens = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
    [Field.LIQUIDITY]: pair?.liquidityToken
  }

  // liquidity values
  const totalSupply = useTotalSupply(pair?.liquidityToken)
  const liquidityValueA =
      pair &&
      totalSupply &&
      userLiquidity &&
      tokenA &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
          ? new TokenAmount(tokenA, pair.getLiquidityValue(tokenA, totalSupply, userLiquidity, false).raw)
          : undefined
  const liquidityValueB =
      pair &&
      totalSupply &&
      userLiquidity &&
      tokenB &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
          ? new TokenAmount(tokenB, pair.getLiquidityValue(tokenB, totalSupply, userLiquidity, false).raw)
          : undefined
  const liquidityValues: { [Field.CURRENCY_A]?: TokenAmount; [Field.CURRENCY_B]?: TokenAmount } = {
    [Field.CURRENCY_A]: liquidityValueA,
    [Field.CURRENCY_B]: liquidityValueB
  }

  let percentToRemove: Percent = new Percent('0', '100')
  console.log("percent", percentToRemove.toString())
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    percentToRemove = new Percent(typedValue, '100')
  }
  // user specified a specific amount of liquidity tokens
  else if (independentField === Field.LIQUIDITY) {
    if (pair?.liquidityToken) {
      const independentAmount = tryParseAmount(typedValue, pair.liquidityToken)
      if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
        percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw)
      }
    }
  }
  // user specified a specific amount of token a or b
  else {
    if (tokens[independentField]) {
      const independentAmount = tryParseAmount(typedValue, tokens[independentField])
      const liquidityValue = liquidityValues[independentField]
      if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
        percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw)
      }
    }
  }

  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
        userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
            ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
            : undefined,
    [Field.CURRENCY_A]:
        tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
            ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
            : undefined,
    [Field.CURRENCY_B]:
        tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
            ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
            : undefined
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? 'Enter an amount'
  }

  return { pair, parsedAmounts, error }
}

export function getLiquidityValues(pylon: Pylon, userLiquidity: TokenAmount, pylonPoolBalance: TokenAmount,
                                   totalSupply: TokenAmount, ptTotalSupply: TokenAmount, pylonInfo: any[],
                                   pylonConstants: PylonFactory, blockNumber: number,
                                   pairInfo: any[], isSync: boolean, isFloat: boolean, energyPT: TokenAmount, energyAnchor: TokenAmount): {
  amount?: TokenAmount;
  amountA?: TokenAmount;
  amountB?: TokenAmount;
  blocked: boolean;
  fee: TokenAmount;
  deltaApplied: boolean;
  feePercentage: JSBI;
  asyncBlocked?: boolean;
  liquidity?: [TokenAmount, TokenAmount];
  omegaSlashingPercentage?: JSBI;
} {

  if(!ptTotalSupply || !userLiquidity || !pylonPoolBalance || !totalSupply || !pylonInfo || !pylonConstants || !pairInfo || !blockNumber || !pylonInfo[0]) {
    return undefined
  }
  let isLastRoot = new BigNumber(pylonInfo[7].toString()).isEqualTo(0)
  if(isLastRoot) {
    return undefined;
  }else{
    try{
      if(isSync) {
        console.log("burn::", totalSupply.raw.toString(), ptTotalSupply.raw.toString(), userLiquidity.raw.toString(),
            pylonInfo[0].toString(), pylonInfo[1].toString(), pylonInfo[2].toString(), pylonPoolBalance.raw.toString(), pylonInfo[3].toString(), BigInt(blockNumber), pylonConstants,
            pylonInfo[4].toString(), pylonInfo[5].toString(), pylonInfo[6].toString(), pylonInfo[7].toString(), pylonInfo[8].toString(), pylonInfo[9].toString(), pairInfo[2].toString())
        if(JSBI.greaterThanOrEqual(ptTotalSupply.raw, userLiquidity.raw)) {
          let burnInfo = isFloat ?
              pylon.burnFloat(totalSupply, ptTotalSupply, userLiquidity,
                  pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
                  pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], pairInfo[2]) :
              pylon.burnAnchor(totalSupply, ptTotalSupply, userLiquidity,
                  pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
                  pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], pairInfo[2], energyPT, energyAnchor);
          return {...burnInfo, liquidity: isFloat ? [burnInfo.amount, new TokenAmount(pylon.token1, BigInt(0))] :
                [new TokenAmount(pylon.token0, BigInt(0)), burnInfo.amount]}
        }else{
          return undefined
        }
      }else{
        let burnInfo = isFloat ?
            pylon.burnAsyncFloat(totalSupply, ptTotalSupply, userLiquidity,
                pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
                pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], pairInfo[2])
            :
            pylon.burnAsyncAnchor(totalSupply, ptTotalSupply, userLiquidity,
                pylonInfo[0], pylonInfo[1], pylonInfo[2], pylonPoolBalance, pylonInfo[3], BigInt(blockNumber), pylonConstants,
                pylonInfo[4], pylonInfo[5], pylonInfo[6], pylonInfo[7], pylonInfo[8], pylonInfo[9], pairInfo[2], energyPT, energyAnchor);

        return {...burnInfo, liquidity: [burnInfo.amountA, burnInfo.amountB]}


      }
    }catch (e) {
      console.log("hello", pylon.address.toString(), totalSupply.raw.toString(), ptTotalSupply.raw.toString(), userLiquidity.raw.toString(),
          pylonInfo[0].toString(), pylonInfo[1].toString(), pylonInfo[2].toString(), pylonPoolBalance.raw.toString(), pylonInfo[3].toString(), BigInt(blockNumber).toString(), pylonConstants.toString(),
          pylonInfo[4].toString(), pylonInfo[5].toString(), pylonInfo[6].toString(), pylonInfo[7].toString(), pylonInfo[8].toString(), pylonInfo[9].toString(), pairInfo[2].toString())
      console.log(e)
      return undefined
    }
  }
}

export function useDerivedPylonBurnInfo(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    isFloat: boolean,
    isSync: boolean,
    percentage?: string
): {
  pylon?: Pylon | null
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: CurrencyAmount
    [Field.CURRENCY_B]?: CurrencyAmount
  }
  error?: string
  burnInfo?: {
    amount?: TokenAmount;
    amountA?: TokenAmount;
    amountB?: TokenAmount;
    blocked: boolean;
    fee: TokenAmount;
    deltaApplied: boolean;
    feePercentage: JSBI;
    asyncBlocked?: boolean;
    liquidity?: [TokenAmount, TokenAmount];
    omegaSlashingPercentage?: JSBI;
  }
  healthFactor?: string;
  gamma?: string;
} {
  const { account, chainId } = useActiveWeb3React()

  const { independentField, typedValue } = useBurnState()

  // pair + totalsupply
  const [, pylon] = usePylon(currencyA, currencyB)

  // balances
  // const relevantTokenBalances = useTokenBalances(account ?? undefined, isFloat ? [pylon?.floatLiquidityToken] : [pylon?.anchorLiquidityToken])
  // const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[(isFloat ? pylon?.floatLiquidityToken?.address : pylon?.anchorLiquidityToken?.address) ?? '']

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
  const tokens = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
    [Field.LIQUIDITY]: isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken
  }

  // liquidity values

  const pylonInfo = usePylonInfo(pylon?.address)
  const pylonConstants = usePylonConstants()
  const blockNumber = useBlockNumber()
  const userLiquidity = useTokenBalance(account ?? undefined, isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken)
  const pylonPoolBalance = useTokenBalance(pylon?.address, pylon?.pair.liquidityToken)
  const ptTotalSupply = useTotalSupply(isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken)
  const totalSupply = useTotalSupply(pylon?.pair.liquidityToken)
  const pairInfo = usePairInfo(pylon ? Pair.getAddress(pylon.token0, pylon.token1) : "")
  // const lastK = useLastK(pylon ? Pair.getAddress(pylon.token0, pylon.token1) : "");
  // const pylonSupply = useTotalSupply(pylon?.pair.liquidityToken)
  const energyAddress = Pylon.getEnergyAddress(pylon?.token0, pylon?.token1)

  const ptbEnergy = useTokenBalance(energyAddress, pylon?.pair.liquidityToken)
  const reserveAnchor = useTokenBalance(energyAddress, pylon?.anchorLiquidityToken)

  let burnInfo = useMemo(() => {
    return getLiquidityValues(
        pylon, userLiquidity, pylonPoolBalance,
        totalSupply, ptTotalSupply, pylonInfo,
        pylonConstants, blockNumber, pairInfo,
        isSync, isFloat, ptbEnergy, reserveAnchor)
  }, [pylon, userLiquidity, pylonPoolBalance,
    totalSupply, ptTotalSupply, pylonInfo, pylonConstants, blockNumber, pairInfo, isSync, isFloat] )

  const [liquidityValueA, liquidityValueB] = !burnInfo ? [undefined, undefined] : burnInfo?.liquidity

  const healthFactor = useMemo(() => {
    if (pylonInfo && pylon  && pylonInfo[0] && ptbEnergy && reserveAnchor && pylonPoolBalance && totalSupply && pairInfo && pylonConstants) {
      return pylon.getHealthFactor(
          pylonInfo[0],
          pylonPoolBalance,
          totalSupply,
          reserveAnchor.raw,
          ptbEnergy.raw,
          pylonInfo[9],
          pylonInfo[1],
          pylonInfo[7],
          pylonInfo[8],
          pairInfo[2], //JSBI.BigInt(lastK),
          pylonConstants
      ).toString();
    }else{
      return undefined
    }

  }, [pylonInfo, pylon, ptbEnergy, reserveAnchor, pylonPoolBalance, totalSupply, pairInfo, pylonConstants])

  const liquidityValues: { [Field.CURRENCY_A]?: TokenAmount; [Field.CURRENCY_B]?: TokenAmount } = {
    [Field.CURRENCY_A]: liquidityValueA,
    [Field.CURRENCY_B]: liquidityValueB
  }

  let percentToRemove: Percent = new Percent('0', '100')
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    if(!percentage){
      percentToRemove = new Percent(typedValue, '100')
    }else{
      percentToRemove = new Percent(percentage, '100')
    }

  }
  // user specified a specific amount of liquidity tokens
  else if (independentField === Field.LIQUIDITY) {
    let liquidityToken = isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken
    if (liquidityToken) {
      const independentAmount = tryParseAmount(typedValue, liquidityToken)
      if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
        percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw)
      }
    }
  }
  // user specified a specific amount of token a or b
  else {
    if (tokens[independentField]) {
      const independentAmount = tryParseAmount(typedValue, tokens[independentField])
      const liquidityValue = liquidityValues[independentField]
      if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
        percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw)
      }
    }
  }

  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
        userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
            ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
            : undefined,
    [Field.CURRENCY_A]:
        tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
            ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
            : undefined,
    [Field.CURRENCY_B]:
        tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
            ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
            : undefined
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? 'Enter an amount'
  }

  return { pylon, parsedAmounts, error, burnInfo, healthFactor, gamma: pylonInfo?.[2]?.toString() }
}

export function useDerivedPylonBurnInfoFixedPercentage(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    isFloat: boolean,
    isSync: boolean,
    percentage: string,
    balance: any,
): {
  pylon?: Pylon | null
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: CurrencyAmount
    [Field.CURRENCY_B]?: CurrencyAmount
  }
  error?: string
  gamma?: string
  burnInfo?: {
    amount?: TokenAmount;
    amountA?: TokenAmount;
    amountB?: TokenAmount;
    blocked: boolean;
    fee: TokenAmount;
    deltaApplied: boolean;
    feePercentage: JSBI;
    asyncBlocked?: boolean;
    liquidity?: [TokenAmount, TokenAmount];
  }
  healthFactor?: string
} {
  const { account, chainId } = useActiveWeb3React()

// pair + totalsupply
  const [, pylon] = usePylon(currencyA, currencyB)


  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]

  const userLiquidityToken = useTokenBalance(account ?? undefined, isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken)
  const amount = userLiquidityToken?.toFixed(6)
  const total = parseFloat(amount) + parseFloat(balance?.div(new BigNumber(10).pow(18)))
  const userLiquidity = total > 0 && new TokenAmount(
      (isFloat ?
          pylon?.floatLiquidityToken :
          pylon?.anchorLiquidityToken),
      BigInt(Math.floor(total)*10**18)
  )

  const pylonInfo = usePylonInfo(pylon?.address)
  const pylonConstants = usePylonConstants()
  const blockNumber = useBlockNumber()
  const pylonPoolBalance = useTokenBalance(pylon?.address, pylon?.pair.liquidityToken)
  const ptTotalSupply = useTotalSupply(isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken)
  const totalSupply = useTotalSupply(pylon?.pair.liquidityToken)
  const lastK = useLastK(pylon ? Pair.getAddress(pylon.token0, pylon.token1) : "");
  // const pylonSupply = useTotalSupply(pylon?.pair.liquidityToken)

  let burnInfo = useMemo(() => {
    return getLiquidityValues(
        pylon, userLiquidity, pylonPoolBalance,
        totalSupply, ptTotalSupply, pylonInfo,
        pylonConstants, blockNumber, lastK,
        isSync, isFloat, ptbEnergy, reserveAnchor)
  }, [pylon, userLiquidity, pylonPoolBalance,
    totalSupply, ptTotalSupply, pylonInfo, pylonConstants, blockNumber, lastK, isSync, isFloat] )

  const [liquidityValueA, liquidityValueB] = !burnInfo ? [undefined, undefined] : burnInfo?.liquidity

  let percentToRemove: Percent = new Percent(Math.round(parseFloat(percentage)).toString(), '100')

  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
        userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
            ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
            : undefined,
    [Field.CURRENCY_A]:
        tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
            ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
            : undefined,
    [Field.CURRENCY_B]:
        tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
            ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
            : undefined
  }
  // Getting energy constants for health factor calculation
  const energyAddress = Pylon.getEnergyAddress(pylon?.token0, pylon?.token1) //useEnergyAddress(pylonPair?.token0, pylonPair?.token1)
  const ptbEnergy = useTokenBalance(energyAddress, pylon?.pair.liquidityToken)
  const reserveAnchor = useTokenBalance(energyAddress, pylon?.anchorLiquidityToken)


  const healthFactor = useMemo(() => {
    if (pylonInfo && pylon  && pylonInfo[0] && ptbEnergy && reserveAnchor && pylonPoolBalance && totalSupply && lastK && pylonConstants) {
      return pylon.getHealthFactor(
          pylonInfo[0],
          pylonPoolBalance,
          totalSupply,
          reserveAnchor.raw,
          ptbEnergy.raw,
          pylonInfo[9],
          pylonInfo[1],
          pylonInfo[7],
          pylonInfo[8],
          JSBI.BigInt(lastK),
          pylonConstants
      ).toString();
    }else{
      return undefined
    }

  }, [pylonInfo, pylon, ptbEnergy, reserveAnchor, pylonPoolBalance, totalSupply, lastK, pylonConstants])


  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? 'Enter an amount'
  }

  return { pylon, parsedAmounts, error, burnInfo, healthFactor }
}

export function useBurnActionHandlers(): {
  onUserInput: (field: Field, typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onUserInput = useCallback(
      (field: Field, typedValue: string) => {
        dispatch(typeInput({ field, typedValue }))
      },
      [dispatch]
  )

  return {
    onUserInput
  }
}
