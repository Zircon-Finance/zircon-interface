import { Currency, DEV, Token } from 'zircon-sdk'
import React, { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactGA from 'react-ga4'
import { useTranslation } from 'react-i18next'
import { FixedSizeList } from 'react-window'
import { Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
// import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useToken } from '../../hooks/Tokens'
import { useSelectedListInfo } from '../../state/lists/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { isAddress } from '../../utils'
import Card from '../Card'
import Column from '../Column'
import ListLogo from '../ListLogo'
// import QuestionHelper from '../QuestionHelper'
import Row, { RowBetween } from '../Row'
// import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { filterTokens } from './filtering'
// import SortButton from './SortButton'
import { useTokenComparator } from './sorting'
import { PaddedColumn, SearchInput, Separator } from './styleds'
import AutoSizer from 'react-virtualized-auto-sizer'
import { ButtonPositionsMobile } from '../Button'
import CurrencyLogo from '../CurrencyLogo'

const SmallPlanet = styled.div`
  height: 28px;
  width: 68px;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 14px;
  padding: 5px 8px 5px 5px;
  background-color: ${({ theme }) => theme.searchInput};
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.questionMarks};
  }
`

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  onChangeList: () => void
  isFloat: boolean
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  onChangeList,
  isFloat
}: CurrencySearchProps) {
  const { t } = useTranslation()
  // const { chainId } = useActiveWeb3React()
  const theme = useTheme()

  const fixedList = useRef<FixedSizeList>()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [invertSearchOrder] = useState<boolean>(false)
  //const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false)
  const allTokens = useAllTokens()

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch
      })
    }
  }, [isAddressSearch])

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim()
    return s === '' || s === 'd' || s === 'de' || s === 'dev'
  }, [searchQuery])

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : []
    return filterTokens(Object.values(allTokens), searchQuery)
  }, [isAddressSearch, searchToken, allTokens, searchQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken]
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0])
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const selectedFloatTokens = [filteredSortedTokens[23], filteredSortedTokens[6], DEV, filteredSortedTokens[15], filteredSortedTokens[16], filteredSortedTokens[12]]
  const selectedAnchorTokens = [filteredSortedTokens[23], filteredSortedTokens[33], filteredSortedTokens[6], filteredSortedTokens[15], DEV]

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim()
        if (s === 'dev') {
          handleCurrencySelect(DEV)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  )

  const selectedListInfo = useSelectedListInfo()
  const [hover, setHover] = useState(false)

  return (
    <Column style={{ width: '100%', flex: '1 1' }}>
      <PaddedColumn gap="14px" style={{paddingBottom: '15px'}}>
        <RowBetween>
          <Text fontWeight={400} fontSize={16} style={{padding: '15px 0 15px 0'}}>
            Select a token
            {/* <QuestionHelper text="Find a token by searching for its name or symbol or by pasting its address below." /> */}
          </Text>
          <CloseIcon onClick={onDismiss} id="modal-close-x" />
        </RowBetween>
        <SearchInput
          expanded={true}
          type="text"
          id="token-search-input"
          placeholder={t('tokenSearchPlaceholder')}
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
        {/* {showCommonBases && (
          <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
        )} */}
        <RowBetween>
          {/* <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} /> */}
        </RowBetween>
      </PaddedColumn>

      {(isFloat !== undefined && filteredSortedTokens.length > 0 && !searchQuery) && 
      <Flex flexDirection="column" style={{padding: '0 20px', gap: '5px'}}>
        <Text color={theme.whiteHalf}>{`Recommended for ${isFloat ? 'Float' : 'Anchor'}`}</Text>
        <Flex flexDirection="row" style={{display: 'flex', marginBottom: '15px', flexWrap: 'wrap'}}>
        {isFloat === true &&
          selectedFloatTokens?.map((token, i) => (
            <SmallPlanet onClick={()=>handleCurrencySelect(token)}>
              <CurrencyLogo currency={token} size={'18px'} />
              <Text fontWeight={500} fontSize={14} style={{padding: '0 5px 0 5px'}}>{token?.symbol}</Text>
            </SmallPlanet>
          ))
        }
        {isFloat === false &&
          selectedAnchorTokens?.map((token, i) => (
            <SmallPlanet onClick={()=>handleCurrencySelect(token)}>
              <CurrencyLogo currency={token} size={'18px'} />
              <Text fontWeight={500} fontSize={14} style={{padding: '0 5px 0 5px'}}>{token?.symbol}</Text>
            </SmallPlanet>
          ))
        }
        </Flex>
      </Flex>
      }


      <Separator style={{background: theme.searchInput}} />

      <div style={{ flex: '1' }}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CurrencyList
              height={height}
              showETH={showETH}
              currencies={filteredSortedTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
            />
          )}
        </AutoSizer>
      </div>

      <Separator style={{background: theme.searchInput}} />
      <Card style={{padding: '15px'}}>
        <RowBetween>
          {selectedListInfo.current ? (
            <Row>
              {selectedListInfo.current.logoURI ? (
                <ListLogo
                  style={{ marginRight: 12 }}
                  logoURI={selectedListInfo.current.logoURI}
                  alt={`${selectedListInfo.current.name} list logo`}
                />
              ) : null}
              <TYPE.main id="currency-search-selected-list-name">{selectedListInfo.current.name}</TYPE.main>
            </Row>
          ) : null}
          <ButtonPositionsMobile
            style={{ height: '34px', padding: '10px 12px', fontWeight: 400, color: theme.white, fontSize: 13, width: 'auto', 
            background: hover ? theme.changeButtonHover : theme.changeButtonNormal }}
            onClick={onChangeList}
            id="currency-search-change-list-button"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            {selectedListInfo.current ? 'Change' : 'Select a list'}
          </ButtonPositionsMobile>
        </RowBetween>
      </Card>
    </Column>
  )
}
