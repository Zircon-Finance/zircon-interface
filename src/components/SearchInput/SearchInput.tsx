import React from 'react'
import { useState, useMemo } from 'react'
// import { Input } from '@pancakeswap/uikit'
import debounce from 'lodash/debounce'
import { useTranslation } from 'react-i18next'
import { SearchInput } from '../SearchModal/styleds'
import { useWindowDimensions } from '../../hooks'
import SearchIcon from '../../assets/svg/Search.svg'
import { Flex } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { CloseIcon } from '../../theme'

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

const SearchButton = styled.button`
  background: ${({ theme }) => theme.anchorFloatBadge};
  border: none;
  border-radius: 12px;
  padding: 0.5rem;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease-in-out;
  &:hover {
    background: ${({ theme }) => theme.cardExpanded};
  }
`

const SearchInputFarm: React.FC<Props> = ({ onChange: onChangeCallback, placeholder = 'Search' }) => {
  const [searchText, setSearchText] = useState('')

  const { t } = useTranslation()

  const debouncedOnChange = useMemo(
    () => debounce((e: React.ChangeEvent<HTMLInputElement>) => onChangeCallback(e), 500),
    [onChangeCallback],
  )

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist()
    setSearchText(e.target.value)
    debouncedOnChange(e)
  }

  const { width } = useWindowDimensions()
  const [showSearchBar, setShowSearchBar] = useState(false)
  const theme = useTheme()

  return (
    width >= 500 ? (
      <SearchInput style={{height: '30px', borderRadius: '12px'}}
      value={searchText} onChange={onChange} placeholder={t(placeholder)} />
      ) : (
        <Flex flexDirection={'row-reverse'}>
          {!showSearchBar && <SearchButton onClick={() => setShowSearchBar(!showSearchBar)} >
            <img src={SearchIcon} alt="search" />
          </SearchButton>}
          {showSearchBar && (
            <>
            <SearchInput style={{background: 'none', backgroundColor: theme.bg9, height: '30px', borderRadius: '12px', position: 'relative'}}
            value={searchText} onChange={onChange} placeholder={t(placeholder)} />
            <CloseIcon onClick={() => setShowSearchBar(!showSearchBar)} style={{position: 'absolute', right: '10px', alignSelf: 'center'}} />
            </>
          )}
        </Flex>
      )
  )
}

export default SearchInputFarm
