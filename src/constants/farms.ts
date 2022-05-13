import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'
import { NETWORK_CHAIN_ID } from '../connectors'

const serializedTokens = serializeTokens()

const farms: SerializedFarmConfig[] = [
  /**
   * These 3 farms (PID 0, 251, 252) should always be at the top of the file.
   */
  {
    pid: 0,
    lpSymbol: 'CAKE',
    lpAddresses: {
      97: '0x9C21123D94b93361a29B2C2EFB3d5CD8B17e0A9e',
      56: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    },
    token: serializedTokens.syrup,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 251,
    lpSymbol: 'CAKE-BNB LP',
    lpAddresses: {
      97: '0x3ed8936cAFDF85cfDBa29Fbe5940A5b0524824F4',
      56: '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0',
    },
    token: serializedTokens.cake,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 252,
    lpSymbol: 'BUSD-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    },
    token: serializedTokens.busd,
    quoteToken: serializedTokens.wbnb,
  },
  /**
   * V3 by order of release (some may be out of PID order due to multiplier boost)
   */
  {
    pid: 386,
    lpSymbol: 'HOTCROSS-BNB LP',
    lpAddresses: {
      97: '',
      56: '0xf23bad605e94de0e3b60c9718a43a94a5af43915',
    },
    token: serializedTokens.hotcross,
    quoteToken: serializedTokens.wbnb,
    isCommunity: true,
  },
  {
    pid: 446,
    lpSymbol: 'BMON-BUSD LP',
    lpAddresses: {
      97: '',
      56: '0x00e53C169dA54a7E11172aEEDf8Eb87F060F479e',
    },
    token: serializedTokens.bmon,
    quoteToken: serializedTokens.busd,
    isCommunity: true,
  },
  {
    pid: 438,
    lpSymbol: 'WSG-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x37Ff7D4459ad96E0B01275E5efffe091f33c2CAD',
    },
    token: serializedTokens.wsg,
    quoteToken: serializedTokens.wbnb,
    isCommunity: true,
  },
  {
    pid: 466,
    lpSymbol: 'DKT-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x365c3F921b2915a480308D0b1C04aEF7B99c2876',
    },
    token: serializedTokens.dkt,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 432,
    lpSymbol: 'SPS-BNB LP',
    lpAddresses: {
      97: '',
      56: '0xfdfde3af740a22648b9dd66d05698e5095940850',
    },
    token: serializedTokens.sps,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 461,
    lpSymbol: 'BETA-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x88a02d94f437799f06f8c256ff07aa397e6d0016',
    },
    token: serializedTokens.beta,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 458,
    lpSymbol: 'PROS-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x109cBFfE72C02F26536Ff8b92278Dfd3610dE656',
    },
    token: serializedTokens.pros,
    quoteToken: serializedTokens.wbnb,
    isCommunity: true,
  },
  {
    pid: 457,
    lpSymbol: 'NFT-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x0ecc84c9629317a494f12bc56aa2522475bf32e8',
    },
    token: serializedTokens.nft,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 429,
    lpSymbol: 'CHESS-USDC LP',
    lpAddresses: {
      97: '',
      56: '0x1472976e0b97f5b2fc93f1fff14e2b5c4447b64f',
    },
    token: serializedTokens.chess,
    quoteToken: serializedTokens.usdc,
  },
  {
    pid: 439,
    lpSymbol: 'MCRN-BNB LP',
    lpAddresses: {
      97: '',
      56: '0xe8D5d81dac092Ae61d097f84EFE230759BF2e522',
    },
    token: serializedTokens.mcrn,
    quoteToken: serializedTokens.wbnb,
    isCommunity: true,
  },
  {
    pid: 456,
    lpSymbol: 'TLOS-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x3eDb06e2d182d133864fe7C0f9B4C204bBf61D4E',
    },
    token: serializedTokens.tlos,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 455,
    lpSymbol: 'HERO-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x5d937c3966002cbD9d32c890a59439b4b300a14d',
    },
    token: serializedTokens.stephero,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 454,
    lpSymbol: 'BSCDEFI-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x5B0A3b98C2f01741A11E57A9d0595B254E62F9F2',
    },
    token: serializedTokens.bscdefi,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 453,
    lpSymbol: 'QBT-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x67EFeF66A55c4562144B9AcfCFbc62F9E4269b3e',
    },
    token: serializedTokens.qbt,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 451,
    lpSymbol: 'PHA-BUSD LP',
    lpAddresses: {
      97: '',
      56: '0x4ddd56e2f34338839BB5953515833950eA680aFb',
    },
    token: serializedTokens.pha,
    quoteToken: serializedTokens.busd,
  },
  {
    pid: 314,
    lpSymbol: 'BEL-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x69DEE989c30b5fFe40867f5FC14F00E4bCE7B681',
    },
    token: serializedTokens.bel,
    quoteToken: serializedTokens.wbnb,
  },
  {
    pid: 317,
    lpSymbol: 'RAMP-BUSD LP',
    lpAddresses: {
      97: '',
      56: '0xE834bf723f5bDff34a5D1129F3c31Ea4787Bc76a',
    },
    token: serializedTokens.ramp,
    quoteToken: serializedTokens.busd,
  },
  {
    pid: 436,
    lpSymbol: 'BABYCAKE-BNB LP',
    lpAddresses: {
      97: '',
      56: '0xb5e33fE13a821e55ED33C884589a804B1b4F6fD8',
    },
    token: serializedTokens.babycake,
    quoteToken: serializedTokens.wbnb,
    isCommunity: true,
  },
  {
    pid: 440,
    lpSymbol: 'HERO-BNB LP',
    lpAddresses: {
      97: '',
      56: '0xe267018C943E77992e7e515724B07b9CE7938124',
    },
    token: serializedTokens.hero,
    quoteToken: serializedTokens.wbnb,
    isCommunity: true,
  },
  {
    pid: 435,
    lpSymbol: 'REVV-BNB LP',
    lpAddresses: {
      97: '',
      56: '0x1cc18962b919ef90085a8b21f8ddc95824fbad9e',
    },
    token: serializedTokens.revv,
    quoteToken: serializedTokens.wbnb,
  },
].filter((f) => !!f.lpAddresses[NETWORK_CHAIN_ID])

export default farms
