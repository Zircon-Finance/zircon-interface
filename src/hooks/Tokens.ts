import { parseBytes32String } from '@ethersproject/strings'
import { Currency, Token, currencyEquals, NATIVE_TOKEN } from 'diffuse-sdk'
import { useEffect, useMemo, useState } from 'react'
import { useSelectedTokenList } from '../state/lists/hooks'
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks'
import { useUserAddedTokens } from '../state/user/hooks'
import { isAddress } from '../utils'
import axios from 'axios'
import { useActiveWeb3React } from './index'
import { useBytes32TokenContract, useTokenContract } from './useContract'
const dayjs =  require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(utc)
dayjs.extend(timezone)

export const useSubgraphUrl = () => {
  const [subgraphUrl, setSubgraphUrl] = useState('')
  const {chainId} = useActiveWeb3React()
  useEffect(() => {
    if (chainId === 56) {
      setSubgraphUrl('https://api.thegraph.com/subgraphs/name/reshyresh/zi')
    } else if (chainId === 421613) {
      setSubgraphUrl('https://api.thegraph.com/subgraphs/name/reshyresh/diffuse-alpha')
    }},[chainId])
  return subgraphUrl
}

export const useBlocksSubgraphUrl = () => {
  const [blockSubgraphUrl, setBlockSubgraphUrl] = useState('')
  const {chainId} = useActiveWeb3React()
  useEffect(() => {
    if (chainId === 56) {
      setBlockSubgraphUrl('https://api.thegraph.com/subgraphs/name/astroswap/bscblocks')
    } else if (chainId === 1285) {
      setBlockSubgraphUrl('https://api.thegraph.com/subgraphs/name/rebase-agency/moonriver-blocks')
    }},[chainId])
  return blockSubgraphUrl
}

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React()
  const userAddedTokens = useUserAddedTokens()
  const allTokens = useSelectedTokenList()

  return useMemo(() => {
    if (!chainId) return {}
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token
            return tokenMap
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...allTokens[chainId] }
        )
    )
  }, [chainId, userAddedTokens, allTokens])
}

export function useApiTokens(): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React()
  const [tokensData, setTokensData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(`https://edgeapi.diffuse.finance/static/monitoring/${chainId}`);
      const data = await result.json();
      setTokensData(data?.tokens);
    };
    fetchData();
  }, [chainId]);

  return useMemo(() => {
    if (!chainId) return {}
    return (
      tokensData?.map(token => {
        return new Token(
          chainId,
          token.address,
          token.decimals,
          token.symbol,
        )
      })
    )
  }, [chainId, tokensData])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency): boolean {
  const userAddedTokens = useUserAddedTokens()
  return !!userAddedTokens.find(token => currencyEquals(currency, token))
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/
function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const { chainId } = useActiveWeb3React()
  const tokens = useAllTokens()

  const address = isAddress(tokenAddress)

  const tokenContract = useTokenContract(address ? address : undefined, false)
  const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false)
  const token: Token | undefined = address ? tokens[address] : undefined

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD
  )
  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)
  const symbolBytes32 = useSingleCallResult(token ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (decimals.loading || symbol.loading || tokenName.loading) return null
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token')
      )
    }
    return undefined
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result
  ])
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const {chainId} = useActiveWeb3React()
  const isETH = currencyId?.toUpperCase() === NATIVE_TOKEN[chainId].symbol
  const token = useToken(isETH ? undefined : currencyId)
  return isETH ? NATIVE_TOKEN[chainId] : token
}

export async function getBlockFromTimestamp(timestamp, subgraphUrl) {
  const blockQuery = `{
    blocks(first: 1, orderBy: timestamp, orderDirection: asc, where: {timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp + 600}}) {
      id
      number
      timestamp
    }
  }
  `
  let query = await axios.post(subgraphUrl, JSON.stringify({
      query: blockQuery, 
      variables: null,
      operationName: undefined} 
      ), ).then(
    res => (console.log('res', res?.data?.data?.blocks[0]?.number),res?.data?.data?.blocks[0]?.number))
  return query
}

export async function getTopTokens(chainId: number, subgraphUrl: string, blockSubgraphUrl: string) {
  const utcOneDayBack = dayjs().tz('GMT').subtract(1, 'day').startOf('minute').unix()
  const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, blockSubgraphUrl)
  const currentBlock = await getBlockFromTimestamp(dayjs().tz('GMT').subtract(1, 'minute').startOf('minute').unix(), blockSubgraphUrl)

  let currentQuery = `{
    tokens(first: 6, block: {number: ${currentBlock}}, where: {tradeVolumeUSD_gt: "100"}) {
    id
    name
    derivedETH
    untrackedVolumeUSD
    txCount
    totalLiquidity
    tradeVolumeUSD
    tradeVolume
    symbol
  }
  }`

  let oneDayAgoQuery = `{
    tokens(first: 6, block: {number: ${oneDayBlock}}, where: {tradeVolumeUSD_gt: "100"}) {
      id
      name
      derivedETH
      untrackedVolumeUSD
      txCount
      totalLiquidity
      tradeVolumeUSD
      tradeVolume
      symbol
    }
  }`

  let derivedEthQuery = `{
    bundles(first: 1, orderBy: id, orderDirection: desc, block: {number: ${currentBlock}}) {
      ethPrice
    }
  }
  `

  let oneDayAgoDerivedEthQuery = `{
    bundles(first: 1, orderBy: id, orderDirection: desc, block: {number: ${oneDayBlock}}) {
      ethPrice
    }
  }
  `

  let derivedEthQueryData = await axios.post(subgraphUrl, JSON.stringify({query: derivedEthQuery, variables: null, operationName: undefined} ), ).then(
    res => res?.data?.data?.bundles[0]?.ethPrice)

  let oneDayAgoDerivedEthQueryData = await axios.post(subgraphUrl, JSON.stringify({query: oneDayAgoDerivedEthQuery, variables: null, operationName: undefined} ), ).then(
    res => res?.data?.data?.bundles[0]?.ethPrice)

  let query = await axios.post(subgraphUrl, JSON.stringify({query: currentQuery, variables: null, operationName: undefined} ), ).then(
    res => res?.data?.data?.tokens)
  let oneDayAgoQueryData = await axios.post(subgraphUrl, JSON.stringify({query: oneDayAgoQuery, variables: null, operationName: undefined} ), ).then(
    res => res?.data?.data?.tokens)

  return {query, oneDayAgoQueryData, derivedEthQueryData, oneDayAgoDerivedEthQueryData}
}
