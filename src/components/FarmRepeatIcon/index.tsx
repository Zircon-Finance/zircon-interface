import React from 'react'
import { useIsDarkMode } from '../../state/user/hooks'

const FarmRepeatIcon = (props:{onClick?:()=>void}) => {
  const darkMode = useIsDarkMode();
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 13L14 15L12 13" stroke={darkMode ? "#D5AEAF" : '#91889B'} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 5.22266L14 15.0004" stroke={darkMode ? "#D5AEAF" : '#91889B'} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 7L6 5L8 7" stroke={darkMode ? "#D5AEAF" : '#91889B'} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 14.7778L6 5" stroke={darkMode ? "#D5AEAF" : '#91889B'} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default FarmRepeatIcon