import React from 'react'
import { useTheme } from 'styled-components'

const PlusIconMini = () => {
  const theme = useTheme()
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="1" height="9" fill={theme.darkMode ? '#A7959C'  : '#7F7C7D'}/>
      <rect x="11" y="6" width="1" height="9" transform="rotate(90 11 6)" fill={theme.darkMode ? '#A7959C'  : '#7F7C7D'}/>
    </svg>
  )
}

export default PlusIconMini