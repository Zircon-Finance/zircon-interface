import { BigNumber } from '@ethersproject/bignumber'
import {
    useEnergyFactoryContract,
    usePairContract,
    usePairFactoryContract,
    usePylonContract,
    usePylonFactoryContract
} from '../hooks/useContract'
import {useSingleCallResult, useSingleContractMultipleMethods} from '../state/multicall/hooks'
import {MOONBASE_ADDRESSES, PylonFactory, Token} from "zircon-sdk";

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useVirtualAnchorBalance(address?: string): string | undefined {
    const contract = usePylonContract(address, false)
    const result: BigNumber = useSingleCallResult(contract, 'virtualAnchorBalance')?.result?.[0]
    return address && result ? result.toString() : undefined
}

export function useVirtualFloatBalance(address?: string): string | undefined {
    const contract = usePylonContract(address, false)
    const result: BigNumber = useSingleCallResult(contract, 'virtualFloatBalance')?.result?.[0]
    return address && result ? result.toString() : undefined
}

export function useLastPoolTokens(address?: string): string | undefined {
    const contract = usePylonContract(address, false)
    const result: BigNumber = useSingleCallResult(contract, 'lastPoolTokens')?.result?.[0]
    return address && result ? result.toString() : undefined
}

export function useGamma(address?: string): string | undefined {
    const contract = usePylonContract(address, false)
    const result: BigNumber = useSingleCallResult(contract, 'gammaMulDecimals')?.result?.[0]
    return address && result ? result.toString() : undefined
}

export function useLastK(address?: string): string | undefined {
    const contract = usePairContract(address, false)
    const result: BigNumber = useSingleCallResult(contract, 'kLast')?.result?.[0]
    return address && result ? result.toString() : undefined
}

export function usePylonInfo(address?: string): (any)[] | undefined {
    const contract = usePylonContract(address, false)
    const result = useSingleContractMultipleMethods(contract, [
        "virtualAnchorBalance",
        "muMulDecimals",
        "gammaMulDecimals",
        "strikeBlock",
        "EMABlockNumber",
        "gammaEMA",
        "thisBlockEMA",
        "lastRootKTranslated",
        "anchorKFactor",
        "formulaSwitch"
    ])?.map<any>((res => res?.result?.[0]))
    return address && result ? result : undefined
}


export function usePylonConstants(): PylonFactory | undefined {
    const pylonFactoryContract = usePylonFactoryContract(MOONBASE_ADDRESSES.pylonFactory, false)
    const factoryContract = usePairFactoryContract(MOONBASE_ADDRESSES.factory, false)
    const energyFactoryContract = useEnergyFactoryContract(MOONBASE_ADDRESSES.energyFactory, false)

    const pylonResult = useSingleContractMultipleMethods(pylonFactoryContract, [
        "maximumPercentageSync",
        "deltaGammaThreshold",
        "deltaGammaMinFee",
        "EMASamples",
        "muUpdatePeriod",
        "muChangeFactor",
    ])
    const pairResult = useSingleContractMultipleMethods(factoryContract, [
        "liquidityFee",
        "dynamicRatio",
    ])
    const energyResult = useSingleContractMultipleMethods(energyFactoryContract, [
        "feePercentageRev",
        "feePercentageEnergy",
        "getMinMaxFee"
    ])
    let result = pylonResult.concat(pairResult).concat(energyResult)?.flatMap<any>((res => res?.result)).filter(t => t !== undefined)
    return result && result.length > 10 ? new PylonFactory(result[0], result[1], result[2], result[3], result[4], result[5], result[6],
        result[7], result[8], result[9], result[10], result[11]) : undefined
}

export const useEnergyAddress = (token0: Token, token1: Token) => {
    const energyFactoryContract = useEnergyFactoryContract(MOONBASE_ADDRESSES.energyFactory, false)
    console.log('Calling energy contract ', energyFactoryContract.address, ' with ', token0?.address,token0?.name, token1?.address, token1?.name)
    let result = useSingleCallResult(energyFactoryContract, "getEnergy", [token0?.address, token1?.address])
    return result?.result?.[0]
}
