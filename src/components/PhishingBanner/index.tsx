import React from 'react'
import { Link } from 'react-router-dom'
import { useShowBannerManager } from '../../state/user/hooks'
import { CloseIcon } from '../../theme'
import { WarningLight } from '../WarningIcon/index.tsx'
import { Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { useWindowDimensions } from '../../hooks'

const Container = styled.div`
  height: auto;
  width: 100%;
  background-color: ${({ theme }) => theme.darkMode ? '#3C2320' : '#403A3A'};
  display: flex;
  align-items: center;
  justify-content: space-around;
  top: 0;
  z-index: 100;
  transition: opacity 0.3s ease-in-out;
  @media (min-width: 992px) {
    height: 60px;
`

export const PhishingBanner = () => {
  const [, setShowBanner] = useShowBannerManager()
  const theme = useTheme()
  const {width} = useWindowDimensions()
  return (
    <Container>
        <WarningLight />
        <Flex flexDirection={width <= 992 ? 'column' : 'row'} py={width <= 992 && '10px'}>
          <Text color={'#E9D886'}>PHISHING WARNING: </Text>
          <Text ml={width >= 992 && 2} color={theme.darkMode ? '#CCB6B5' : '#E8E6E6'}>please make sure you're visiting  </Text>
          <Link to={'https://app.sushi.com'} style={{textDecoration: 'none', color: '#E9D886', marginLeft: width >= 992 && '5px'}}> https://app.zircon.finance </Link>
          <Text ml={width >= 992 &&'5px'} color={theme.darkMode ? '#CCB6B5' : '#E8E6E6'}>check the URL carefully</Text>
        </Flex>
        <CloseIcon fill={'#fff'} onClick={() => setShowBanner()} />
    </Container>
  )
}