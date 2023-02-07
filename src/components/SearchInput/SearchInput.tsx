import React from 'react'
import { useState, useMemo } from 'react'
// import { Input } from '@pancakeswap/uikit'
import debounce from 'lodash/debounce'
import { useTranslation } from 'react-i18next'
import { SearchInput } from '../SearchModal/styleds'
import { useWindowDimensions } from '../../hooks'
import { Flex } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { CloseIcon } from '../../theme'
import { useShowMobileSearchBarManager } from '../../state/user/hooks'
import SearchIcon from './SearchIcon'

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

const SearchButton = styled.button`
  background: ${({ theme }) => theme.farmTabsBg};
  border: none;
  border-radius: 12px;
  padding: 7px;
  cursor: pointer;
  height: 38px;
  outline: none;
  transition: all 0.2s ease-in-out;
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
  const theme = useTheme()
  const [showMobileSearchBar, toggleShowMobileSearchBar] = useShowMobileSearchBarManager()
  const [fakeMobileSearchBar, setFakeMobileSearchBar] = useState(showMobileSearchBar)

  return (
    width >= 500 ? (
      <SearchInput expanded={true} style={{backgroundColor: theme.farmTabsBg, height: '30px', borderRadius: '12px'}}
      value={searchText} onChange={onChange} placeholder={t(placeholder)} />
      ) : (
        <Flex style={{width: '100%'}}>
          {!showMobileSearchBar && <SearchButton onClick={() => [setFakeMobileSearchBar(true),toggleShowMobileSearchBar()]} >
            <SearchIcon />
          </SearchButton>}
          {showMobileSearchBar && (
            <>
            <SearchInput expanded={fakeMobileSearchBar} style={{background: 'none', backgroundColor: theme.anchorFloatBadge, height: '30px', borderRadius: '12px', position: 'absolute'}}
            value={searchText} onChange={onChange} placeholder={t(placeholder)} />
            <CloseIcon onClick={() => [setFakeMobileSearchBar(false), setTimeout(() => {toggleShowMobileSearchBar()}, 300)]} 
            style={{position: 'relative', left: '90%', top: '7px', opacity: fakeMobileSearchBar ? '1' : '0' }} />
            </>
          )}
        </Flex>
      )
  )
}

export default SearchInputFarm
