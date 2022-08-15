import { SvgProps } from '@pancakeswap/uikit'
import React from 'react'
import { useTheme } from 'styled-components'

const CoffeeIcon: React.FC<SvgProps> = () => {
  const theme = useTheme()
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18" stroke={theme.white} stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 8H18V17C18 18.0609 17.5786 19.0783 16.8284 19.8284C16.0783 20.5786 15.0609 21 14 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V8Z" stroke={theme.white} stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 1V4" stroke={theme.white} stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 1V4" stroke={theme.white} stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 1V4" stroke={theme.white} stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}

export default CoffeeIcon