const getNodeUrl = (chainId: number) => {
  return chainId === 56 ? 'https://bsc-dataseed.binance.org' : chainId === 1287 ? 
  'https://moonbase-alpha.public.blastapi.io' :
   'https://moonriver.public.blastapi.io'
}

export default getNodeUrl
