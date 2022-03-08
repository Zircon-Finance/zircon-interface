import styled from 'styled-components'
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
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.bg6};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

export const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 18px 20px;
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
  background-color: ${({ theme}) => theme.bg14};
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
    background-color: ${({ theme}) => theme.bg10}
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
