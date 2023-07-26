import React from 'react'
import { useIsDarkMode } from '../../../../state/user/hooks'

const PlusIcon = () => {
  const darkMode = useIsDarkMode()
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 11V4H11V11H4V12H11V19H12V12H19V11H12Z" fill={darkMode ? '#1D1D1F' : '#FFF'} />
    </svg>
  )
}

export default PlusIcon