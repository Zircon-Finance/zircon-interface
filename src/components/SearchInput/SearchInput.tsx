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
import { useShowMobileSearchBarManager } from '../../state/user/hooks'

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
  const theme = useTheme()
  const [showMobileSearchBar, toggleShowMobileSearchBar] = useShowMobileSearchBarManager()
  const [fakeMobileSearchBar, setFakeMobileSearchBar] = useState(showMobileSearchBar)

  return (
    width >= 500 ? (
      <SearchInput expanded={true} style={{backgroundColor: theme.anchorFloatBadge, height: '30px', borderRadius: '12px'}}
      value={searchText} onChange={onChange} placeholder={t(placeholder)} />
      ) : (
        <Flex style={{width: '100%'}}>
          {!showMobileSearchBar && <SearchButton onClick={() => [setFakeMobileSearchBar(true),toggleShowMobileSearchBar()]} >
            <img src={SearchIcon} alt="search" />
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
