import {PoolCategory, SerializedPoolConfig} from './types'
import {ChainId, Token} from "zircon-sdk";
import { serializedTokens } from './farms'

const priceHelperLps: SerializedPoolConfig[] = [
    /**
     * These LPs are just used to help with price calculation for MasterChef LPs (farms.ts).
     * This list is added to the MasterChefLps and passed to fetchFarm. The calls to get contract information about the token/quoteToken in the LP are still made.
     * The absence of a PID means the masterchef contract calls are skipped for this farm.
     * Prices are then fetched for all farms (masterchef + priceHelperLps).
     * Before storing to redux, farms without a PID are filtered out.
     */
    // GAMMA CHANGE!
     {
        sousId: 2,
        token1: serializedTokens.weth,
        token2: serializedTokens.neptune,
        isClassic: false,
        isAnchor: true,
        earningToken: [serializedTokens.neptune],
        stakingToken: new Token(ChainId.MOONBASE, '0x6b5c798dda380bf9bd33bfcf087b09ad9253e50b', 18, 'ZPT', 'Zircon'),
        contractAddress: '0x60574fFe10F5562A84De60eb30fF2cdB0C13d42F',
        vaultAddress: '0x2A6b2d29B6511Cb4060F70929D8aA368E9608e27',
        poolCategory: PoolCategory.CORE,
        harvest: true,
        sortOrder: 1,
        isFinished: false,
        lpAddress: '0x6b5c798dda380bf9bd33bfcf087b09ad9253e50b',
        pylonAddress: '0x6585F1F3A475873e9CF603730075D46d0f3B718b',
      },
]

export default priceHelperLps
