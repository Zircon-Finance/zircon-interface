import { BigNumber } from '@ethersproject/bignumber'
import {usePylonContract} from '../hooks/useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

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
    const contract = usePylonContract(address, false)
    const result: BigNumber = useSingleCallResult(contract, 'lastK')?.result?.[0]
    return address && result ? result.toString() : undefined
}
