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
        sousId: 1,
        token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
        token2: new Token(ChainId.MOONRIVER, '0x98878b06940ae243284ca214f92bb71a2b032b8a', 18, 'MOVR', 'Moonriver'),
        isClassic: false,
        isAnchor: false,
        earningToken: [new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
            new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
        stakingToken: new Token(ChainId.MOONRIVER, '0xBB57187c7883d25a64a08640905376f4CeF6C1ef', 18, 'fZPT', 'Zircon Float Token'),
        contractAddress: '0x3b582245978ed6A0a38836BA7e163eeac6Ef53EC',
        vaultAddress: '0xDeeAcA1abBd0c99a7B424Cd0da9A7d37dc279d1d',
        lpAddress: "0x89bb1bd89c764e1c2d4aa6469062590732b26323",
        pylonAddress: "0x027c902dc32B8E98663cd048Aa7545e50479B674",
        poolCategory: PoolCategory.CORE,
        harvest: true,
        sortOrder: 1,
        isFinished: false,
    },
]

export default priceHelperLps
