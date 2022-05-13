import BigNumber from 'bignumber.js'
import getGasPrice from '../getGasPrice'

const BIG_TEN = new BigNumber(10)
const DEFAULT_TOKEN_DECIMAL = BIG_TEN.pow(18)
const DEFAULT_GAS_LIMIT = 200000

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

export const stakeFarm = async (masterChefContract, pid, amount) => {
  const gasPrice = getGasPrice()
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  if (pid === 0) {
    return masterChefContract.enterStaking(value, { ...options, gasPrice })
  }

  return masterChefContract.deposit(pid, value, { ...options, gasPrice })
}

export const unstakeFarm = async (masterChefContract, pid, amount) => {
  const gasPrice = getGasPrice()
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  if (pid === 0) {
    return masterChefContract.leaveStaking(value, { ...options, gasPrice })
  }

  return masterChefContract.withdraw(pid, value, { ...options, gasPrice })
}

export const harvestFarm = async (masterChefContract, pid) => {
  const gasPrice = getGasPrice()
  if (pid === 0) {
    return masterChefContract.leaveStaking('0', { ...options, gasPrice })
  }

  return masterChefContract.deposit(pid, '0', { ...options, gasPrice })
}
