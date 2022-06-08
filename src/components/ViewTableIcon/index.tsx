import React from 'react'
import { useIsDarkMode } from '../../state/user/hooks'

const TableIcon = () => {
  const darkMode = useIsDarkMode()
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 8.33301H2.5" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 5H2.5" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 11.667H2.5" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 15H2.5" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default TableIcon