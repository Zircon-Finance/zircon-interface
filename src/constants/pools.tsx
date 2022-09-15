import { BigNumber } from '@ethersproject/bignumber'
import { SerializedPoolConfig, PoolCategory } from './types'
import { ChainId, Token } from 'zircon-sdk'

export const MAX_LOCK_DURATION = 31536000
export const UNLOCK_FREE_DURATION = 604800
export const ONE_WEEK_DEFAULT = 604800
export const BOOST_WEIGHT = BigNumber.from('20000000000000')
export const DURATION_FACTOR = BigNumber.from('31536000')
const { MOONRIVER } = ChainId

const pools: SerializedPoolConfig[] = [
  {
    sousId: 1,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0x98878b06940ae243284ca214f92bb71a2b032b8a', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
                  new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xBB57187c7883d25a64a08640905376f4CeF6C1ef', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0x3b582245978ed6A0a38836BA7e163eeac6Ef53EC',
    vaultAddress: '0xDeeAcA1abBd0c99a7B424Cd0da9A7d37dc279d1d',
    lpAddress: "0x027c902dc32B8E98663cd048Aa7545e50479B674",
    pylonAddress: "0x77FA7c931d04CA5e8C000D01b6D87380f9C0F3d0",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 2,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0x98878b06940ae243284ca214f92bb71a2b032b8a', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
      new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x770AA7074297E465E823bf2F45194e926aF0D05d', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x027c902dc32B8E98663cd048Aa7545e50479B674',
    vaultAddress: '0x77FA7c931d04CA5e8C000D01b6D87380f9C0F3d0',
    lpAddress: "0x027c902dc32B8E98663cd048Aa7545e50479B674",
    pylonAddress: "0x027c902dc32B8E98663cd048Aa7545e50479B674",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 3,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', 18, 'ETH', 'Ethereum'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x0c2887643e23Fbf4b3205E60492A5618eDdd4103', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0x22A50C39094dead4F44aAdf69536c7f2EcdB1c60',
    vaultAddress: '0x169bF3b77f518a9d0D339014b39E1B282B17f8e0',
    lpAddress: "0x7eEB63Ad0772f1c8eC4486E61e79860eFe92CFB8",
    pylonAddress: "0x415e151f26793e634ce23d83c39f55d2b1096395",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 4,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', 18, 'ETH', 'Ethereum'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xc50A53dc95e3875640f5f9c3C65643b984918c66', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0xc326a93Bb71a44B0c321c49EDD6Fc307af1e3675',
    vaultAddress: '0x6b59ff4b8374ccDeDd0ACa8B42F0141c3503Dc26',
    lpAddress: "0x7eEB63Ad0772f1c8eC4486E61e79860eFe92CFB8",
    pylonAddress: "0x415e151f26793e634ce23d83c39f55d2b1096395",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 5,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xc3722E72a64c4Cab0308d72067bC07c7689b4F2F', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0x240f7Ed2691a03ba6634046B803dF010B4F554E1',
    vaultAddress: '0xd32fF174c7ea82281b8FD22432EDbFf46925A875',
    lpAddress: "0x5aC1F0b2ee43048beb1bC76a85763CFB3D23CE0b",
    pylonAddress: "0x7B43048eFf48A0Dca5aBcb2eea52f7bDC2708113",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 6,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x61DBB475DBb84Be23A0D555FA269754EDA88F5D1', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x289914C8aE0aBAd9f4389Be920103Cd5b0F18a77',
    vaultAddress: '0x12d7bb0CDA20B111B83Ae187b9a90Cf29e76F93E',
    lpAddress: "0x5aC1F0b2ee43048beb1bC76a85763CFB3D23CE0b",
    pylonAddress: "0x7B43048eFf48A0Dca5aBcb2eea52f7bDC2708113",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 7,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 18, 'KSM', 'Kusama'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x8170b304bddbc58ab6bf8b728a1aafd39abe2d89', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xcC32E10E2B0BA8708B64452a3486dfa4d55D50DD',
    vaultAddress: '0xD942a89417310712383c11c1eed9AB93E9E5F913',
    lpAddress: "0xd3695D5eA14E4958AEE9F6128D4C71B21F094dC4",
    pylonAddress: "0x01489215354D17e5201b84E5bc88BB1eBAc253b8",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 8,
    token1: new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
    token2: new Token(ChainId.MOONRIVER, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 18, 'KSM', 'Kusama'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x72C46b87135EE3a1133522392bd8Ee318Cf3b9B2', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x642F2c3213c5da5Fa72aF56C5851BE53c2B76973',
    vaultAddress: '0xcb27d222AaCA54c8E1391d48beE9989beBc44796',
    lpAddress: "0xd3695D5eA14E4958AEE9F6128D4C71B21F094dC4",
    pylonAddress: "0x01489215354D17e5201b84E5bc88BB1eBAc253b8",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 9,
    token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
      new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x6E9685c324Cdf126e5BF08F54573120A9c19E061', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xd2cB07fAB993931B1E8f73cED4e6822a7C536318',
    vaultAddress: '0x3ac71a5570dCC34be392d8EA9E5228D55a40AE50',
    lpAddress: "0xcc2a7ceF44CAa59847699104629E034eA7D89F6a",
    pylonAddress: "0x06E24e76e6dBc3121d7f85b7eCcd692891417375",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 10,
    token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
      new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x17Bd5A512ac2906C89C37B3b863D69e418fBdaAa', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x839fce6cc073a1Cc55c27e1B3fbf8481A13E08e2',
    vaultAddress: '0x5B57C43B92D9a827F7d26024f9b7618f987EdF43',
    lpAddress: "0xcc2a7ceF44CAa59847699104629E034eA7D89F6a",
    pylonAddress: "0x06E24e76e6dBc3121d7f85b7eCcd692891417375",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 11,
    token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    token2: new Token(ChainId.MOONRIVER, '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', 18, 'ETH', 'Ethereum'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
      new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x45614680bd415d2B52B599210fE837b6df0945cF', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xc75Db6734A07B39668e3E1bD1D6E598723B3E7D6',
    vaultAddress: '0xC0783f87cf87628dB1e08fe535205bC488aD5cC3',
    lpAddress: "0xAeFafaA837CDd8A35aFC11100069e073257C0e3e",
    pylonAddress: "0xDc57323250F00c08e1DF24067B0b57C56E1EF878",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 12,
    token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    token2: new Token(ChainId.MOONRIVER, '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', 18, 'ETH', 'Ethereum'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xB62D77084D5621053c4E04C1c64588F102738088', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0xB6e89B6c582ecC797c4f77397419389eFfb250d2',
    vaultAddress: '0x342589a0f877B731eee2949AB7a35D222Ae3bD97',
    lpAddress: "0xAeFafaA837CDd8A35aFC11100069e073257C0e3e",
    pylonAddress: "0xDc57323250F00c08e1DF24067B0b57C56E1EF878",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 13,
    token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    token2: new Token(ChainId.MOONRIVER, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 18, 'KSM', 'Kusama'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
      new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x58c44bA47370A79f3b2214658072610D1AAC3061', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0x6F4530E2509Ecd201Ca1c260BB8D4Fbd485B5F81',
    vaultAddress: '0x621E936b91882888d595015fB0B5adBE4173b76b',
    lpAddress: "0xd80B9003740Ca40cC5F77B3298409809281a622F",
    pylonAddress: "0x555FB2aDB6A44b10a92598Ac20ED1896cf4ebcA5",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 14,
    token1: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    token2: new Token(ChainId.MOONRIVER, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 18, 'KSM', 'Kusama'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'MoonRiver'),
      new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xbDe1DbD3d1E080846eE153EF9EDAf708B98682f7', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0xCa22E827e569BA2fF13Cb6A89aA1f86b56240D67',
    vaultAddress: '0xF45f5F4C72afF29185e3F6B065fa86C79ab673C2',
    lpAddress: "0xd80B9003740Ca40cC5F77B3298409809281a622F",
    pylonAddress: "0x555FB2aDB6A44b10a92598Ac20ED1896cf4ebcA5",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 15,
    token1: new Token(ChainId.MOONRIVER, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 18, 'KSM', 'Kusama'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xD5789306c2CA0ea2B63722C56A030806fbD6735B', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xdaCA2Eb93ebC344555B566B16c8afC30fF3F2e86',
    vaultAddress: '0xFbb21E404bF5Ea350920597F4d5d68667a89da07',
    lpAddress: "0x0df9060F44B3E01A4Cc906FfA7b7Bf243559B0b1",
    pylonAddress: "0xc93FAe6835FAB310043553841755d5DA0D196B3C",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 16,
    token1: new Token(ChainId.MOONRIVER, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 18, 'KSM', 'Kusama'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xCD45fDA8CA4f988C285c2f2a387d22Bc8B9CcB66', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0xd1f4AaC9dC581bac69587d63ACC383a7e4d45d3a',
    vaultAddress: '0x60100E240287535e9F40D4Fc61d16CcFD9fdE764',
    lpAddress: "0x0df9060F44B3E01A4Cc906FfA7b7Bf243559B0b1",
    pylonAddress: "0xc93FAe6835FAB310043553841755d5DA0D196B3C",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 17,
    token1: new Token(ChainId.MOONRIVER, '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', 18, 'ETH', 'Ethereum'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xd504F7aF75719a902aF20f88Bf9300D7b3Ae6705', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0x3d6AdeAE7DA37d34AE9430bEcBe3CAB2E97570a9',
    vaultAddress: '0x173Ab57929AA462d7BE1Cd81542b77b1E35812dC',
    lpAddress: "0xBB32CDE9Dce5eF4f27d1562AA9Bf93d62C0C5d7E",
    pylonAddress: "0x9dEDC01BD6D86a0d07a24c64C8CaCAEC01c074ec",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 18,
    token1: new Token(ChainId.MOONRIVER, '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', 18, 'ETH', 'Ethereum'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xBC026249fC2D6d636424ffa2e229d07f36a38Cb1', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0xdDc7976357bCDe73de7a00eaFd68fF8D126f6DB7',
    vaultAddress: '0x57A397979AC8F8BbF483eA57067714Bd9da681Ac',
    lpAddress: "0xBB32CDE9Dce5eF4f27d1562AA9Bf93d62C0C5d7E",
    pylonAddress: "0x9dEDC01BD6D86a0d07a24c64C8CaCAEC01c074ec",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 19,
    token1: new Token(ChainId.MOONRIVER, '0x6Ccf12B480A99C54b23647c995f4525D544A7E72', 18, 'LDO', 'Lido'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xe668120Df571bE7662a90f405C4490a8D5F7E777', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xaCeF6f0bc071c2D416A56044113945EF6F39e949',
    vaultAddress: '0x033c3F2623Ec00033f7e4A3E9dD7D434cDD2cA26',
    lpAddress: "0x1a8D41A276Ec175A5C76dE5857D0Ee2Bcdc90256",
    pylonAddress: "0x9c9bB27F92108db3A83595FA9FcC58eED2C04C53",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 20,
    token1: new Token(ChainId.MOONRIVER, '0x6Ccf12B480A99C54b23647c995f4525D544A7E72', 18, 'LDO', 'Lido'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x7fEe8716e13a00cD73889aCB76D46217DD7A6E3e', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x48E8cC3B97F6b4964052d646c3846d3586F72356',
    vaultAddress: '0x12f29431b605dfC9dBFCB1Ab6DCD543a651bBba0',
    lpAddress: "0x1a8D41A276Ec175A5C76dE5857D0Ee2Bcdc90256",
    pylonAddress: "0x9c9bB27F92108db3A83595FA9FcC58eED2C04C53",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },

  {
    sousId: 21,
    token1: new Token(ChainId.MOONRIVER, '0x6Ccf12B480A99C54b23647c995f4525D544A7E72', 18, 'LDO', 'Lido'),
    token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xAA695d11C7f5CD2f26bf225BA0Ea00A0C9779b25', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xa5C8ECDCe8Bf3b1E2fAbf080c2bd03f609553346',
    vaultAddress: '0x82d713FcF020A3dA2057DC63EA08C35D3c0ae284',
    lpAddress: "0xDea4E4C9E55bB3720D1944E9465FD87A1a704261",
    pylonAddress: "0xd0589a3e9c23f445665df862b86b1b54a0297379",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 22,
    token1: new Token(ChainId.MOONRIVER, '0x6Ccf12B480A99C54b23647c995f4525D544A7E72', 18, 'LDO', 'Lido'),
    token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x39c2edfdb8032bc166008180e1bb7eaa43af559d', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x4AC222536695Ff8c8588d2e21910437CeA403d4C',
    vaultAddress: '0x9230C14D7320c1F6768396c75135eA631027992c',
    lpAddress: "0xDea4E4C9E55bB3720D1944E9465FD87A1a704261",
    pylonAddress: "0xd0589a3e9c23f445665df862b86b1b54a0297379",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 23,
    token1: new Token(ChainId.MOONRIVER, '0xbb8d88bcd9749636bc4d2be22aac4bb3b01a58f1', 18, 'MFAM', 'Moonwell Apollo'),
    token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xad747801159496b5862e6Fa4331a9fe29852D7cb', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xE437AE17CD29EEbD9f05F286CDdd09dccE00E0D1',
    vaultAddress: '0xE1d23fd84f4b36016B85ed634aa680F0f3778F0b',
    lpAddress: "0x69137360E23733a7f31F0B51421b681BB6d8A763",
    pylonAddress: "0xee773bBf09Cb07A5696c88f706aF0c1AfFC6753C",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 24,
    token1: new Token(ChainId.MOONRIVER, '0xbb8d88bcd9749636bc4d2be22aac4bb3b01a58f1', 18, 'MFAM', 'Moonwell Apollo'),
    token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x464feca42bce8693858fdd0c9c4313fee7168966', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x2629002dC7F98C8870B6Bc8994bb72FCBffee4F4',
    vaultAddress: '0xDf09B79B657657d3fEFB362fE515403Fe2e97DfD',
    lpAddress: "0x69137360E23733a7f31F0B51421b681BB6d8A763",
    pylonAddress: "0xee773bBf09Cb07A5696c88f706aF0c1AfFC6753C",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 25,
    token1: new Token(ChainId.MOONRIVER, '0xffffffff893264794d9d57e1e0e21e0042af5a0a', 18, 'RMRK', 'RMRK'),
    token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xad747801159496b5862e6Fa4331a9fe29852D7cb', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0xDc67d147F927Ed9Bb9b1AbD8a568a0F14be617E4',
    vaultAddress: '0xa6860b90F6017306beBaA296C2ce7BEE2cc8C961',
    lpAddress: "0xc702cA41245205B699Da7799E8Cbb7B13F5936c5",
    pylonAddress: "0xd31eDddEE27E0c76437f0F133Df2Ea7759D311Db",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 26,
    token1: new Token(ChainId.MOONRIVER, '0xffffffff893264794d9d57e1e0e21e0042af5a0a', 18, 'RMRK', 'RMRK'),
    token2: new Token(ChainId.MOONRIVER, '0x98878B06940aE243284CA214f92Bb71a2b032B8A', 18, 'MOVR', 'Moonriver'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x804fde7ac41c40b6f743829a2e35336c91767271', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x0a9E6917FcE7aAAfB42210F590BA59B9D61956b0',
    vaultAddress: '0x830E6aF956703162D15e4665EA3Ec54515862Daf',
    lpAddress: "0xc702cA41245205B699Da7799E8Cbb7B13F5936c5",
    pylonAddress: "0xd31eDddEE27E0c76437f0F133Df2Ea7759D311Db",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 27,
    token1: new Token(ChainId.MOONRIVER, '0xFFFfFfFfF6E528AD57184579beeE00c5d5e646F0', 18, 'kBTC', 'kBTC'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: false,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0x28895C57bD25b03418BaDa484197Bd219958d61f', 18, 'fZPT', 'Zircon Float Token'),
    contractAddress: '0x7B1bcE67e845B5c6474417061f79848698e06902',
    vaultAddress: '0x237C397b82b6c456bc7155C4C1b4e5222891475a',
    lpAddress: "0xCE21B290B23AcB2A7AA2f8BF2c21ACBa3A9aE75a",
    pylonAddress: "0xCC2e189b713e0cdfA446C6D065B70D9653b2b0E1",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 28,
    token1: new Token(ChainId.MOONRIVER, '0xFFFfFfFfF6E528AD57184579beeE00c5d5e646F0', 18, 'kBTC', 'kBTC'),
    token2: new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 18, 'USDC', 'USDC'),
    isClassic: false,
    isAnchor: true,
    earningToken: [new Token(MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),],
    stakingToken: new Token(MOONRIVER, '0xe8eEf11C1eae85844d800Bc18Fe31D4FBC5C5c83', 18, 'sZPT', 'Zircon Stable Token'),
    contractAddress: '0x45DedE74B3EF30dE095e6cdCa69102E35Bd90ebf',
    vaultAddress: '0xDEe8EcB407282A28442e130f731f8b77E6eeC95D',
    lpAddress: "0xCE21B290B23AcB2A7AA2f8BF2c21ACBa3A9aE75a",
    pylonAddress: "0xCC2e189b713e0cdfA446C6D065B70D9653b2b0E1",
    poolCategory: PoolCategory.CORE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
  },
]


//David Vittori, [16 Sep 2022 at 00:25:26]:
// [
//   '0x7CeEa7A00520F7f110314d177edE06EE9A3895d9',
//   '0x77FA7c931d04CA5e8C000D01b6D87380f9C0F3d0',
//   psionicFarmAddress: '0x7CeEa7A00520F7f110314d177edE06EE9A3895d9',
//   psionicVault: '0x77FA7c931d04CA5e8C000D01b6D87380f9C0F3d0'
// ]
// [
//   '0xc326a93Bb71a44B0c321c49EDD6Fc307af1e3675',
//   '0x6b59ff4b8374ccDeDd0ACa8B42F0141c3503Dc26',
//   psionicFarmAddress: '0xc326a93Bb71a44B0c321c49EDD6Fc307af1e3675',
//   psionicVault: '0x6b59ff4b8374ccDeDd0ACa8B42F0141c3503Dc26'
// ]
// [
//   '0x289914C8aE0aBAd9f4389Be920103Cd5b0F18a77',
//   '0x12d7bb0CDA20B111B83Ae187b9a90Cf29e76F93E',
//   psionicFarmAddress: '0x289914C8aE0aBAd9f4389Be920103Cd5b0F18a77',
//   psionicVault: '0x12d7bb0CDA20B111B83Ae187b9a90Cf29e76F93E'
// ]
// [
//   '0x642F2c3213c5da5Fa72aF56C5851BE53c2B76973',
//   '0xcb27d222AaCA54c8E1391d48beE9989beBc44796',
//   psionicFarmAddress: '0x642F2c3213c5da5Fa72aF56C5851BE53c2B76973',
//   psionicVault: '0xcb27d222AaCA54c8E1391d48beE9989beBc44796'
// ]
// [
//   '0x839fce6cc073a1Cc55c27e1B3fbf8481A13E08e2',
//   '0x5B57C43B92D9a827F7d26024f9b7618f987EdF43',
//   psionicFarmAddress: '0x839fce6cc073a1Cc55c27e1B3fbf8481A13E08e2',
//   psionicVault: '0x5B57C43B92D9a827F7d26024f9b7618f987EdF43'
// ]
// [
//   '0xB6e89B6c582ecC797c4f77397419389eFfb250d2',
//   '0x342589a0f877B731eee2949AB7a35D222Ae3bD97',
//   psionicFarmAddress: '0xB6e89B6c582ecC797c4f77397419389eFfb250d2',
//   psionicVault: '0x342589a0f877B731eee2949AB7a35D222Ae3bD97'
// ]
// [
//   '0xCa22E827e569BA2fF13Cb6A89aA1f86b56240D67',
//   '0xF45f5F4C72afF29185e3F6B065fa86C79ab673C2',
//   psionicFarmAddress: '0xCa22E827e569BA2fF13Cb6A89aA1f86b56240D67',
//   psionicVault: '0xF45f5F4C72afF29185e3F6B065fa86C79ab673C2'
// ]
// [
//   '0xd1f4AaC9dC581bac69587d63ACC383a7e4d45d3a',
//   '0x60100E240287535e9F40D4Fc61d16CcFD9fdE764',
//   psionicFarmAddress: '0xd1f4AaC9dC581bac69587d63ACC383a7e4d45d3a',
//   psionicVault: '0x60100E240287535e9F40D4Fc61d16CcFD9fdE764'
// ]
// [
//   '0xdDc7976357bCDe73de7a00eaFd68fF8D126f6DB7',
//   '0x57A397979AC8F8BbF483eA57067714Bd9da681Ac',
//   psionicFarmAddress: '0xdDc7976357bCDe73de7a00eaFd68fF8D126f6DB7',
//   psionicVault: '0x57A397979AC8F8BbF483eA57067714Bd9da681Ac'
// ]
// [
//   '0x48E8cC3B97F6b4964052d646c3846d3586F72356',
//   '0x12f29431b605dfC9dBFCB1Ab6DCD543a651bBba0',
//   psionicFarmAddress: '0x48E8cC3B97F6b4964052d646c3846d3586F72356',
//   psionicVault: '0x12f29431b605dfC9dBFCB1Ab6DCD543a651bBba0'
// ]
// [
//   '0x4AC222536695Ff8c8588d2e21910437CeA403d4C',
//   '0x9230C14D7320c1F6768396c75135eA631027992c',
//   psionicFarmAddress: '0x4AC222536695Ff8c8588d2e21910437CeA403d4C',
//   psionicVault: '0x9230C14D7320c1F6768396c75135eA631027992c'
// ]
// [
//   '0x2629002dC7F98C8870B6Bc8994bb72FCBffee4F4',
//   '0xDf09B79B657657d3fEFB362fE515403Fe2e97DfD',
//   psionicFarmAddress: '0x2629002dC7F98C8870B6Bc8994bb72FCBffee4F4',
//   psionicVault: '0xDf09B79B657657d3fEFB362fE515403Fe2e97DfD'
// ]
// [
//   '0x0a9E6917FcE7aAAfB42210F590BA59B9D61956b0',
//   '0x830E6aF956703162D15e4665EA3Ec54515862Daf',
//   psionicFarmAddress: '0x0a9E6917FcE7aAAfB42210F590BA59B9D61956b0',
//   psionicVault: '0x830E6aF956703162D15e4665EA3Ec54515862Daf'
// ]
// [
//   '0x45DedE74B3EF30dE095e6cdCa69102E35Bd90ebf',
//   '0xDEe8EcB407282A28442e130f731f8b77E6eeC95D',
//   psionicFarmAddress: '0x45DedE74B3EF30dE095e6cdCa69102E35Bd90ebf',
//   psionicVault: '0xDEe8EcB407282A28442e130f731f8b77E6eeC95D'
// ]
// [
//   '0x3b582245978ed6A0a38836BA7e163eeac6Ef53EC',
//   '0xDeeAcA1abBd0c99a7B424Cd0da9A7d37dc279d1d',
//   psionicFarmAddress: '0x3b582245978ed6A0a38836BA7e163eeac6Ef53EC',
//   psionicVault: '0xDeeAcA1abBd0c99a7B424Cd0da9A7d37dc279d1d'
// ]
// [
//   '0x22A50C39094dead4F44aAdf69536c7f2EcdB1c60',
//   '0x169bF3b77f518a9d0D339014b39E1B282B17f8e0',
//   psionicFarmAddress: '0x22A50C39094dead4F44aAdf69536c7f2EcdB1c60',
//   psionicVault: '0x169bF3b77f518a9d0D339014b39E1B282B17f8e0'
// ]
// [
//   '0x240f7Ed2691a03ba6634046B803dF010B4F554E1',
//   '0xd32fF174c7ea82281b8FD22432EDbFf46925A875',
//   psionicFarmAddress: '0x240f7Ed2691a03ba6634046B803dF010B4F554E1',
//   psionicVault: '0xd32fF174c7ea82281b8FD22432EDbFf46925A875'
// ]
// [
//   '0xcC32E10E2B0BA8708B64452a3486dfa4d55D50DD',
//   '0xD942a89417310712383c11c1eed9AB93E9E5F913',
//   psionicFarmAddress: '0xcC32E10E2B0BA8708B64452a3486dfa4d55D50DD',
//
// psionicVault: '0xD942a89417310712383c11c1eed9AB93E9E5F913'
// ]
// [
//   '0xd2cB07fAB993931B1E8f73cED4e6822a7C536318',
//   '0x3ac71a5570dCC34be392d8EA9E5228D55a40AE50',
//   psionicFarmAddress: '0xd2cB07fAB993931B1E8f73cED4e6822a7C536318',
//   psionicVault: '0x3ac71a5570dCC34be392d8EA9E5228D55a40AE50'
// ]
// [
//   '0xc75Db6734A07B39668e3E1bD1D6E598723B3E7D6',
//   '0xC0783f87cf87628dB1e08fe535205bC488aD5cC3',
//   psionicFarmAddress: '0xc75Db6734A07B39668e3E1bD1D6E598723B3E7D6',
//   psionicVault: '0xC0783f87cf87628dB1e08fe535205bC488aD5cC3'
// ]
// [
//   '0x6F4530E2509Ecd201Ca1c260BB8D4Fbd485B5F81',
//   '0x621E936b91882888d595015fB0B5adBE4173b76b',
//   psionicFarmAddress: '0x6F4530E2509Ecd201Ca1c260BB8D4Fbd485B5F81',
//   psionicVault: '0x621E936b91882888d595015fB0B5adBE4173b76b'
// ]
// [
//   '0xdaCA2Eb93ebC344555B566B16c8afC30fF3F2e86',
//   '0xFbb21E404bF5Ea350920597F4d5d68667a89da07',
//   psionicFarmAddress: '0xdaCA2Eb93ebC344555B566B16c8afC30fF3F2e86',
//   psionicVault: '0xFbb21E404bF5Ea350920597F4d5d68667a89da07'
// ]
// [
//   '0x3d6AdeAE7DA37d34AE9430bEcBe3CAB2E97570a9',
//   '0x173Ab57929AA462d7BE1Cd81542b77b1E35812dC',
//   psionicFarmAddress: '0x3d6AdeAE7DA37d34AE9430bEcBe3CAB2E97570a9',
//   psionicVault: '0x173Ab57929AA462d7BE1Cd81542b77b1E35812dC'
// ]
// [
//   '0xaCeF6f0bc071c2D416A56044113945EF6F39e949',
//   '0x033c3F2623Ec00033f7e4A3E9dD7D434cDD2cA26',
//   psionicFarmAddress: '0xaCeF6f0bc071c2D416A56044113945EF6F39e949',
//   psionicVault: '0x033c3F2623Ec00033f7e4A3E9dD7D434cDD2cA26'
// ]
// [
//   '0xa5C8ECDCe8Bf3b1E2fAbf080c2bd03f609553346',
//   '0x82d713FcF020A3dA2057DC63EA08C35D3c0ae284',
//   psionicFarmAddress: '0xa5C8ECDCe8Bf3b1E2fAbf080c2bd03f609553346',
//   psionicVault: '0x82d713FcF020A3dA2057DC63EA08C35D3c0ae284'
// ]
// [
//   '0xE437AE17CD29EEbD9f05F286CDdd09dccE00E0D1',
//   '0xE1d23fd84f4b36016B85ed634aa680F0f3778F0b',
//   psionicFarmAddress: '0xE437AE17CD29EEbD9f05F286CDdd09dccE00E0D1',
//   psionicVault: '0xE1d23fd84f4b36016B85ed634aa680F0f3778F0b'
// ]
// [
//   '0xDc67d147F927Ed9Bb9b1AbD8a568a0F14be617E4',
//   '0xa6860b90F6017306beBaA296C2ce7BEE2cc8C961',
//   psionicFarmAddress: '0xDc67d147F927Ed9Bb9b1AbD8a568a0F14be617E4',
//   psionicVault: '0xa6860b90F6017306beBaA296C2ce7BEE2cc8C961'
// ]
// [
//   '0x7B1bcE67e845B5c6474417061f79848698e06902',
//   '0x237C397b82b6c456bc7155C4C1b4e5222891475a',
//   psionicFarmAddress: '0x7B1bcE67e845B5c6474417061f79848698e06902',
//   psionicVault: '0x237C397b82b6c456bc7155C4C1b4e5222891475a'
// ]
// [
//   '0x7CeEa7A00520F7f110314d177edE06EE9A3895d9',
//   '0x77FA7c931d04CA5e8C000D01b6D87380f9C0F3d0',
//   psionicFarmAddress: '0x7CeEa7A00520F7f110314d177edE06EE9A3895d9',
//   psionicVault: '0x77FA7c931d04CA5e8C000D01b6D87380f9C0F3d0'
// ]



// known finished pools
// const finishedPools = [
//   {
//     sousId: 278,
//     stakingToken: serializedTokens.cake,
//     earningToken: serializedTokens.pluto,
//     contractAddress: '0x82f94d4e56Af531fEB58BFDAFa1f9AA352787710',
//     poolCategory: PoolCategory.CORE,
//     harvest: true,
//     sortOrder: 999,
//     tokenPerBlock: '0.06794',
//     version: 3,
//     isFinished: true,
//   },
// ]
//   .map((p) => ({ ...p, isFinished: true }))

export default [...pools]
