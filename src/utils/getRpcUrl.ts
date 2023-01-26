const getNodeUrl = (chainId: number) => {
  return chainId === 56 ? 'https://bsc-dataseed.binance.org' : chainId === 1287 ? 
  'https://moonbase-alpha.public.blastapi.io' : chainId === 1285 ?
   'https://moonriver.public.blastapi.io' : 'https://bsc-testnet.public.blastapi.io'
}

export default getNodeUrl
