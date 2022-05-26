import { ChainId } from 'zircon-sdk'
import { NETWORK_CHAIN_ID } from '../connectors'
// import getLpAddress from 'utils/getLpAddress'
import tokens from './tokens'
import { FarmAuctionBidderConfig } from './types'

export const whitelistedBidders: FarmAuctionBidderConfig[] =
  Number(NETWORK_CHAIN_ID) === ChainId.MAINNET
    ? [
        {
          account: '0xdE78F42bff7EDF1e70450e7BCFd8aBCF94e3a65e',
          farmName: 'TINC-BNB',
          tokenAddress: '0x05ad6e30a855be07afa57e08a4f30d00810a402e',
          quoteToken: tokens.wbnb,
          tokenName: 'Tiny World',
          projectSite: 'https://tinyworlds.io/',
        },
      ].map((bidderConfig) => ({
        ...bidderConfig,
        lpAddress: 'placeholder',
      }))
    : []

const UNKNOWN_BIDDER: FarmAuctionBidderConfig = {
  account: '',
  tokenAddress: '',
  quoteToken: tokens.wbnb,
  farmName: 'Unknown',
  tokenName: 'Unknown',
}

export const getBidderInfo = (account: string): FarmAuctionBidderConfig => {
  const matchingBidder = whitelistedBidders.find((bidder) => bidder.account.toLowerCase() === account.toLowerCase())
  if (matchingBidder) {
    return matchingBidder
  }
  return { ...UNKNOWN_BIDDER, account }
}
