import {PoolCategory, SerializedPoolConfig} from './types'
import {ChainId, Token} from "zircon-sdk";

const priceHelperLps: SerializedPoolConfig[] = [
    /**
     * These LPs are just used to help with price calculation for MasterChef LPs (farms.ts).
     * This list is added to the MasterChefLps and passed to fetchFarm. The calls to get contract information about the token/quoteToken in the LP are still made.
     * The absence of a PID means the masterchef contract calls are skipped for this farm.
     * Prices are then fetched for all farms (masterchef + priceHelperLps).
     * Before storing to redux, farms without a PID are filtered out.
     */
    {
        token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
        token2: new Token(ChainId.MOONRIVER, '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B', 18, '1SWAP', '1Swap'),
        isClassic: false,
        isAnchor: true,
        earningToken: [new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
            new Token(ChainId.MOONRIVER, '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B', 18, '1SWAP', '1Swap'),],
        stakingToken: new Token(ChainId.MOONRIVER, '0xa22451B59d48eB0Ab6A7350A68c2Ceb542FceEd8', 18, 'ZPT', 'Zircon Pool Token'),
        sousId: 1,
        contractAddress: '0xcCbd734ED3b4cc214ea60F3Be1895C45782e690C',
        vaultAddress: '0x2CB2494958051f378E96fF968Dc1ea99C43b0E9A',
        lpAddress: "0x769358518DdBc986fde6d9F03166228DF40df496",
        pylonAddress: "0x53227f842eFc1d07E39f53882f6A6c9809F89C3a",
        poolCategory: PoolCategory.CORE,
        harvest: true,
        sortOrder: 1,
        isFinished: false,
    },
]

export default priceHelperLps
