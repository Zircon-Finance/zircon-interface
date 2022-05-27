import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

export const farms: SerializedFarmConfig[] = [
  {
    pid: 2,
    lpSymbol: 'PLUT-SAT LP',
    lpAddresses: {
      97: '0x88b236730bBf3761fc9f78356eaA9ec28514975a',
      56: '0x88b236730bBf3761fc9f78356eaA9ec28514975a',
    },
    token: serializedTokens.pluto,
    quoteToken: serializedTokens.saturn,
    isCommunity: true,
  },
  {
    pid: 5,
    lpSymbol: 'PLUT-SAT 2LP',
    lpAddresses: {
      97: '0x5DDd4f09e0faD036b151Bf1f1c60b42AE8293C58',
      56: '0x5DDd4f09e0faD036b151Bf1f1c60b42AE8293C58',
    },
    token: serializedTokens.pluto,
    quoteToken: serializedTokens.saturn,
    isCommunity: true,
  },
]

