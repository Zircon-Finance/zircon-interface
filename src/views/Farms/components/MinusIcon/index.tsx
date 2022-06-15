import React from 'react'
import { useIsDarkMode } from '../../../../state/user/hooks'

const MinusIcon = () => {
  const darkMode = useIsDarkMode()
  return (
    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="28" height="28" rx="14" fill="white" fillOpacity="0.1"/>
    <path d="M7.5 14.5H21.5" stroke={!darkMode ? "#FFF" : "#FFF"} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  )
}

export default MinusIcon