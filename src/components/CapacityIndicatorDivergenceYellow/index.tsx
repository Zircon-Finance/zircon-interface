import React from 'react'
import { useTheme } from 'styled-components'

const CapacityIndicatorDivergenceYellow = () => {
  const theme = useTheme()
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5 22C17.299 22 22 17.299 22 11.5C22 5.70101 17.299 1 11.5 1C5.70101 1 1 5.70101 1 11.5C1 17.299 5.70101 22 11.5 22ZM11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'} fill-opacity="0.5"/>
    <circle cx="11.5" cy="11.5" r="1.5" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'} fill-opacity="0.5"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5 19C15.6421 19 19 15.6421 19 11.5C19 7.35786 15.6421 4 11.5 4C7.35786 4 4 7.35786 4 11.5C4 15.6421 7.35786 19 11.5 19ZM11.5 16C13.9853 16 16 13.9853 16 11.5C16 9.01472 13.9853 7 11.5 7C9.01472 7 7 9.01472 7 11.5C7 13.9853 9.01472 16 11.5 16Z" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'} fill-opacity="0.25"/>
    <circle cx="11.5" cy="5.5" r="1.5" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'}/>
    <circle cx="11.5" cy="17.5" r="1.5" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'}/>
    <circle cx="6.30294" cy="8.49979" r="1.5" transform="rotate(-60 6.30294 8.49979)" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'}/>
    <circle cx="16.6975" cy="14.4998" r="1.5" transform="rotate(-60 16.6975 14.4998)" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'}/>
    <circle cx="6.30294" cy="14.5008" r="1.5" transform="rotate(-120 6.30294 14.5008)" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'}/>
    <circle cx="16.6975" cy="8.49881" r="1.5" transform="rotate(-120 16.6975 8.49881)" fill={theme.darkMode ? ' #C1A624' : ' #C1A624'}/>
    </svg>
  )
}

export default CapacityIndicatorDivergenceYellow