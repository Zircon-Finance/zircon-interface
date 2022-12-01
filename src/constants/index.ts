import {ChainId, JSBI, Percent, Token, WDEV, MOONBASE_ADDRESSES, MOONRIVER_ADDRESSES, BSC_ADDRESSES} from 'zircon-sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { injected, talisman, walletconnect } from '../connectors'
// fortmatic, portis, walletconnect, walletlink, lattice
export const ROUTER_ADDRESS: { [key: string]: string } = {
  [ChainId.STANDALONE]: '0x1408886Cf200EB3d843796f6d4c8bD71497DAe67',
  [ChainId.MOONRIVER]: MOONRIVER_ADDRESSES.router,
  [ChainId.MOONBASE]: MOONBASE_ADDRESSES.router,
  [ChainId.MOONSHADOW]: MOONBASE_ADDRESSES.router,
  [ChainId.BSC]: BSC_ADDRESSES.router,
}
export const PYLON_ROUTER_ADDRESS: { [key: string]: string } = {
  [ChainId.STANDALONE]: '0x42e2EE7Ba8975c473157634Ac2AF4098190fc741',
  [ChainId.MOONRIVER]: MOONRIVER_ADDRESSES.pylonRouter,
  [ChainId.MOONBASE]: MOONBASE_ADDRESSES.pylonRouter,
  [ChainId.MOONSHADOW]: MOONBASE_ADDRESSES.pylonRouter,
  [ChainId.BSC]: BSC_ADDRESSES.pylonRouter,
}
// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 18, 'WBTC', 'Wrapped BTC')
export const SUSHI = new Token(ChainId.MAINNET, '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', 18, 'SUSHI', 'SushiToken')
export const YAM = new Token(ChainId.MAINNET, '0x0e2298E3B3390e3b945a5456fBf59eCc3f55DA16', 18, 'YAM', 'YAM')
export const RUNE = new Token(ChainId.MAINNET, '0x3155BA85D5F96b2d030a4966AF206230e46849cb', 18, 'RUNE', 'RUNE.ETH')
export const YFI = new Token(ChainId.MAINNET, '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', 18, 'YFI', 'Yearn')
export const CREAM = new Token(ChainId.MAINNET, '0x2ba592F78dB6436527729929AAf6c908497cB200', 18, 'CREAM', 'Cream')
export const BAC = new Token(ChainId.MAINNET, '0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a', 18, 'BAC', 'Basis Cash')
export const FXS = new Token(ChainId.MAINNET, '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 18, 'FXS', 'Frax Share')
export const CRV = new Token(
  ChainId.MAINNET,
  '0xD533a949740bb3306d119CC777fa900bA034cd52',
  18,
  'CRV',
  'Curve Dao Token'
)
export const ALPHA = new Token(ChainId.MAINNET, '0xa1faa113cbE53436Df28FF0aEe54275c13B40975', 18, 'ALPHA', 'AlphaToken')

const WDEV_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WDEV[ChainId.MAINNET]],
  [ChainId.STANDALONE]: [WDEV[ChainId.STANDALONE]],
  [ChainId.MOONRIVER]: [WDEV[ChainId.MOONRIVER]],
  [ChainId.MOONROCK]: [WDEV[ChainId.MOONROCK]],
  [ChainId.MOONBASE]: [WDEV[ChainId.MOONBASE]],
  [ChainId.MOONSHADOW]: [WDEV[ChainId.MOONSHADOW]],
  [ChainId.BSC]: [WDEV[ChainId.BSC]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WDEV_ONLY,
  [ChainId.MAINNET]: [
    ...WDEV_ONLY[ChainId.MAINNET],
    DAI,
    USDC,
    USDT,
    SUSHI,
    YAM,
    WBTC,
    RUNE,
    CREAM,
    BAC,
    FXS,
    CRV,
    ALPHA,
  ],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WDEV[ChainId.MAINNET]],
  },
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WDEV_ONLY,
  [ChainId.MOONBASE]: [...WDEV_ONLY[ChainId.MAINNET], DAI, USDC, USDT],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WDEV_ONLY,
  [ChainId.MOONBASE]: [
      new Token(ChainId.MOONBASE, '0x9959f8e45351f78abafbf46ae00e7a87e2b66023', 18, 'WETH', 'Wrapped Ether'),
      new Token(ChainId.MOONBASE, '0xed13b028697febd70f34cf9a9e280a8f1e98fd29', 18, 'NEPT', 'Neptune'),
      new Token(ChainId.MOONBASE, '0x4c945cd20dd13168bc87f30d55f12dc26512ca33', 18, 'PLUT', 'Pluto'),
      new Token(ChainId.MOONBASE, '0x08b40414525687731c23f430cebb424b332b3d35', 18, 'ERTH', 'Earth'),
      new Token(ChainId.MOONBASE, '0x1fc56b105c4f0a1a8038c2b429932b122f6b631f', 18, 'MARS', 'Mars'),
      new Token(ChainId.MOONBASE, '0x37822de108affdd5cdcfdaaa2e32756da284db85', 18, 'MERC', 'Mercury'),
      new Token(ChainId.MOONBASE, '0x9aac6fb41773af877a2be73c99897f3ddfacf576', 18, 'JUP', 'Jupiter'),
      new Token(ChainId.MOONBASE, '0xcdf746c5c86df2c2772d2d36e227b4c0203cba25', 18, 'VEN', 'Venus'),
      new Token(ChainId.MOONBASE, '0xd9224c102a73e5941abfcd645e08623dc4d182bc', 18, 'UNS', 'Uranus'),
      new Token(ChainId.MOONBASE, '0xe75f9ae61926ff1d27d16403c938b4cd15c756d5', 18, 'SAT', 'Saturn')
  ],
  [ChainId.MOONRIVER]: [
      new Token(ChainId.MOONRIVER, '0x4545E94974AdACb82FC56BCf136B07943e152055', 18, 'ZRG', 'Zircon Gamma'),
      new Token(ChainId.MOONRIVER, '0x98878b06940ae243284ca214f92bb71a2b032b8a', 18, 'MOVR', 'MoonRiver'),
      new Token(ChainId.MOONRIVER, '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', 6, 'USDC', 'USDC'),
      new Token(ChainId.MOONRIVER, '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C', 18, 'ETH', 'Ethereum'),
      new Token(ChainId.MOONRIVER, '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080', 18, 'KSM', 'Kusama'),
      new Token(ChainId.MOONRIVER, '0x6Ccf12B480A99C54b23647c995f4525D544A7E72', 18, 'LDO', 'Lido')
  ],
  [ChainId.BSC]: [
      new Token(ChainId.BSC, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 18, 'wBNB', 'Wrapped BNB'),
      new Token(ChainId.BSC, '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', 18, 'CAKE', 'PancakeSwap Token'),
  ]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin'),
    ],
    [USDC, USDT],
    [DAI, USDT],
  ],
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  /* INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },*/
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
  TALISMAN: {
    connector: talisman,
    name: 'Talisman',
    iconName: 'talisman.png',
    description: 'Connect using Talisman ETH',
    href: null,
    color: '#5E6E6E',
  }


  /*
  LATTICE: {
    connector: lattice,
    name: 'Lattice',
    iconName: 'gridPlusWallet.png',
    description: 'Connect to GridPlus Wallet.',
    href: null,
    color: '#40a9ff',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }*/,
}

export { default as  poolsConfig } from './pools'

export const FAST_INTERVAL = 10000
export const SLOW_INTERVAL = 60000

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much DEV so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 DEV
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))
