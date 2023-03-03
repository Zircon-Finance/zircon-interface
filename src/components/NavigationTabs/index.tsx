import React, { useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink } from 'react-router-dom'

import { ArrowLeft } from 'react-feather'
import { RowBetween } from '../Row'
import QuestionHelper from '../QuestionHelper'
import Settings from '../Settings'
import { useActiveWeb3React, useBlockedApiData, useWindowDimensions } from '../../hooks'
import { connectNet } from '../WalletModal'
// import MoonbeamLogo from '../MoonbeamLogo'
import MoonriverLogo from '../MoonriverLogo'
import BnbLogo from '../BnbLogo'
import { DialogContainer } from '../TopTokensRow'
import { Flex, Text } from 'rebass'
import { ControlContainer } from '../../views/Farms/Farms'
import { ArrowIcon } from '../../views/Farms/components/FarmTable/Details'
import { Separator } from '../SearchModal/styleds'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import ArbitrumLogo from '../ArbitrumLogo'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 17px;
  justify-content: space-evenly;
  margin: auto;
  height: 44px;
  background: ${({ theme }) => theme.darkMode ? 'rgba(213, 174, 175, 0.07)' : '#ECEAEA' };
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})<{ disabled?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  height: 34px;
  font-weight: 400;
  justify-content: center;
  border-radius: 12px;
  outline: none;
  text-decoration: none;
  color: ${({ theme, disabled }) => disabled ? theme.opacitySmall : theme.pinkBrown};
  font-size: 16px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  padding: 9px 13px;
  width: 50%;

  &.${activeClassName} {
    border-radius: 12px;
    color: ${({ theme, disabled }) => !disabled && theme.text1};
    background-color: ${({ theme, disabled }) => !disabled && theme.darkMode ? 'rgba(213, 174, 175, 0.25)' : '#FCFBFC'};
    box-shadow: ${({ theme, disabled }) => !disabled && theme.darkMode ? 'none' : '0px 1px 2px rgba(0, 0, 0, 0.15)'};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
  @media (min-width: 700px) {
    width: auto;
  }
`

const ActiveText = styled.div`
  font-weight: 200;
  font-size: 16px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  margin: 12px 0px;
  stroke: ${({ theme }) => theme.pinkBrown} !important;
`

const Container = styled(ControlContainer)`
  position: fixed;
  top: 95px;
  right: 0px;
  padding: 5px 0;
  background: ${({ theme }) => theme.darkMode ? '#5d3e3a' : '#FCFBFC'};
  box-shadow: ${({ theme }) => theme.darkMode ? 'none' : '0px 1px 2px rgba(0, 0, 0, 0.15)'};
  border-radius: 17px;
  width: 100%;
  display: flex;
  flex-direction: column !important;
  flex-wrap: nowrap !important;
  max-height: 300px !important;
  @media (min-width: 700px) {
    width: 200px;
    right: 0px;
    top: 50px;
  }
  @media (min-width: 1100px) {
    background: ${({ theme }) => theme.darkMode ? 'rgba(213, 174, 175, 0.15)' : '#FCFBFC'};
    top: 75px;
    right: 25px;
  }
  z-index: 2;
`

const ChainRow = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  width: 95%;
  border-radius: 12px;
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.darkMode ? 'rgba(213, 174, 175, 0.1)' : '#F2F0F1'};
  }
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' | 'farm' }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const theme = useTheme()
  const [hoverBlocked, setHoverBlocked] = React.useState(false)

  const blockedApiData = useBlockedApiData();
  const isPoolBlocked = blockedApiData?.isPoolBlocked
  const isFarmBlocked = blockedApiData?.isFarmBlocked
  const blockReasonTitle = blockedApiData?.blockReasonTitle
  const blockReasonDescription = blockedApiData?.blockReasonDescription

  const hoverContent = (
    <DialogContainer style={{
      background: theme.questionMarkBg,
      position: 'fixed',
      top: width >= 1100 ? '80px' : width >= 700 ? '140px' : '210px',
      width: '200px',
      right: 'auto',
      padding: '15px'}}
    show={hoverBlocked}>
      <Text style={{color: theme.text1}} fontSize='13px' fontWeight={500} mb={'5px'}>
        {blockReasonTitle}
      </Text>
      <Text style={{color: theme.text1}} fontSize='13px' fontWeight={400}>
        {blockReasonDescription}
      </Text>
    </DialogContainer>
  )

  return (
    <Tabs style={{ marginBottom: '10px', width: width >= 700 ? 'auto' : '100%', padding: '5px' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink onMouseEnter={() => setHoverBlocked(true)} onMouseLeave={() => setHoverBlocked(false)}
       disabled={isPoolBlocked} id={`pool-nav-link`} to={isPoolBlocked ? '#' : '/pool'} isActive={() => active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
      <StyledNavLink onMouseEnter={() => setHoverBlocked(true)} onMouseLeave={() => setHoverBlocked(false)}
      disabled={isFarmBlocked} id={`farm-nav-link`} to={isFarmBlocked ? '#' : '/farm'} isActive={() => active === 'farm'}>
        {t('Farm')}
      </StyledNavLink>
      {hoverBlocked && isPoolBlocked && isFarmBlocked && hoverContent}
    </Tabs>
  )
}

export function ChainPoolTab({ active }: { active: 'bsc' | 'moonriver' | 'arbitrum' }) {
  const { width } = useWindowDimensions();
  const node = useRef<HTMLDivElement>()
  const theme = useTheme()
  const {chainId} = useActiveWeb3React()
  const [showOptions, setShowOptions] = useState(false)
  const [fakeShowOptions, setFakeShowOptions] = useState(false)
  const toggleFilters = () => {
    setFakeShowOptions(!fakeShowOptions)
    setTimeout(() => {
      setShowOptions(!showOptions)
    }, 200)
  }
  useOnClickOutside(node, showOptions ? toggleFilters : undefined)

  const activeEllipsis = (darkMode) => { return(
    <svg width="5" height="6" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="2.5" cy="3" r="2.5" fill={darkMode ? "#CA90BB" : '#9E4D86'}/>
    </svg>)
  }
  const supported_networks = [56, 1285, 421613]

  const Row = ({ chainId, currentChainId }) => { return(
    <ChainRow onClick={()=> {connectNet(chainId === 56 ? 'bsc' : chainId === 1285 ? 'moonriver' : 'arbGoerli'); toggleFilters()}}>
      <Flex>
        {chainId === 56 ? <BnbLogo /> : chainId === 1285 ? <MoonriverLogo /> : <ArbitrumLogo />}
        <Text ml='5px'>{chainId === 56 ? 'BSC' : chainId === 1285 ? 'Moonriver' : 'Arbitrum'}</Text>
      </Flex>
      {chainId === currentChainId && activeEllipsis(theme.darkMode)}
    </ChainRow>)
  }

  return (
    <Tabs ref={node as any} style={{ width: width >= 700 ? 'auto' : '100%', padding: '5px', marginLeft: width >= 700 ? '5px' : '0px', marginRight: width >= 700 ? '5px' : '0px'}}>
      <StyledNavLink onClick={toggleFilters} id={`swap-chain`} to={'#'}  isActive={() => false} style={{padding: '5px, 8px, 5px, 8px', width: '100%'}}>
        {chainId === 56 ? <BnbLogo /> : chainId === 1285 ? <MoonriverLogo /> : <ArbitrumLogo />}
        <Text ml='5px'>{chainId === 56 ? 'BSC' : chainId === 1285 ? 'Moonriver' : 'Arbitrum'}</Text>
        <ArrowIcon toggled={showOptions} style={{marginLeft: '5px', transform: showOptions ? 'rotate(180deg)' : 'rotate(0deg)'}} />
      </StyledNavLink>
      {(showOptions) && <Container active={fakeShowOptions}>
        <Flex p='10px'>
          <Text fontSize={'13px'} color={theme.darkMode ? 'rgba(255, 255, 255, 0.6)' : '#6A6768'}>{'Select a network'}</Text>
        </Flex>
        <Separator style={{marginBottom: '5px'}} />
        {supported_networks.map((supportedChainId) => {
          return (
            <Row chainId={supportedChainId} currentChainId={chainId} />
          )
        })}
        </Container>}
      {/* <StyledNavLink id={`swap-chain-moonriver`}to={'#'} onClick={()=> {connectNet('moonriver')}} isActive={() => active === 'moonriver'} style={{padding: '5px, 8px, 5px, 8px'}}>
        <MoonriverLogo />
        <Text ml='5px'>{'Moonriver'}</Text>
      </StyledNavLink> */}
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs style={{border: 'none', background: 'none', height: 'auto'}}>
      <RowBetween style={{ padding: '11px 25px' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft strokeWidth={1} />
        </HistoryLink>
        <ActiveText>Import Pool</ActiveText>
        <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding }: { adding: boolean }) {
  return (
    <Tabs style={{border: 'none', background: 'none', height: 'auto'}}>
      <RowBetween style={{ padding: '11px 25px' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft strokeWidth={1} />
        </HistoryLink>
        <ActiveText>{adding ? 'Add' : 'Remove'} Liquidity</ActiveText>
        <Settings />
        {/* <QuestionHelper
          text={
            adding
              ? 'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              : 'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
          }
        /> */}
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabsClassic({ adding }: { adding: boolean }) {
  return (
    <Tabs style={{border: 'none'}}>
      <RowBetween style={{ padding: '11px 25px' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft strokeWidth={1} />
        </HistoryLink>
        <ActiveText>{adding ? 'Classic' : 'Remove'} Liquidity</ActiveText>
        <Settings />
        {/* <QuestionHelper
          text={
            adding
              ? 'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              : 'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
          }
        /> */}
      </RowBetween>
    </Tabs>
  )
}
