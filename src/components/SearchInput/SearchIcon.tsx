import React from 'react'
import { useTheme } from 'styled-components'

const SearchIcon = () => {
    const theme = useTheme()
  return (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19.5C15.4183 19.5 19 15.9183 19 11.5C19 7.08172 15.4183 3.5 11 3.5C6.58172 3.5 3 7.08172 3 11.5C3 15.9183 6.58172 19.5 11 19.5Z" stroke={theme.pinkBrown} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.9999 21.4984L16.6499 17.1484" stroke={theme.pinkBrown} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  )
}

export default SearchIcon