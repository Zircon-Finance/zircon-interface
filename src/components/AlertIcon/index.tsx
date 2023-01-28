import React from 'react'
import { useTheme } from 'styled-components'

const AlertIcon = () => {
    const theme = useTheme()
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill={theme.darkMode ? "#E67066" : '#D33535'}/>
        <rect x="11" y="5" width="2" height="9" rx="1" fill={theme.darkMode ? "#592B3C" : "#FCFBFC"}/>
        <rect x="10.85" y="16.85" width="2.3" height="2.3" rx="1.15" fill={theme.darkMode ? "#592B3C" : "#FCFBFC"} stroke={theme.darkMode ? "#592B3C" : "#FCFBFC"} stroke-width="0.3"/>
    </svg>
  )
}

export default AlertIcon