import styled, { css, keyframes } from 'styled-components'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import SearchIcon from '../../assets/svg/Search.svg'

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
`

export const PaddedColumn = styled(AutoColumn)`
  padding: 20px;
  padding-bottom: 12px;
`

export const MenuItem = styled(RowBetween)`
  padding: 4px 20px;
  height: auto;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.bg7};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

const expandAnimation = keyframes`
  from {
    width: 0%;
    opacity: 0;
  }
  to {
    width: 100%;
    opacity: 1;
  }
`

const collapseAnimation = keyframes`
  from {
    width: 100%;
    opacity: 1;
  }
  to {
    width: 0%;
    opacity: 0;
  }
`

export const SearchInput = styled.input<{ expanded }>`
animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  position: relative;
  display: flex;
  padding: 18px 40px 18px 20px;
  align-items: center;
  width: 100%;
  background: url(${SearchIcon});
  background-repeat: no-repeat;
  background-position: right;
  background-position-x: 95%;
  ::placeholder {
    color: white;
  }
  white-space: nowrap;
  background-color: ${({ theme}) => theme.bg9};
  border: 1px solid transparent;
  outline: none;
  border-radius: 17px;
  color: white;
  -webkit-appearance: none;
  transition: all 1s;

  font-size: 16px;
  transition: border 100ms;
  :focus {
    border: 1px solid ${({ theme }) => theme.bg6};
    outline: none;
    background-color: ${({ theme}) => theme.bg1}
  }
`
export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg6};
`

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`
