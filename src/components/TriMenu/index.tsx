import React, { useRef } from 'react'
import { MoreHorizontal } from 'react-feather'
import styled, { useTheme } from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { AutoColumn } from '../Column'
import { useSettingsMenuOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import { Link } from 'react-router-dom'
import { Button } from 'rebass'

const StyledMenuIcon = styled(MoreHorizontal)`
  height: 20px;
  width: 40px;

  > * {
    stroke: ${({ theme }) => theme.pinkBrown};
  }
`

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.inputSecondary};
  margin: 0;
  padding: 0;
  border: none;
  margin-right: 5px;
  padding: 20px 0 15px 0;
  border-radius: 17px;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg12};
  }

  svg {
    margin-top: 2px;
    stroke: ${({ theme }) => theme.meatPink};
  }
`

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 11rem;
  background-color: ${({ theme }) => theme.bg14};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: -110px;
  left: 0rem;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 18.125rem;
    right: -46px;
  `};
`

const ButtonEmpty = styled(Button)`
  background-color: transparent;
  color: #FFF;
  border-radius: 15px;
  display: flex;
  padding: 10px 15px;
  font-size: 16px;
  text-decoration: none;
  font-weight: 300;
  justify-content: flex-start;
  align-items: center;

  &:focus {
    background-color: ${({ theme }) => theme.advancedBG};
  }
  &:hover {
    background-color: ${({ theme }) => theme.advancedBG};
  }
  &:active {
    background-color: ${({ theme }) => theme.advancedBG};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export default function TriMenu() {
  const node = useRef<HTMLDivElement>()
  const open = useSettingsMenuOpen()
  const toggle = useToggleSettingsMenu()
  const theme = useTheme()

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button" className="tri-menu">
        <StyledMenuIcon strokeWidth={2} />
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="sm" style={{padding: '5px'}} >
            <ButtonEmpty style={{fontWeight: 400, color: theme.pinkBrown}} as={Link} to={'/add/'} onClick={() => toggle()}>Classic Liquidity</ButtonEmpty>
            <ButtonEmpty style={{fontWeight: 400, color: theme.pinkBrown}} as={Link} to={'/pool'}onClick={() => {
              toggle()
              window.open('https://docs.diffuse.finance', '_blank');
            }}>Learn</ButtonEmpty>

          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
