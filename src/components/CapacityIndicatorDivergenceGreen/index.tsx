import React from 'react'
import { useTheme } from 'styled-components'
import { useSpring, animated } from '@react-spring/web'

const CapacityIndicatorDivergenceGreen = ({hover}) => {
  const theme = useTheme()
  const springs = useSpring({
    transform:  hover ? 'rotate(360deg) scale(1.3)' : 'rotate(0deg) scale(1)',
  })
  return (
      <animated.svg style={{...springs}} width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_5900_19541)">
          <path fillRule="evenodd" clipRule="evenodd" d="M11.5 23C17.8513 23 23 17.8513 23 11.5C23 5.14873 17.8513 0 11.5 0C5.14873 0 0 5.14873 0 11.5C0 17.8513 5.14873 23 11.5 23ZM11.5 20C16.1944 20 20 16.1944 20 11.5C20 6.80558 16.1944 3 11.5 3C6.80558 3 3 6.80558 3 11.5C3 16.1944 6.80558 20 11.5 20Z" fill={theme.darkMode ? ' #5CB376' : ' #449133'} fillOpacity="0.25"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M11.5 18C15.0899 18 18 15.0899 18 11.5C18 7.91015 15.0899 5 11.5 5C7.91015 5 5 7.91015 5 11.5C5 15.0899 7.91015 18 11.5 18ZM11.5 17C14.5376 17 17 14.5376 17 11.5C17 8.46243 14.5376 6 11.5 6C8.46243 6 6 8.46243 6 11.5C6 14.5376 8.46243 17 11.5 17Z" fill={theme.darkMode ? ' #5CB376' : ' #449133'} fillOpacity="0.5"/>
          <circle cx="11.5" cy="11.5" r="1.5" fill={theme.darkMode ? ' #5CB376' : ' #449133'} fillOpacity="0.5"/>
          <circle cx="11.5" cy="1.5" r="1.5" fill={theme.darkMode ? ' #5CB376' : ' #449133'}/>
          <circle cx="11.5" cy="21.5" r="1.5" fill={theme.darkMode ? ' #5CB376' : ' #449133'}/>
          <circle cx="2.84201" cy="6.49979" r="1.5" transform="rotate(-60 2.84201 6.49979)" fill={theme.darkMode ? ' #5CB376' : ' #449133'}/>
          <circle cx="20.1584" cy="16.5008" r="1.5" transform="rotate(-60 20.1584 16.5008)" fill={theme.darkMode ? ' #5CB376' : ' #449133'}/>
          <circle cx="2.84201" cy="16.4988" r="1.5" transform="rotate(-120 2.84201 16.4988)" fill={theme.darkMode ? ' #5CB376' : ' #449133'}/>
          <circle cx="20.1584" cy="6.50077" r="1.5" transform="rotate(-120 20.1584 6.50077)" fill={theme.darkMode ? ' #5CB376' : ' #449133'}/>
        </g>
        <defs>
          <clipPath id="clip0_5900_19541">
            <rect width="23" height="23" fill="white"/>
          </clipPath>
        </defs>
      </animated.svg>

  )
}

export default CapacityIndicatorDivergenceGreen
