const getNodeUrl = (chainId: number) => {
  return chainId === 56 ? 'https://bsc-dataseed.binance.org' : chainId === 1287 ? 
  'https://moonbase-alpha.public.blastapi.io' : chainId === 1285 ?
   'https://moonriver.public.blastapi.io' : chainId === 97 ? 
   'https://bsc-testnet.public.blastapi.io' : chainId === 42161 
   ? 'https://arbitrum.blockpi.network/v1/rpc/public' : 
   'https://goerli-rollup.arbitrum.io/rpc/'
}

export default getNodeUrl
