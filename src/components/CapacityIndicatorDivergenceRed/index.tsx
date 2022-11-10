import React from 'react'
import { useTheme } from 'styled-components'

const CapacityIndicatorDivergenceRed = () => {
  const theme = useTheme()
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5 22C17.299 22 22 17.299 22 11.5C22 5.70101 17.299 1 11.5 1C5.70101 1 1 5.70101 1 11.5C1 17.299 5.70101 22 11.5 22ZM11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" fill={theme.darkMode ? ' #E67066' : ' #DE4337'} fill-opacity="0.5"/>
    <circle cx="11.5" cy="11.5" r="2.5" fill={theme.darkMode ? ' #E67066' : ' #DE4337'}/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5 18C15.0899 18 18 15.0899 18 11.5C18 7.91015 15.0899 5 11.5 5C7.91015 5 5 7.91015 5 11.5C5 15.0899 7.91015 18 11.5 18ZM11.5 17C14.5376 17 17 14.5376 17 11.5C17 8.46243 14.5376 6 11.5 6C8.46243 6 6 8.46243 6 11.5C6 14.5376 8.46243 17 11.5 17Z" fill={theme.darkMode ? ' #E67066' : ' #DE4337'} fill-opacity="0.5"/>
    </svg>
  )
}

export default CapacityIndicatorDivergenceRed