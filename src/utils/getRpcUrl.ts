const getNodeUrl = (chainId: number) => {
  return chainId === 1285 ? 'https://moonriver.public.blastapi.io' : chainId === 1287 ? 
  'https://moonbase-alpha.public.blastapi.io' : 
  'https://bsc-dataseed.binance.org'
}

export default getNodeUrl
