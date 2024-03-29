import React from 'react'
import { useIsDarkMode } from '../../state/user/hooks'

const FarmRepeatIcon = (props:{onClick?:()=>void}) => {
  const darkMode = useIsDarkMode();
  return (

    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 8L6.5 5L9.5 8" stroke={darkMode ? "#D5AEAF" : '#91889B'}/>
      <path d="M6.5 5V15" stroke={darkMode ? "#D5AEAF" : '#91889B'}/>
      <path d="M13.5 5V15" stroke={darkMode ? "#D5AEAF" : '#91889B'}/>
      <path d="M10.5 12L13.5 15L16.5 12" stroke={darkMode ? "#D5AEAF" : '#91889B'}/>
    </svg>
  )
}

export default FarmRepeatIcon