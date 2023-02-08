import { parseBytes32String } from '@ethersproject/strings'
import { Currency, Token, currencyEquals, NATIVE_TOKEN } from 'zircon-sdk'
import { useMemo } from 'react'
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

const GAMMA_SUBGRAPH_URI = 'https://api.thegraph.com/subgraphs/name/reshyresh/zircon-gamma'
const BSC_SUBGRAPH_URI = 'https://api.thegraph.com/subgraphs/name/reshyresh/zi'

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

export async function getTopTokens(chainId: number) {
  let unix = dayjs().tz('GMT').subtract(1, 'day').startOf('day').unix()
  let currentQuery = `{
    tokenDayDatas(
      first: 20
      orderBy: id
      orderDirection: desc
      where: {dailyVolumeUSD_gt: "100", date: ${dayjs().tz('GMT').startOf('day').unix()}}
    ) {
      token {
        id
        name
        symbol
        decimals
      }
      priceUSD
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }`

  let oneDayAgoQuery = `{
    tokenDayDatas(
      first: 20
      orderBy: id
      orderDirection: desc
      where: {dailyVolumeUSD_gt: "100", date: ${unix}}
    ) {
      token {
        id
        name
        symbol
        decimals
      }
      priceUSD
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }`

  let query = await axios.post(chainId === 1285 ? GAMMA_SUBGRAPH_URI : BSC_SUBGRAPH_URI, JSON.stringify({query: currentQuery, variables: null, operationName: undefined} ), ).then(
    res => res.data.data.tokenDayDatas)
  let oneDayAgoQueryData = await axios.post(chainId === 1285 ? GAMMA_SUBGRAPH_URI : BSC_SUBGRAPH_URI, JSON.stringify({query: oneDayAgoQuery, variables: null, operationName: undefined} ), ).then(
    res => res.data.data.tokenDayDatas)

  return {query, oneDayAgoQueryData}
}
