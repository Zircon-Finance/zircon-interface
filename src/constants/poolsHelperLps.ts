import {SerializedPoolConfig} from './types'
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
        token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
        token2: new Token(ChainId.MOONRIVER, '0x98878b06940ae243284ca214f92bb71a2b032b8a', 18, 'MOVR', 'Moonriver'),
        isClassic: false,
        isAnchor: false,
        earningToken: [new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
            new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
        stakingToken: new Token(ChainId.MOONRIVER, '0x770AA7074297E465E823bf2F45194e926aF0D05d', 18, 'fZPT', 'Zircon Float Token'),
        contractAddress: '0x7CeEa7A00520F7f110314d177edE06EE9A3895d9',
        vaultAddress: '0x77FA7c931d04CA5e8C000D01b6D87380f9C0F3d0',
        lpAddress: "0x89bb1bd89c764e1c2d4aa6469062590732b26323",
        pylonAddress: "0xdbb6e1438a0c48A53D033757fB8a09f5aE879Da8",
        isFinished: false,
    },
]

export default priceHelperLps
