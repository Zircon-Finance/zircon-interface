import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink } from 'react-router-dom'

import { ArrowLeft } from 'react-feather'
import { RowBetween } from '../Row'
import QuestionHelper from '../QuestionHelper'
import Settings from '../Settings'
import { useWindowDimensions } from '../../hooks'
import { connectNet } from '../WalletModal'
// import MoonbeamLogo from '../MoonbeamLogo'
import MoonriverLogo from '../MoonriverLogo'
import BnbLogo from '../BnbLogo'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 17px;
  justify-content: space-evenly;
  margin: auto;
  border: 1px solid ${({ theme }) => theme.navigationBorder};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  font-weight: 400;
  justify-content: center;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.tabsText};
  font-size: 16px;
  padding: 9px 13px;
  width: 50%;

  &.${activeClassName} {
    border-radius: 12px;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.navigationTabs};
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

const BnbContainer = styled.div`
display: flex;
svg {
  path {
    fill: #F0B90B;
  }
}
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' | 'farm' }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  return (
    <Tabs style={{ marginBottom: '10px', width: width >= 700 ? 'auto' : '100%', padding: '5px' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
      <StyledNavLink id={`farm-nav-link`} to={'/farm'} isActive={() => active === 'farm'}>
        {t('Farm')}
      </StyledNavLink>
    </Tabs>
  )
}

export function ChainPoolTab({ active }: { active: 'bsc' | 'moonriver' }) {
  const { width } = useWindowDimensions();
  return (
    <Tabs style={{ width: width >= 700 ? 'auto' : '100%', padding: '3px', marginLeft: '20px', marginRight: '0px' }}>
      <StyledNavLink id={`swap-chain-bsc`} to={'#'} onClick={()=> {connectNet('bsc')}} isActive={() => active === 'bsc'} style={{padding: '5px 10px'}}>
        <BnbContainer><BnbLogo /></BnbContainer>
      </StyledNavLink>
      <StyledNavLink id={`swap-chain-moonriver`}to={'#'} onClick={()=> {connectNet('moonriver')}} isActive={() => active === 'moonriver'} style={{padding: '5px 10px'}}>
        <MoonriverLogo />
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs style={{border: 'none'}}>
      <RowBetween style={{ padding: '11px 16px' }}>
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
    <Tabs style={{border: 'none'}}>
      <RowBetween style={{ padding: '11px 16px' }}>
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
      <RowBetween style={{ padding: '11px 16px' }}>
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
