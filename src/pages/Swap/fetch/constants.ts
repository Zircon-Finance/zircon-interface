import { PairDataTimeWindowEnum } from '../types'

// Specifies the amount of data points to query for specific time window
export const timeWindowIdsCountMapping: Record<PairDataTimeWindowEnum, number> = {
  [PairDataTimeWindowEnum.DAY]: 24,
  [PairDataTimeWindowEnum.WEEK]: 28,
  [PairDataTimeWindowEnum.MONTH]: 30,
  [PairDataTimeWindowEnum.YEAR]: 24,
}

// How many StreamingFast ids to skip when querying the data
export const timeWindowGapMapping: Record<PairDataTimeWindowEnum, number | null> = {
  [PairDataTimeWindowEnum.DAY]: null,
  [PairDataTimeWindowEnum.WEEK]: 6, // Each datapoint 6 hours apart
  [PairDataTimeWindowEnum.MONTH]: 1, // Each datapoint 1 day apart
  [PairDataTimeWindowEnum.YEAR]: 15, // Each datapoint 15 days apart
}

export const MINIMUM_SEARCH_CHARACTERS = 2

export const WEEKS_IN_YEAR = 52.1429

export const TOTAL_FEE = 0.0025
export const LP_HOLDERS_FEE = 0.0017
export const TREASURY_FEE = 0.0003
export const BUYBACK_FEE = 0.0005

export const PCS_V2_START = 1619136000 // April 23, 2021, 12:00:00 AM
export const ONE_DAY_UNIX = 86400 // 24h * 60m * 60s
export const ONE_HOUR_SECONDS = 3600

export const ITEMS_PER_INFO_TABLE_PAGE = 10