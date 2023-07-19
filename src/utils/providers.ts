import { StaticJsonRpcProvider } from '@ethersproject/providers'
import getRpcUrl from './getRpcUrl'

export const simpleRpcProvider = (chainId: number) => new StaticJsonRpcProvider(getRpcUrl(chainId ?? 421613))

export default null
