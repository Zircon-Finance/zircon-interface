import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useWindowDimensions } from '../../hooks'
import { useUserFarmsFilterAnchorFloat, useUserFarmsFilterPylonClassic, useUserFarmsViewMode } from '../../state/user/hooks'
import { FarmFilter, FarmFilterAnchorFloat, ViewMode } from '../../state/user/actions'
import CardIcon from '../ViewCardIcon'
import TableIcon from '../ViewTableIcon'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 12px;
  justify-content: space-evenly;
  padding: 5px;
  margin: auto;
  background: ${({ theme }) => theme.anchorFloatBadge};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  font-weight: 400;
  justify-content: center;
  height: auto;
  border-radius: 7px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  font-size: 13px;
  padding: 6px 10px;
  width: 50%;

  &.${activeClassName} {
    border-radius: 7px;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.positionsButtons};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
  @media (min-width: 700px) {
    width: auto;
  }
`

export function PylonClassicTab({ active }: { active: 'PYLON' | 'CLASSIC' }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [filter, setuserFarmsFilterPylonClassic] = useUserFarmsFilterPylonClassic()

  return (
    <Tabs style={{ marginRight: '20px', width: width > 700 ? 'auto' : '100%' }}>
      <StyledNavLink id={`pylon-select-tab`} to={'#'} 
        onClick={()=> {setuserFarmsFilterPylonClassic(FarmFilter.PYLON)}} 
        isActive={() => filter === FarmFilter.PYLON}>
        {t('PYLON')}
      </StyledNavLink>
      <StyledNavLink id={`classic-select-tab`} to={'#'} 
        onClick={()=> {setuserFarmsFilterPylonClassic(FarmFilter.CLASSIC)}} 
        isActive={() => filter === FarmFilter.CLASSIC}>
        {t('CLASSIC')}
      </StyledNavLink>
    </Tabs>
  )
}

export function AnchorFloatTab({ active }: { active: 'ALL' | 'ANCHOR' | 'FLOAT' }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [filter, setuserFarmsFilterAnchorFloat] = useUserFarmsFilterAnchorFloat()

  return (
    <Tabs style={{ width: width > 700 ? 'auto' : '100%' }}>
      <StyledNavLink id={`all-select-tab`} to={'#'} 
        onClick={()=> {setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.ALL)}} 
        isActive={() => filter === FarmFilterAnchorFloat.ALL}>
        {t('All')}
      </StyledNavLink>
      <StyledNavLink id={`anchor-select-tab`} to={'#'} 
        onClick={()=> {setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.ANCHOR)}} 
        isActive={() => filter === FarmFilterAnchorFloat.ANCHOR}>
        {t('Anchor')}
      </StyledNavLink>
      <StyledNavLink id={`float-select-tab`} to={'#'} 
        onClick={()=> {setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.FLOAT)}} 
        isActive={() => filter === FarmFilterAnchorFloat.FLOAT}>
        {t('Float')}
      </StyledNavLink>
    </Tabs>
  )
}

export function ViewModeTabs({ active }: { active: 'TABLE' | 'CARD'}) {
  const [viewMode, setViewMode] = useUserFarmsViewMode()

  return (
    <div style={{width: '100%'}}>
      <Tabs style={{ width: '100px', margin: viewMode === ViewMode.TABLE ? '10px 0 0 10px' : '10px 0 10px 10px' }}>
        <StyledNavLink
          id={`anchor-select-tab`} to={'#'}
          onClick={()=> {setViewMode(ViewMode.TABLE)}} 
          isActive={() => viewMode === ViewMode.TABLE}>
          <TableIcon />
        </StyledNavLink>
        <StyledNavLink id={`all-select-tab`} to={'#'} 
          onClick={()=> {setViewMode(ViewMode.CARD)}} 
          isActive={() => viewMode === ViewMode.CARD}>
          <CardIcon />
        </StyledNavLink>
      </Tabs>
    </div>
    
  )
}

export function FarmTabButtons({ active }: { active: 'Active' | 'Finished'}) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions();

  const { hash } = window.location

  return (
    <Tabs style={{padding: '5px',  width: width > 700 ? 'auto' : '100%' }}>
      <StyledNavLink id={`live-farms-select`} to={'/farm'} 
        isActive={() => hash === '#/farm'}>
        {t('Active')}
      </StyledNavLink>
      <StyledNavLink id={`finished-farms-select`} to={'/farm/history'} 
        isActive={() => hash === '#/farm/history'}>
        {t('Finished')}
      </StyledNavLink>
    </Tabs>
  )
}