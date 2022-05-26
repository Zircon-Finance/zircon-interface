import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

const farms: SerializedFarmConfig[] = [
  

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
  
]

export default farms
