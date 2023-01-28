import {SerializedPoolConfig} from '../../constants/types'
import BigNumber from 'bignumber.js'
import {fetchGammas} from './fetchPublicPoolsData'
import { SerializedPool} from '../types'


const fetchPools = async (chainId: number, poolsToFetch: SerializedPoolConfig[]): Promise<SerializedPool[]> => {
    const gammas = await fetchGammas(chainId, poolsToFetch)

    return poolsToFetch.map((pool, index) => {
        const [gamma] = gammas[index]

        return {
            ...pool,
            gamma: new BigNumber(gamma).toJSON(),
        }
    })
}

export default fetchPools
