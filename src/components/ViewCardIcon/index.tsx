import React from 'react'
import { useIsDarkMode } from '../../state/user/hooks'

const CardIcon = () => {
  const darkMode = useIsDarkMode()
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5001 2.5H11.6667V8.33333H17.5001V2.5Z" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5001 11.667H11.6667V17.5003H17.5001V11.667Z" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33333 11.667H2.5V17.5003H8.33333V11.667Z" stroke={!darkMode ? '#000' : "white"} strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default CardIcon