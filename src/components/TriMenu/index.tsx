import React, { useRef } from 'react'
import { MoreHorizontal } from 'react-feather'
import styled from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { AutoColumn } from '../Column'
import { useSettingsMenuOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import { Link } from 'react-router-dom'
import { Button } from 'rebass'

const StyledMenuIcon = styled(MoreHorizontal)`
  height: 20px;
  width: 40px;

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.bg1};
  margin-right: 10px;
  height: 100%;
  padding: 15px;
  border-radius: 20px;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg9};
  }

  svg {
    margin-top: 2px;
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
  box-shadow: 0px 0px 30px rgba(34, 18, 55, 0.5);
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: -100px;
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

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <StyledMenuIcon strokeWidth={2} />
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="sm" style={{padding: '5px'}} >
            <ButtonEmpty style={{fontWeight: 400}} as={Link} to={'/add/ETH'} onClick={() => toggle()}>Classic Liquidity</ButtonEmpty>
            <ButtonEmpty style={{fontWeight: 400}} as={Link} to={'/pool'}onClick={() => {
              toggle()
              window.open('https://docs.zircon.finance', '_blank');
            }}>Learn</ButtonEmpty>

          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
