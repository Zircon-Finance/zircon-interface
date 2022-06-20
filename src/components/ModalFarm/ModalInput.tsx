import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Text, InputProps, Flex } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { parseUnits } from '@ethersproject/units'
import { formatBigNumber } from '../../utils/formatBalance'
import { ButtonOutlined } from '../Button'

interface ModalInputProps {
  max: string
  symbol: string
  onSelectMax?: () => void
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  value: string
  addLiquidityUrl?: string
  inputTitle?: string
  decimals?: number
}

const getBoxShadow = ({ isWarning = false, theme }) => {
  if (isWarning) {
    return theme.shadows.warning
  }

  return theme.shadows.inset
}

const StyledTokenInput = styled.div<InputProps>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 16px;
  box-shadow: ${getBoxShadow};
  color: ${({ theme }) => theme.text1};
  width: 100%;
  padding: 12px;
`

const StyledInput = styled.input`
  box-shadow: none;
  border: none;
  font-size: 24px;
  background: transparent;
  width: 60%;
  color: ${({ theme }) => theme.text1};
  border-radius: 5px;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.bg1};
  }
`

export const StyledErrorMessage = styled(Text)`
  text-align: center;
  margin-top: 15px;
  a {
    display: inline;
  }
`

const ModalInput: React.FC<ModalInputProps> = ({
  max,
  symbol,
  onChange,
  onSelectMax,
  value,
  addLiquidityUrl,
  inputTitle,
  decimals = 18,
}) => {
  const { t } = useTranslation()
  const isBalanceZero = max === '0' || !max

  const displayBalance = (balance: string) => {
    if (isBalanceZero) {
      return '0'
    }

    const balanceUnits = parseUnits(balance, decimals)
    return formatBigNumber(balanceUnits, decimals, decimals)
  }
  const theme = useTheme()

  return (
    <div style={{ position: 'relative' }}>
      <StyledTokenInput isWarning={isBalanceZero}>
        <Flex style={{fontSize: '24px'}} justifyContent="space-between" mb={'20px'}>
        <StyledInput
            pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
            inputMode="decimal"
            step="any"
            min="0"
            onChange={onChange}
            placeholder="0"
            value={value}
          />
          <Text fontSize="16px" color={theme.text1}>{symbol}</Text>
        </Flex>
        <Flex alignItems="flex-end" justifyContent="space-between">
        <Text fontSize="13px" color={theme.whiteHalf}>{'Balance: '+ displayBalance(max)}</Text>
          <ButtonOutlined width={'55px'} height={'30px'} padding={'0px'} onClick={onSelectMax}>
            {t('MAX')}
          </ButtonOutlined>
        </Flex>
      </StyledTokenInput>
    </div>
  )
}

export default ModalInput
