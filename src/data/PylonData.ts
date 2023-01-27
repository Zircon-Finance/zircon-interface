import { BigNumber } from '@ethersproject/bignumber'
import {
    useEnergyFactoryContract,
    usePairContract,
    usePairFactoryContract,
    usePylonContract,
    usePylonFactoryContract
} from '../hooks/useContract'
import {useSingleCallResult, useSingleContractMultipleMethods} from '../state/multicall/hooks'
import {EN_FACTORY_ADDRESS, FACTORY_ADDRESS, PYLON_FACTORY_ADDRESS, PylonFactory} from "zircon-sdk";
import {useActiveWeb3React} from "../hooks";
import {PairInfo, PylonInfo} from "zircon-sdk/dist/interfaces/pylonInterface";

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
export function useLiquidityFee(): string | undefined {
    const { chainId } = useActiveWeb3React()
    const factoryContract = usePairFactoryContract(FACTORY_ADDRESS[chainId], false)
    const liquidityFee = useSingleCallResult(factoryContract, "liquidityFee")?.result?.[0]
    return liquidityFee ? liquidityFee.toString() : undefined
}

export function usePylonInfo(address?: string): PylonInfo | undefined {
    console.log('AAAaddress', address)
    const contract = usePylonContract(address, false)
    console.log('AAAcontract', contract)
    const result = useSingleContractMultipleMethods(contract, [
        "virtualAnchorBalance",
        "virtualFloatBalance",
        "muMulDecimals",
        "gammaMulDecimals",
        "strikeBlock",
        "EMABlockNumber",
        "gammaEMA",
        "thisBlockEMA",
        "lastRootKTranslated",
        "formulaSwitch",
        "lastFloatAccumulator",
        "lastOracleTimestamp",
        "lastPrice",
        "p2x",
        "p2y"
    ])?.map<any>((res => res?.result?.[0]))
    return address && result ? {
        virtualAnchorBalance: result[0].toString(),
        virtualFloatBalance: result[1].toString(),
        muMulDecimals: result[2].toString(),
        gammaMulDecimals: result[3].toString(),
        strikeBlock: result[4].toString(),
        EMABlockNumber: result[5].toString(),
        gammaEMA: result[6].toString(),
        thisBlockEMA: result[7].toString(),
        lastRootKTranslated: result[8].toString(),
        formulaSwitch: result[9].toString(),
        lastFloatAccumulator: result[10].toString(),
        lastOracleTimestamp: result[11].toString(),
        lastPrice: result[12].toString(),
        p2x: result[13].toString(),
        p2y: result[14].toString(),
    } : undefined
}

export function usePairInfo(address?: string): PairInfo | undefined {
    const contract = usePairContract(address, false)
    const result = useSingleContractMultipleMethods(contract, [
        "price0CumulativeLast",
        "price1CumulativeLast",
        "kLast"
    ])?.map<any>((res => res?.result?.[0]))
    return address && result ? {
        price0CumulativeLast: result[0].toString(),
        price1CumulativeLast: result[1].toString(),
        kLast: result[2].toString(),
    } : undefined
}


export function usePylonConstants(): PylonFactory | undefined {
    const { chainId } = useActiveWeb3React()

    const pylonFactoryContract = usePylonFactoryContract(PYLON_FACTORY_ADDRESS[chainId], false)
    const factoryContract = usePairFactoryContract(FACTORY_ADDRESS[chainId], false)
    const energyFactoryContract = useEnergyFactoryContract(EN_FACTORY_ADDRESS[chainId], false)

    const pylonResult = useSingleContractMultipleMethods(pylonFactoryContract, [
        "maximumPercentageSync",
        "deltaGammaThreshold",
        "deltaGammaMinFee",
        "EMASamples",
        "muUpdatePeriod",
        "muChangeFactor",
        "oracleUpdateSecs"
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
    console.log("FF:: ", pylonResult, pairResult, energyResult)

    let result = pylonResult.concat(pairResult).concat(energyResult)?.flatMap<any>((res => res?.result)).filter(t => t !== undefined)
    return result && result.length > 10 ? new PylonFactory(result[0], result[1], result[2], result[3], result[4], result[5], result[6],
        result[7], result[8], result[9], result[10], result[11], result[12]) : undefined
}
