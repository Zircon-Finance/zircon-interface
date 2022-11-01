import React from 'react'
import { useIsDarkMode } from '../../state/user/hooks'

const TableIcon = () => {
  const darkMode = useIsDarkMode()
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="16" height="1" fill={!darkMode ? '#000' : "white"}/>
      <rect x="2" y="5" width="16" height="1" fill={!darkMode ? '#000' : "white"}/>
      <rect x="2" y="11" width="16" height="1" fill={!darkMode ? '#000' : "white"}/>
      <rect x="2" y="14" width="16" height="1" fill={!darkMode ? '#000' : "white"}/>
    </svg>
  )
}

export default TableIcon