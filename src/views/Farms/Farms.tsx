import React, {
  // useEffect, useCallback,
  useState, useRef, createContext, useMemo,
} from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { RowType, Toggle, Text, Flex } from '@pancakeswap/uikit'
import styled, { useTheme } from 'styled-components'
import Page from '../../components/Layout/Page'
import { usePriceCakeBusd } from '../../state/farms/hooks'
import useIntersectionObserver from '../../hooks/useIntersectionObserver'
import { useTranslation } from 'react-i18next'
import {getBalanceNumber, getBalanceUSD} from '../../utils/formatBalance'
import { useIsDarkMode, useShowMobileSearchBarManager, useUserFarmsFilterAnchorFloat, useUserFarmsFilterPylonClassic, useUserFarmsFinishedOnly, useUserFarmStakedOnly, useUserFarmsViewMode } from '../../state/user/hooks'
import {
  FarmFilter,
  FarmFilterAnchorFloat,
  FarmFinishedOnly,
  ViewMode } from '../../state/user/actions'
import SearchInput from '../../components/SearchInput'
import Table from './components/FarmTable/FarmTable'
import { RowProps } from './components/FarmTable/Row'
import { DesktopColumnSchema,
  // FarmWithStakedValue
} from './components/types'
import { AnchorFloatTab, FarmTabButtons, PylonClassicTab, ViewModeTabs } from '../../components/FarmSelectTabs'
import FarmRepeatIcon from '../../components/FarmRepeatIcon'
import FarmsPage from '../../pages/Farm/'
import Select from '../../components/Select/Select'
import { useWindowDimensions } from '../../hooks'
import {usePools, usePoolsPageFetch } from '../../state/pools/hooks'
import { fetchPoolsUserDataAsync } from '../../state/pools'
import {DeserializedPool, EarningTokenInfo} from '../../state/types'
import orderBy from 'lodash/orderBy'
import { ButtonLighter } from '../../components/Button'

interface Props {
  earningRewardsBlock:  EarningTokenInfo[]
}

const FlexLayout = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 5px;
  & > * {
    min-width: 100%;
    @media (min-width: 700px) {
      min-width: 280px;
    }
    width: 24.3%;
    margin-right: 8px;
    margin-bottom: 8px;
  }
`

const ControlContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;

  justify-content: center;
  flex-direction: column;
  margin-bottom: 32px;
  max-width: 1280px;
  margin: auto;

  @media (min-width: 992px) {
    flex-direction: row;
    flex-wrap: wrap;
    margin-bottom: 0;
  }
  @media (min-width: 1100px) {
    justify-content: space-between;
  }
`

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
  }
`

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg1};
  border-radius: 17px 17px 22px 22px;
  padding: 5px;
  max-width: 1280px;
  margin: auto;
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  @media (min-width: 992px) {
    width: auto;
    padding: 0;
  }
`

const ViewControls = styled.div`
  flex-wrap: nowrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
  }

  @media (min-width: 992px) {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
`
const TableData = styled.td`
  width: 12%;
  position: relative;
`

export const PinkArrows = styled.div`
  svg {
    fill: ${({ theme }) => theme.meatPink};
    stroke: ${({ theme }) => theme.meatPink};
  }
`

export const SelectedOptionDiv = styled.div`
  position: absolute;
  top: 44px;
  left: -10px;
  width: 50%;
  background: ${({ theme }) => theme.meatPink};
  height: 5px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.modalBg};
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  h2 {
    color: ${({ theme }) => theme.text1};
    font-size: 18px;
    font-weight: 300;
  }
  div {
    border-bottom: none;
  }
  svg {
    fill: ${({ theme }) => theme.text1};
  }
`

const NUMBER_OF_POOLS_VISIBLE = 6

export const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

export const RewardPerBlock: React.FC<Props> = ({ earningRewardsBlock }) => {
  return(
    <>
    {earningRewardsBlock ? earningRewardsBlock.map((reward, index) => (
      <Text fontSize='13px' fontWeight={500} color={'#4e7455'} key={index}>
        {(reward.blockReward.toFixed(0) !== 'NaN' && reward.blockReward.toFixed(0) !== 'Infinity') ?
          `~ ${(reward.blockReward*6800*30).toFixed(0)}  ${reward.symbol === 'MOVR' ? 'wMOVR' : reward.symbol}` :
          'Loading...'
        }
      </Text>
    )):<Text fontSize='13px' fontWeight={500} color={'#4e7455'}>Loading...</Text>}
    </>
  )
}

const Farms: React.FC = ({ children }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { pools, userDataLoaded } = usePools()
  const cakePrice = usePriceCakeBusd()
  const [
    query,
    setQuery] = useState('')
  const [viewMode] = useUserFarmsViewMode()
  const [filter] = useUserFarmsFilterPylonClassic()
  const [filterAnchorFloat] = useUserFarmsFilterAnchorFloat()
  const [filtedFinishedOnly] = useUserFarmsFinishedOnly()
  const { account } = useWeb3React()
  const [sortOption, setSortOption] = useState('hot')
  const { observerRef,
    // isIntersecting
  } = useIntersectionObserver()
  const chosenFarmsLength = useRef(0)
  const { width } = useWindowDimensions()

  const isInactive = filtedFinishedOnly === FarmFinishedOnly.TRUE
  const isActive = !filtedFinishedOnly

  usePoolsPageFetch()
  if(account) {
    fetchPoolsUserDataAsync(account)
  }

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_POOLS_VISIBLE)

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !!account || (!!account && !userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly(isActive)

  let activeFarms = pools.filter((farm) => !farm.isFinished)
  let inactiveFarms = pools.filter((farm) => farm.isFinished)

  const stakedOnlyFarms = activeFarms.filter(
      (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).gt(0),
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist()
    setQuery(event.target.value)
  }


  const options = ['Earned', 'Staked', 'APR', 'Liquidity']
  const [showMobileSearchBar] = useShowMobileSearchBarManager()

  const sortPools = (sortOption: string, poolsToSort: DeserializedPool[]) => {
    switch (sortOption) {
      case 'earned':
        return orderBy(
            poolsToSort,
            (pool: DeserializedPool) => {
              if (!pool.userData || !pool.earningTokenInfo) {
                return 0
              }
              return pool.userData ? getBalanceUSD(new BigNumber(pool.userData.pendingReward), pool.earningTokenInfo?.map(t => t.currentPrice)) : 0
            },
            'desc',
        )
      case 'staked': {
        return orderBy(
            poolsToSort,
            (pool: DeserializedPool) => {
              if (!pool.userData || !pool.earningTokenInfo) {
                return 0
              }
              return pool.userData ? pool.userData.stakedBalance : 0
            },
            'desc',
        )
      }
      case 'liquidity':
        return orderBy(poolsToSort, (pool: DeserializedPool) => Math.floor(pool.liquidity) ?? 0, 'desc')
      case 'apr':
        return orderBy(poolsToSort, (pool: DeserializedPool) => Math.floor(pool.apr) ?? 0, 'desc')
      case 'latest':
        return orderBy(poolsToSort, (pool: DeserializedPool) => Number(pool.sousId), 'desc')
      default:
        return poolsToSort
    }
  }

  let chosenPools = activeFarms

  chosenPools = useMemo(() => {
    let sortedPools = sortPools(sortOption, chosenPools).slice(0, numberOfFarmsVisible)
    if (stakedOnly) {
      sortedPools = stakedOnlyFarms
    }
    // else {
    //   sortedPools = activeFarms
    // }
    if (query) {
      const lowercaseQuery = query.toLowerCase()
      sortedPools = sortedPools.filter((pool) =>
          pool.token1.symbol.toLowerCase().includes(lowercaseQuery) ||
          pool.token2.symbol.toLowerCase().includes(lowercaseQuery))
    }

    if (isInactive) {
      sortedPools = inactiveFarms
    }

    sortedPools =
        filterAnchorFloat === FarmFilterAnchorFloat.ANCHOR ?
            sortedPools.filter((pool) => pool.isAnchor === true).slice(0, numberOfFarmsVisible) :
            filterAnchorFloat === FarmFilterAnchorFloat.FLOAT ?
                sortedPools.filter((pool) => !pool.isAnchor === true).slice(0, numberOfFarmsVisible) :
                sortedPools

    sortedPools =
        filter === FarmFilter.CLASSIC ?
            sortedPools.filter((pool) => pool.isClassic === true) :
            sortedPools.filter((pool) => !pool.isClassic === true)

    return sortedPools
  }, [query, stakedOnly, stakedOnlyFarms, chosenPools, sortOption, filterAnchorFloat, filter, numberOfFarmsVisible, isInactive])

  chosenFarmsLength.current = activeFarms.length

  const totalEarnings = useMemo(() => {
    return stakedOnlyFarms.reduce((accum, pool) => {
      if (!pool.userData || !pool.earningTokenInfo) {
        return accum
      }
      return accum.plus(getBalanceUSD(new BigNumber(pool.userData.pendingReward), pool.earningTokenInfo?.map(t => t.currentPrice)))
    }, new BigNumber(0))
  }, [stakedOnlyFarms])

  const totalStaked = useMemo(() => {
    return stakedOnlyFarms.reduce((accum, pool) => {
      if (!pool.userData || !pool.earningTokenInfo) {
        return accum
      }
      return accum.plus(new BigNumber(pool.userData.stakedBalance).div(pool.stakedBalancePool).multipliedBy(pool.staked).multipliedBy(pool.quotingPrice))
    }, new BigNumber(0))
  }, [stakedOnlyFarms])

  const rowData = chosenPools.map((farm) => {
    const { token1, token2 } = farm
    const tokenAddress = token1.address
    const quoteTokenAddress = token2.address
    const lpLabel = `${farm.token1.symbol}-${farm.token2.symbol}`

    const row: RowProps = {
      apr: {
        value: Math.floor(farm.apr).toString(),
        // getDisplayApr(farm.apr, farm.lpRewardsApr),
        pid: farm.sousId,
        lpLabel,
        lpSymbol: farm.contractAddress,
        tokenAddress,
        quoteTokenAddress,
        cakePrice,
        originalValue: 1,
      },
      farm: {
        earningToken: farm.earningToken,
        label: lpLabel,
        pid: farm.sousId,
        token: farm.token1,
        quoteToken: farm.token2,
        isAnchor: farm.isAnchor,
        isClassic: farm.isClassic,
        isFinished: farm.isFinished,
        // This will be the function to get the health of the farm
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.pendingReward)),
        earningsUSD: getBalanceUSD(new BigNumber(farm.userData.pendingReward), farm.earningTokenInfo?.map(t => t.currentPrice)),
        pid: farm.sousId,
        hovered: false,
        setHovered: () => {},
      },
      liquidity: {
        liquidity: BigNumber(farm.liquidity),
        hovered: false,
        setHovered: () => {},
        farm: farm,
      },
      staked: {
        stakedBalance: farm.staked,
        staked: farm.userData.stakedBalance ,
        stakedBalancePool: farm.stakedBalancePool,
        price: farm.quotingPrice,
        hovered: false,
        setHovered: () => {},
      },
      details: farm,
    }
    return row
  })

  const showMore = () => {
    setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
      if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
        return farmsCurrentlyVisible + NUMBER_OF_POOLS_VISIBLE
      }
      return farmsCurrentlyVisible
    })
  }

  const renderContent = (): JSX.Element => {
    if (viewMode === ViewMode.TABLE && rowData.length) {
      const columnSchema = DesktopColumnSchema

      const columns = columnSchema.map((column) => ({
        id: column.id,
        name: column.name,
        label: column.label,
        sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
          switch (column.name) {
            case 'farm':
              return b.id - a.id
            case 'apr':
              if (a.original.apr.value && b.original.apr.value) {
                return Number(a.original.apr.value) - Number(b.original.apr.value)
              }
              return 0
            case 'earned':
              return a.original.earned.earnings - b.original.earned.earnings
              // case 'liquidity':
              //   if (a.original.liquidity.value && b.original.liquidity.) {
              //     return Number(a.original.liquidity.value) - Number(b.original.liquidity.value)
              //   }
              //   return 0
            default:
              return 1
          }
        },
        sortable: column.sortable,
      }))
      return <Table data={rowData} columns={columns} userDataReady={userDataReady} />
    }
    return <FlexLayout><FarmsPage /></FlexLayout>
  }
  const darkMode = useIsDarkMode()
  const [hoverButton, setHoverButton] = useState(false)
  activeFarms = chosenPools
  return (
    <FarmsContext.Provider value={{ activeFarms }}>
      <Page>
        <Text
          color={theme.text1}
          fontWeight={300}
          fontSize={"30px"}
          style={{
            textAlign: "center",
            alignSelf: "center",
            marginBottom: width >= 700 ? "30px" : "20px",
          }}
        >
          {"Farms"}
        </Text>
        <ControlContainer>
          <Flex m={"0px"}>
            <PylonClassicTab active={filter} />
            <AnchorFloatTab active={filterAnchorFloat} />
          </Flex>
          <Flex
            position={"relative"}
            width={
              width < 500 ? (showMobileSearchBar ? "100%" : "auto") : "auto"
            }
            height={"70px"}
          >
            {(!showMobileSearchBar || width > 500) && (
              <ViewControls>
                <ToggleWrapper
                  style={{ marginRight: "10px", position: "relative" }}
                >
                  <Text
                    style={{ marginLeft: -10 }}
                    fontSize="13px"
                    color={theme.text1}
                    mr={"10px"}
                    width={"max-content"}
                    letterSpacing={"0.05em"}
                  >
                    {" "}
                    {width > 700 ? "SHOW ONLY MINE" : "SHOW ONLY MINE"}
                  </Text>
                  <Toggle
                    id="staked-only-farms"
                    checked={stakedOnly}
                    checkedColor={"dropdownDeep"}
                    defaultColor={"dropdownDeep"}
                    onChange={() => setStakedOnly(!stakedOnly)}
                    scale="sm"
                  />
                </ToggleWrapper>
                <FarmTabButtons active='Active' />
              </ViewControls>
            )}
            <FilterContainer>
              <LabelWrapper
                style={{
                  marginLeft: showMobileSearchBar ? 0 : 10,
                  width: "100%",
                }}
              >
                <SearchInput
                  onChange={handleChangeQuery}
                  placeholder="SEARCH FARMS"
                />
              </LabelWrapper>
            </FilterContainer>
          </Flex>
        </ControlContainer>
        <MainContainer>
          <table
            style={{
              width: "100%",
              borderBottom: `1px solid ${theme.opacitySmall}`,
              paddingBottom: "5px",
            }}
          >
            <tr
              style={
                viewMode === ViewMode.CARD ||
                (viewMode === ViewMode.TABLE && width <= 992)
                  ? {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }
                  : null
              }
            >
              <TableData style={{ minWidth: width >= 600 ? "275px" : "auto" }}>
                <ViewModeTabs active={viewMode} />
              </TableData>
              {viewMode === ViewMode.TABLE && width > 992 ? (
                options.map((option) => (
                  <TableData
                    key={option}
                    style={{
                      cursor:
                        "pointer",
                    }}
                    onClick={() => {
                        sortOption === option.toLowerCase()
                          ? setSortOption("hot")
                          : setSortOption(option.toLowerCase());
                    }}
                  >
                    <PinkArrows
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          color: !darkMode ? theme.text1 : theme.meatPink,
                          fontWeight: 500,
                          margin: 0,
                        }}
                      >
                        {option}
                      </p>
                        <FarmRepeatIcon />
                    </PinkArrows>
                    {sortOption === option.toLowerCase() ? (
                      <SelectedOptionDiv />
                    ) : null}
                    {(option === 'Earned' && totalEarnings.toFixed(0) !== '0') && (
                      <Flex alignItems="center">
                        <Text fontSize="12px" color={'#5ebe7b'}>
                          ~{totalEarnings ? totalEarnings.toFixed(2) : 0} USD
                        </Text>
                      </Flex>
                    )}
                    {(option === 'Staked' && totalStaked.toFixed(0) !== '0') && (
                      <Flex alignItems="center">
                        <Text fontSize="12px" color={'#5ebe7b'}>
                          ~{totalStaked ? totalStaked.toFixed(2) : 0} USD
                        </Text>
                      </Flex>
                    )}
                  </TableData>
                ))
              ) : (
                <TableData
                  style={{
                    display: "flex",
                    width: "200px",
                    paddingRight: width <= 992 ? "0px" : "5px",
                  }}
                >
                  <Text
                    style={{ width: "100px", alignSelf: "center" }}
                    color={theme.whiteHalf}
                    fontSize={"15px"}
                  >
                    {t("Sort by")}
                  </Text>
                  <Select
                    options={[
                      {
                        label: t("Hot"),
                        value: "hot",
                      },
                      {
                        label: t("APR"),
                        value: "apr",
                      },
                      {
                        label: t("Earned"),
                        value: "earned",
                      },
                      {
                        label: t("Staked"),
                        value: "staked",
                      },
                    ]}
                    onOptionChange={(option) => setSortOption(option.value)}
                  />
                </TableData>
              )}
              {viewMode === ViewMode.TABLE && width > 992 && (
                <TableData style={{ width: "15%" }} />
              )}
            </tr>
          </table>
          {renderContent()}
          {((chosenPools.length < pools.length && chosenPools.length === numberOfFarmsVisible) ||
          (filterAnchorFloat === FarmFilterAnchorFloat.ANCHOR && pools.filter((pool) => stakedOnly ?
          (pool.isAnchor && pool.userData.stakedBalance.gt(0)) : pool.isAnchor).length > chosenPools.length && chosenPools.length === (numberOfFarmsVisible/2)) ||
          (filterAnchorFloat === FarmFilterAnchorFloat.FLOAT && pools.filter((pool) =>  stakedOnly ?
          (!pool.isAnchor && pool.userData.stakedBalance.gt(0)) : !pool.isAnchor).length > chosenPools.length && chosenPools.length === (numberOfFarmsVisible/2))
          ) && (
            <ButtonLighter
              onClick={() => showMore()}
              onMouseEnter={() => setHoverButton(true)}
              onMouseLeave={() => setHoverButton(false)}
              style={{
                background: theme.darkMode ? hoverButton ? "transparent" : '#3E212D' : hoverButton ? "transparent" : '#EDEAEA',
                borderRadius: "0px",
                margin: "auto",
                marginTop: "20px",
                fontSize: "16px",
                border: 'none',
                width: 'calc(100% + 10px)',
                position: "relative",
                right: '5px',
                marginBottom: '-5px',
                borderBottomLeftRadius: '17px',
                borderBottomRightRadius: '17px',
                color: theme.pinkBrown
              }}
            >
              {t("Show More")}
            </ButtonLighter>
          )}
        </MainContainer>
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center"></Flex>
        )}
        <div ref={observerRef} />
      </Page>
    </FarmsContext.Provider>
  );
}

export const FarmsContext = createContext({ activeFarms: [] })

export default Farms
