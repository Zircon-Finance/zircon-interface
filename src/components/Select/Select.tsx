import React, { useState, useRef } from 'react'
import styled, { css, useTheme } from 'styled-components'
import { Box, BoxProps, Text } from '@pancakeswap/uikit'
import { ChevronDown } from 'react-feather'

const DropDownHeader = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
  box-shadow: ${({ theme }) => theme.shadows.inset};
  border-radius: 16px;
  background: ${({ theme }) => theme.cardExpanded};
  transition: border-radius 0.15s;
`

const DropDownListContainer = styled.div`
  min-width: 136px;
  height: 0;
  position: absolute;
  overflow: hidden;
  background: ${({ theme }) => theme.anchorFloatBadge};
  transition: transform 0.15s, opacity 0.15s;
  transform: scaleY(0);
  transform-origin: top;
  opacity: 0;
  width: 100%;

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 168px;
  }
`

const DropDownContainer = styled(Box)<{ isOpen: boolean }>`
  cursor: pointer;
  width: 100%;
  position: relative;
  border-radius: 16px;
  height: 40px;
  min-width: 136px;
  user-select: none;
  z-index: 20;

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 168px;
  }

  ${(props) =>
    props.isOpen &&
    css`
      ${DropDownHeader} {
        border-radius: 16px 16px 0 0;
      }

      ${DropDownListContainer} {
        height: auto;
        transform: scaleY(1);
        opacity: 1;
        border-top-width: 0;
        border-radius: 0 0 16px 16px;
      }
    `}

  svg {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }
`

const DropDownList = styled.ul`
  padding: 0;
  margin: 0;
  box-sizing: border-box;
`

const ListItem = styled.li`
  list-style: none;
  padding: 8px 16px;
  &:hover {
    background: ${({ theme }) => theme.bg6};
  }
`

export interface SelectProps extends BoxProps {
  options: OptionProps[]
  onOptionChange?: (option: OptionProps) => void
  placeHolderText?: string
  defaultOptionIndex?: number
}

export interface OptionProps {
  label: string
  value: any
}

const Select: React.FunctionComponent<SelectProps> = ({
  options,
  onOptionChange,
  defaultOptionIndex = 0,
  placeHolderText,
  ...props
}) => {
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [optionSelected, setOptionSelected] = useState(false)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(defaultOptionIndex)
  const theme = useTheme()
  const onOptionClicked = (selectedIndex: number) => () => {
    setSelectedOptionIndex(selectedIndex)
    setIsOpen(false)
    setOptionSelected(true)

    if (onOptionChange) {
      onOptionChange(options[selectedIndex])
    }
  }

  return (
    <DropDownContainer isOpen={isOpen} {...props}>
      <DropDownHeader onClick={() => setIsOpen(!isOpen)}>
        <Text color={!optionSelected && placeHolderText ? 'text' : undefined}>
          {!optionSelected && placeHolderText ? placeHolderText : options[selectedOptionIndex].label}
        </Text>
      </DropDownHeader>
      <ChevronDown color={theme.whiteHalf} />
      <DropDownListContainer>
        <DropDownList ref={dropdownRef}>
          {options.map((option, index) =>
            placeHolderText || index !== selectedOptionIndex ? (
              <ListItem onClick={onOptionClicked(index)} key={option.label}>
                <Text>{option.label}</Text>
              </ListItem>
            ) : null,
          )}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  )
}

export default Select
