import { BigNumber } from '@ethersproject/bignumber'

export const requiresApproval = async (
  contract: any,
  account: string,
  spenderAddress: string,
  minimumRequired: number | BigNumber = 0,
) => {
  try {
    const response = await contract.allowance(account, spenderAddress)
    const hasMinimumRequired =
      (typeof minimumRequired === 'number' && minimumRequired > 0) ||
      (BigNumber.isBigNumber(minimumRequired) && minimumRequired.gt(0))
    if (hasMinimumRequired) {
      return response.lt(minimumRequired)
    }
    return response.lte(0)
  } catch (error) {
    return true
  }
}
