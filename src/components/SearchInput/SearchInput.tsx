import React from 'react'
import { useState, useMemo } from 'react'
// import { Input } from '@pancakeswap/uikit'
import debounce from 'lodash/debounce'
import { useTranslation } from 'react-i18next'
import { SearchInput } from '../SearchModal/styleds'

const SearchInputFarm = ({ onChange: onChangeCallback, placeholder = 'Search' }) => {
  const [searchText, setSearchText] = useState('')
  const { t } = useTranslation()

  const debouncedOnChange = useMemo(
    () => debounce((e) => onChangeCallback(e), 500),
    [onChangeCallback],
  )

  const onChange = (e) => {
    setSearchText(e.target.value)
    debouncedOnChange(e)
  }

  return (
      <SearchInput style={{height: '30px', borderRadius: '12px'}}
      value={searchText} onChange={onChange} placeholder={t(placeholder)} />
  )
}

export default SearchInputFarm
