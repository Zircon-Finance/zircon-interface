import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

export const farms: SerializedFarmConfig[] = [
  {
    pid: 2,
    lpSymbol: 'PLUT-SAT LP',
    lpAddress: '0x88b236730bBf3761fc9f78356eaA9ec28514975a',
    token: serializedTokens.pluto,
    quoteToken: serializedTokens.saturn,
    isCommunity: true,
  },
  {
    pid: 3,
    lpSymbol: 'NEPT-PLUT LP',
    lpAddress: '0x4843dccb5725d243df5169a7645832eac8b08a00',
    token: serializedTokens.neptune,
    quoteToken: serializedTokens.pluto,
    isCommunity: true,
  },
  {
    pid: 4,
    lpSymbol: 'SAT-MARS LP',
    lpAddress: '0x317533a7c471cffc1b23045cc74378e0d9b8f7c5',
    token: serializedTokens.saturn,
    quoteToken: serializedTokens.mars,
    isCommunity: true,
  },
]

