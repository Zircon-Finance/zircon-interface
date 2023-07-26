import React from 'react'
import { useIsDarkMode } from '../../../../state/user/hooks'

const MinusIcon = () => {
  const darkMode = useIsDarkMode()
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="11" width="15" height="1" fill={darkMode ? '#1D1D1F' : '#FFF'} />
    </svg>
  )
}

export default MinusIcon