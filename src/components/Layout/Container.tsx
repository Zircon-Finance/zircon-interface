import React from 'react'
import { Box, BoxProps } from '@pancakeswap/uikit'
import { useWindowDimensions } from '../../hooks'

const Container: React.FC<BoxProps> = ({ children, ...props }) => {
  const { width } = useWindowDimensions()
  console.log('Window.location.hash', window.location.hash)
  return (
    <Box px={['16px', '24px']} mx="auto" width= {(width <= 500 && window.location.hash.includes('#/farm')) ? '100%' : "90%"} {...props}>
    {children}
    </Box>
  )
}

export default Container
