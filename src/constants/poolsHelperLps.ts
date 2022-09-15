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
        token1: new Token(ChainId.MOONRIVER, '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B', 18, '1SWAP', '1Swap'),
        token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
        isClassic: false,
        isAnchor: false,
        earningToken: [new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
            new Token(ChainId.MOONRIVER, '0x3516a7588C2E6FFA66C9507eF51853eb85d76e5B', 18, '1SWAP', '1Swap'),],
        stakingToken: new Token(ChainId.MOONRIVER, '0x99A26474EA98dA5223107061C50A423C6425d7Fd', 18, 'ZPT', 'Zircon Pool Token'),
        sousId: 1,
        contractAddress: '0x915C5248A7a37ea26A81CCBFDD13a85dBA712273',
        vaultAddress: '0x913201f0A4c7EC13f34F80D36cf0782cA8aBbd3a',
        lpAddress: "0x769358518DdBc986fde6d9F03166228DF40df496",
        pylonAddress: "0x1aCE9Be8AF59D7Fc7dC68C7CEfb5c9aFf9260275",
        poolCategory: PoolCategory.CORE,
        harvest: true,
        sortOrder: 1,
        isFinished: false,
    },
]

export default priceHelperLps
