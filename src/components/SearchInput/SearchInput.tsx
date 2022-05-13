import React from 'react'
import { useState, useMemo } from 'react'
// import { Input } from '@pancakeswap/uikit'
import styled from 'styled-components'
import debounce from 'lodash/debounce'
import { useTranslation } from 'react-i18next'

const StyledInput = styled.input`
  border-radius: 16px;
  margin-left: auto;
`

const InputWrapper = styled.div`
  position: relative;
  @media (max-width: 768px) {
    display: block;
  }
`

// interface Props {
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
//   placeholder?: string
// }

const SearchInput = ({ onChange: onChangeCallback, placeholder = 'Search' }) => {
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
    <InputWrapper>
      <StyledInput value={searchText} onChange={onChange} placeholder={t(placeholder)} />
    </InputWrapper>
  )
}

export default SearchInput
