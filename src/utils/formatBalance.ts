import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber, FixedNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { BIG_TEN } from './bigNumber'
import Numeral from 'numeral'

/**
 * Take a formatted amount, e.g. 15 BNB and convert it to full decimal value, e.g. 15000000000000000
 */
export const getDecimalAmount = (amount: BigNumber, decimals = 18) => {
  return new BigNumber(amount).times(BIG_TEN.pow(decimals))
}

export const getBalanceAmount = (amount: BigNumber, decimals = 18) => {
  return new BigNumber(amount).dividedBy(BIG_TEN.pow(decimals))
}

/**
 * This function is not really necessary but is used throughout the site.
 */
export const getBalanceNumber = (balance: BigNumber, decimals = 18) => {
  // console.log("balance", balance.toString())
  return getBalanceAmount(balance, decimals).toNumber()
}

export const getBalanceUSD = (balance: BigNumber, rewardsPrices: number[], decimals = 18) => {
  let totalPrice = new BigNumber(0)
  if (rewardsPrices && rewardsPrices.length > 0) {
    for(let i = 0; i < rewardsPrices.length; i++){
      totalPrice = totalPrice.plus((new BigNumber(rewardsPrices[i]).multipliedBy(balance)));
    }
  }
  return getBalanceAmount(totalPrice, decimals).toNumber()
}

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18, displayDecimals?: number) => {
  return getBalanceAmount(balance, decimals).toFixed(displayDecimals)
}

export const formatNumber = (number: number, minPrecision = 2, maxPrecision = 2) => {
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  }
  return number.toLocaleString(undefined, options)
}

/**
 * Method to format the display of wei given an EthersBigNumber object
 * Note: does NOT round
 */
export const formatBigNumber = (number: EthersBigNumber, displayDecimals = 18, decimals = 18) => {
  const remainder = number.mod(EthersBigNumber.from(10).pow(decimals - displayDecimals))
  return formatUnits(number.sub(remainder), decimals)
}

/**
 * Method to format the display of wei given an EthersBigNumber object with toFixed
 * Note: rounds
 */
export const formatBigNumberToFixed = (number: EthersBigNumber, displayDecimals = 18, decimals = 18) => {
  const formattedString = formatUnits(number, decimals)
  return (+formattedString).toFixed(displayDecimals)
}

/**
 * Formats a FixedNumber like BigNumber
 * i.e. Formats 9763410526137450427.1196 into 9.763 (3 display decimals)
 */
export const formatFixedNumber = (number: FixedNumber, displayDecimals = 18, decimals = 18) => {
  // Remove decimal
  const [leftSide] = number.toString().split('.')
  return formatBigNumber(EthersBigNumber.from(leftSide), displayDecimals, decimals)
}

export const formatLocalisedCompactNumber = (number: number): string => {
  const codeFromStorage = { locale: 'en-US', language: 'English', code: 'en' }

  const isClient = typeof window === 'object'
  const isSupported = window?.Intl

  // For clients do not support Intl, just return number
  if (isClient && !isSupported) {
    return `${number}`
  }

  return new Intl.NumberFormat(codeFromStorage.locale, {
    // notation: 'compact',
    // compactDisplay: 'long',
    maximumSignificantDigits: 2,
  }).format(number)
}

export const toK = (num) => {
  return Numeral(num).format('0.[00]a')
}

export const formatDollarAmount = (num, digits) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return formatter.format(num)
}

export const formattedNum = (number, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  let num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd ? formatDollarAmount(num, 2) : Number(num.toFixed(2))
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4)
    } else {
      return formatDollarAmount(num, 2)
    }
  }

  return Number(num.toFixed(4))
}

export default formatLocalisedCompactNumber
