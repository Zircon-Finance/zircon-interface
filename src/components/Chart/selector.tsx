import get from 'lodash/get'
import { AppState } from '../../state'

type pairByDataIdSelectorParams = {
  pairId: string
  timeWindow: any
}

export const pairByDataIdSelector =
  ({ pairId, timeWindow }: pairByDataIdSelectorParams) =>
  (state: AppState) =>
    get(state, ['swap', 'pairDataById', pairId, timeWindow])

export const derivedPairByDataIdSelector =
  ({ pairId, timeWindow }: pairByDataIdSelectorParams) =>
  (state: AppState) =>
    get(state, ['swap', 'derivedPairDataById', pairId, timeWindow])
