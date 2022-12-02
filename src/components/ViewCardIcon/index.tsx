import React from 'react'
import { useIsDarkMode } from '../../state/user/hooks'

const CardIcon = () => {
  const darkMode = useIsDarkMode()
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="11.5" y="2.5" width="6" height="6" rx="0.5" stroke={!darkMode ? '#000' : "white"}/>
      <rect x="11.5" y="11.5" width="6" height="6" rx="0.5" stroke={!darkMode ? '#000' : "white"}/>
      <rect x="2.5" y="2.5" width="6" height="6" rx="0.5" stroke={!darkMode ? '#000' : "white"}/>
      <rect x="2.5" y="11.5" width="6" height="6" rx="0.5" stroke={!darkMode ? '#000' : "white"}/>
    </svg>
  )
}

export default CardIcon