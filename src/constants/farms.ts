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
    isAnchor: true,
  },
  {
    pid: 3,
    lpSymbol: 'NEPT-PLUT LP',
    lpAddress: '0x4843dccb5725d243df5169a7645832eac8b08a00',
    token: serializedTokens.neptune,
    quoteToken: serializedTokens.pluto,
    isCommunity: true,
    isAnchor: true,
  },
  {
    pid: 4,
    lpSymbol: 'SAT-MARS LP',
    lpAddress: '0x317533a7c471cffc1b23045cc74378e0d9b8f7c5',
    token: serializedTokens.saturn,
    quoteToken: serializedTokens.mars,
    isCommunity: true,
    isAnchor: true,
  },
  {
    pid: 5,
    lpSymbol: 'ERTH-JUP LP',
    lpAddress: '0x1e9200b2f7a558b1f2fd5bf7de2e94919d8c2b0b',
    token: serializedTokens.earth,
    quoteToken: serializedTokens.jupiter,
    isCommunity: true,
    isAnchor: true,
  },
  {
    pid: 6,
    lpSymbol: 'ERTH-VEN LP',
    lpAddress: '0x3ee9db11eac15f9313b5b85ea321c573b381b913',
    token: serializedTokens.earth,
    quoteToken: serializedTokens.venus,
    isCommunity: true,
    isAnchor: true,
  },
  {
    pid: 7,
    lpSymbol: 'ERTH-MERC LP',
    lpAddress: '0x58abe7f5132340f90634806c7c8886e7be7bd97a',
    token: serializedTokens.earth,
    quoteToken: serializedTokens.mercury,
    isCommunity: true,
    isAnchor: false,
  },
]

