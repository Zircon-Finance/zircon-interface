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

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 17px;
  justify-content: space-evenly;
  padding: 5px;
  margin: auto;
  border: 1px solid #413055;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  font-weight: 400;
  justify-content: center;
  height: 3rem;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 16px;
  padding: 10px 12px;
  width: 50%;

  &.${activeClassName} {
    border-radius: 12px;
    color: ${({ theme }) => theme.text1};
    background-color: #402D54;
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
  color: ${({ theme }) => theme.text1};
  margin: 12px;
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  return (
    <Tabs style={{ marginBottom: '20px', width: width > 700 ? 'auto' : '100%' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs style={{border: 'none'}}>
      <RowBetween style={{ padding: '1rem' }}>
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
    <Tabs style={{border: 'none', padding: '1rem'}}>
      <RowBetween style={{ padding: '1rem' }}>
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
    <Tabs style={{border: 'none', padding: '1rem'}}>
      <RowBetween style={{ padding: '1rem' }}>
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
