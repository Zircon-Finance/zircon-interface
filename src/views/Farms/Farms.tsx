import React, { 
  // useEffect, useCallback, 
  useState, useRef, createContext } from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { RowType, Toggle, Text, Flex } from '@pancakeswap/uikit'
// import { ChainId } from 'zircon-sdk'
// import { NextLinkFromReactRouter } from 'components/NextLink'
import styled, { useTheme } from 'styled-components'
import Page from '../../components/Layout/Page'
import { usePriceCakeBusd } from '../../state/farms/hooks'
import useIntersectionObserver from '../../hooks/useIntersectionObserver'
// import { DeserializedFarm } from '../../state/types'
import { useTranslation } from 'react-i18next'
import { getBalanceNumber } from '../../utils/formatBalance'
// import { getFarmApr } from '../../utils/apr'
// import isArchivedPid from '../../utils/farmHelpers'
// import { latinise } from '../../utils/latinise'
import { useIsDarkMode, useShowMobileSearchBarManager, useUserFarmsFilterAnchorFloat, useUserFarmsFilterPylonClassic, useUserFarmStakedOnly, useUserFarmsViewMode } from '../../state/user/hooks'
import { 
  // FarmFilterAnchorFloat, 
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
import { usePools, usePoolsPageFetch } from '../../state/pools/hooks'
import { fetchPoolsUserDataAsync } from '../../state/pools'

const Loading = styled.div`
  border: 8px solid #f3f3f3;
  border-radius: 50%;
  border-top: 8px solid #ddd;
  border-bottom: 8px solid #ddd;
  width: 20px;
  height: 20px;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`


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
  border-radius: 17px;
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

const PinkArrows = styled.div`
 svg {
    fill: ${({ theme }) => theme.meatPink};
    stroke: ${({ theme }) => theme.meatPink};
 }
 `

const SelectedOptionDiv = styled.div`
  position: absolute;
  top: 54px;
  width: 50%;
  background: ${({ theme }) => theme.cardExpanded};
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
    fill: #fff;
  }
`

// const NUMBER_OF_FARMS_VISIBLE = 12

export const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

const Farms: React.FC = ({ children }) => {
  const { pathname } = window.location
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
  const { account } = useWeb3React()
  const [sortOption, setSortOption] = useState('hot')
  const { observerRef, 
    // isIntersecting 
  } = useIntersectionObserver()
  const chosenFarmsLength = useRef(0)
  const { width } = useWindowDimensions()

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived

  usePoolsPageFetch()
  if(account) {
    fetchPoolsUserDataAsync(account)
  }

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !!account || (!!account && !userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly(isActive)

  const activeFarms = pools
  // .filter(
  //   (farm) =>
  //     farm.pid !== 0 && farm.multiplier !== '0X' && !isArchivedPid(farm.pid) && (!poolLength || poolLength > farm.pid),
  // )
  // const inactiveFarms = pools.filter((farm) => farm.sousId !== 0 && !isArchivedPid(farm.sousId))
  // const archivedFarms = pools.filter((farm) => isArchivedPid(farm.sousId))

  // const stakedOnlyFarms = activeFarms.filter(
  //   (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  // )

  // const stakedInactiveFarms = activeFarms.filter(
  //   (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  // )

  // const stakedArchivedFarms = activeFarms.filter(
  //   (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  // )

  // const farmsList = useCallback(
  //   (farmsToDisplay: DeserializedFarm[]): FarmWithStakedValue[] => {
  //     let farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
  //       if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) {
  //         return farm
  //       }
  //       const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken)
  //       // const totalLiquidity = new BigNumber(Math.floor(Math.random() * (10000 - 100 + 1)) + 100)
  //       const { cakeRewardsApr, lpRewardsApr } = isActive
  //         ? getFarmApr(new BigNumber(farm.poolWeight), cakePrice, totalLiquidity, farm.lpAddress[ChainId.MOONBASE])
  //         : { cakeRewardsApr: 0, lpRewardsApr: 0 }

  //       return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
  //     })

  //     farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm) => {
  //       return (filterAnchorFloat === FarmFilterAnchorFloat.ANCHOR) ? farm.isAnchor === true : 
  //       (filterAnchorFloat === FarmFilterAnchorFloat.FLOAT) ? farm.isAnchor === false : farm
  //     })

  //     if (query) {
  //       const lowercaseQuery = latinise(query.toLowerCase())
  //       farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
  //         return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery)
  //       })
  //     }

  //     return farmsToDisplayWithAPR
  //   },
  //   [cakePrice, query, isActive, filterAnchorFloat],
  // )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist()
    setQuery(event.target.value)
  }

  // const [
  //   // numberOfFarmsVisible, 
  //   setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)
  const options = ['Earned', 'Staked', 'APR', 'Liquidty']
  const [showMobileSearchBar] = useShowMobileSearchBarManager()
  console.log(query)


  // const chosenFarmsMemoized = useMemo(() => {
    // let chosenFarms = []

  //   const sortFarms = (farms: FarmWithStakedValue[]): FarmWithStakedValue[] => {
  //     switch (sortOption) {
  //       case 'apr':
  //         return orderBy(farms, (farm: FarmWithStakedValue) => farm.apr + farm.lpRewardsApr, 'desc')
  //       case 'multiplier':
  //         return orderBy(
  //           farms,
  //           (farm: FarmWithStakedValue) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
  //           'desc',
  //         )
  //       case 'earned':
  //         return orderBy(
  //           farms,
  //           (farm: FarmWithStakedValue) => (farm.userData ? Number(farm.userData.earnings) : 0),
  //           'desc',
  //         )
  //       case 'liquidity':
  //         return orderBy(farms, (farm: FarmWithStakedValue) => Number(farm.liquidity), 'desc')
  //       case 'latest':
  //         return orderBy(farms, (farm: FarmWithStakedValue) => Number(farm.pid), 'desc')
  //       default:
  //         return farms
  //     }
  //   }

    // if (isActive) {
    //   chosenFarms = stakedOnly 
    //   // ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    // }
    // if (isInactive) {
    //   chosenFarms = stakedOnly 
    //   // ? farmsList(stakedInactiveFarms) : farmsList(inactiveFarms)
    // }
    // if (isArchived) {
    //   chosenFarms = stakedOnly 
    //   // ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms)
    // }

  //   return sortFarms(chosenFarms).slice(0, numberOfFarmsVisible)
  // }, [
  //   sortOption,
  //   activeFarms,
  //   farmsList,
  //   inactiveFarms,
  //   archivedFarms,
  //   isActive,
  //   isInactive,
  //   isArchived,
  //   stakedArchivedFarms,
  //   stakedInactiveFarms,
  //   stakedOnly,
  //   stakedOnlyFarms,
  //   numberOfFarmsVisible,
  // ])

  chosenFarmsLength.current = activeFarms.length

  // useEffect(() => {
  //   if (isIntersecting) {
  //     setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
  //       if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
  //         return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
  //       }
  //       return farmsCurrentlyVisible
  //     })
  //   }
  // }, [isIntersecting])

  const rowData = activeFarms.map((farm) => {
    const { earningToken, stakingToken } = farm
    console.log('stakingToken', stakingToken)
    const tokenAddress = earningToken.address
    const quoteTokenAddress = stakingToken.address
    const lpLabel = `${farm.token1.symbol}-${farm.token2.symbol}`

    const row: RowProps = {
      apr: {
        value: 'farm.apr',
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
        label: lpLabel,
        pid: farm.sousId,
        token: farm.token1,
        quoteToken: farm.token2,
        farmHealth: Math.floor(Math.random() * (500 - 100 + 1)) + 100,
        isAnchor: farm.isAnchor,
        isClassic: farm.isClassic,
        // This will be the function to get the health of the farm
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.pendingReward)),
        pid: farm.sousId,
        hovered: false,
        setHovered: () => {},
      },
      liquidity: {
        liquidity: farm.totalStaked,
        hovered: false,
        setHovered: () => {},
        farm: farm,
      },
      staked: {
        staked: farm.userData.stakedBalance,
        hovered: false,
        setHovered: () => {},
      },
      details: farm,
    }
    return row
  })

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
  return (
    <FarmsContext.Provider value={{ activeFarms }}>
      <Page>
        <ControlContainer>
          <Flex m={'0px'}>
            <PylonClassicTab active={filter} />
            <AnchorFloatTab active={filterAnchorFloat} />
          </Flex>
          <Flex position={'relative'} width={width < 500 ? showMobileSearchBar ? '100%' : 'auto' : 'auto'} height={'70px'}>
            { (!showMobileSearchBar || width > 500) && <ViewControls>
              <ToggleWrapper style={{marginRight: '20px', position: 'relative'}}> 
                <Text fontSize='13px' color={theme.text1} mr={'10px'} width={'max-content'} letterSpacing={'0.05em'}> {t('STAKED ONLY')}</Text>
                <Toggle
                  id="staked-only-farms"
                  checked={stakedOnly}
                  checkedColor={'invertedContrast'}
                  defaultColor={'invertedContrast'}
                  onChange={() => setStakedOnly(!stakedOnly)}
                  scale="sm"
                />
              </ToggleWrapper>
              <FarmTabButtons active='Active' />
            </ViewControls>}
            <FilterContainer>
              <LabelWrapper style={{ marginLeft: showMobileSearchBar ? 0 : 16, width: '100%' }}>
                <SearchInput onChange={handleChangeQuery} placeholder="SEARCH FARMS" />
              </LabelWrapper>
            </FilterContainer>
          </Flex>
        </ControlContainer>
        <MainContainer>
          <table style={{width: '100%'}}>
            <tr style={viewMode === ViewMode.CARD || (viewMode === ViewMode.TABLE && width <= 992) ? 
              ({display: 'flex', justifyContent: 'space-between', alignItems: 'center'}) 
              : null}>
              <TableData style={{minWidth: width > 1400 ? '500px' : width > 992 ? '400px' : 'auto'}}>
                <ViewModeTabs active={viewMode} />
              </TableData>
              {viewMode === ViewMode.TABLE && width > 992 ? options.map((option) => (
                <TableData key={option} style={{cursor: 'pointer'}} onClick={() => setSortOption(option.toLowerCase())}>
                  <PinkArrows style={{display: 'flex', alignItems: 'center'}}>
                    <p style={{fontSize: '13px', color: !darkMode ? theme.text1 : theme.meatPink, fontWeight: 500}}>{option}</p>
                    <FarmRepeatIcon />
                  </PinkArrows>
                  {sortOption === option.toLowerCase() && <SelectedOptionDiv />}
                </TableData>)) :
                (
                  <TableData style={{display: 'flex', width: '200px', paddingRight: width <= 992 ? '0px' : '5px'}}>
                    <Text style={{width: '100px', alignSelf: 'center'}} color={theme.whiteHalf} fontSize={'15px'} >{t('Sort by')}</Text>
                    <Select
                      options={[
                        {
                          label: t('Hot'),
                          value: 'hot',
                        },
                        {
                          label: t('APR'),
                          value: 'apr',
                        },
                        {
                          label: t('Multiplier'),
                          value: 'multiplier',
                        },
                        {
                          label: t('Earned'),
                          value: 'earned',
                        },
                        {
                          label: t('Liquidity'),
                          value: 'liquidity',
                        },
                        {
                          label: t('Latest'),
                          value: 'latest',
                        },
                      ]}
                      onOptionChange={(option) => setSortOption(option.value)}
                    />
                  </TableData>
                )}
              {viewMode === ViewMode.TABLE && width > 992 && (<TableData></TableData>)}
            </tr>
          </table>
            {renderContent()}
        </MainContainer>
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
        <div ref={observerRef} />
      </Page>
    </FarmsContext.Provider>
  )
}

export const FarmsContext = createContext({ activeFarms: [] })

export default Farms
