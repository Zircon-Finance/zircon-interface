const getNodeUrl = (chainId: number) => {
  return chainId === 56 ? 'https://bsc-dataseed.binance.org' : chainId === 1287 ? 
  'https://moonbase-alpha.public.blastapi.io' : chainId === 1285 ?
   'https://moonriver.public.blastapi.io' : chainId === 97 ? 'https://bsc-testnet.public.blastapi.io' : 'https://endpoints.omniatech.io/v1/arbitrum/goerli/public'
}

export default getNodeUrl
