import { Currency, Pair } from 'moonbeamswap'
import React, { useState, useContext, useCallback } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { useActiveWeb3React } from '../../hooks'
import { useTranslation } from 'react-i18next'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;

  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  background-color: ${({ theme }) => theme.bg2};
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};

`

const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.primary5};
  border: 1px solid ${({ theme }) => theme.primary5};
  border-radius: 0.5rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.primaryText1};
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface CurrencyInputPanelProps {
    value: string
    onUserInput: (value: string) => void
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrency1Select?: (currency: Currency) => void
    onCurrency2Select?: (currency: Currency) => void
    currencyA?: Currency | null
    currencyB?: Currency | null
    disableCurrencySelect?: boolean
    hideBalance?: boolean
    pair?: Pair | null
    hideInput?: boolean
    otherCurrency?: Currency | null
    id: string
    showCommonBases?: boolean
}

export default function CurrencyInputPanel({
                                               value,
                                               onUserInput,
                                               onMax,
                                               showMaxButton,
                                               label = 'Input',
                                               onCurrency1Select,
                                               onCurrency2Select,
                                               currencyA,
                                               currencyB,
                                               disableCurrencySelect = false,
                                               hideBalance = false,
                                               pair = null, // used for double token logo
                                               hideInput = false,
                                               otherCurrency,
                                               id,
                                               showCommonBases
                                           }: CurrencyInputPanelProps) {
    const { t } = useTranslation()

    const [modalOpen, setModalOpen] = useState<string | null>(null)
    const { account } = useActiveWeb3React()

    const selectedCurrencyBalanceB = useCurrencyBalance(account ?? undefined, currencyB ?? undefined)

    const theme = useContext(ThemeContext)

    const handleDismissSearch = useCallback(() => {
        setModalOpen(null)
    }, [setModalOpen])

    const getCurrencySelect = (id: string, currency?: Currency | null) => {
        return (
            <CurrencySelect
                selected={currency !== null}
                className="open-currency-select-button"
                onClick={() => {
                    if (!disableCurrencySelect) {
                        setModalOpen(id)
                    }
                }}
            >
                <Aligner>
                    {pair ? (
                        <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                    ) : currency ? (
                        <CurrencyLogo currency={currency} size={'24px'} />
                    ) : null}
                    {pair ? (
                        <StyledTokenName className="pair-name-container">
                            {pair?.token0.symbol}:{pair?.token1.symbol}
                        </StyledTokenName>
                    ) : (
                        <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                            {(currency && currency.symbol && currency.symbol.length > 20
                                ? currency.symbol.slice(0, 4) +
                                '...' +
                                currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                                : currency?.symbol) || t('selectToken')}
                        </StyledTokenName>
                    )}
                    {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
                </Aligner>
            </CurrencySelect>
        )
    }


    const handleSelect = (currency: Currency) => {
      if (modalOpen === "1") {
          if (onCurrency1Select) {
              onCurrency1Select(currency)
          }
      }else if (modalOpen === "2") {
          if (onCurrency2Select) {
              onCurrency2Select(currency)
          }
      }
    }

    return (
        <InputPanel id={id}>
            <div style={{width: 100, padding: 12}}>
            {getCurrencySelect("1", currencyA)}
            </div>
            <Container hideInput={hideInput}>
                {!hideInput && (
                    <LabelRow>
                        <RowBetween>
                            <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                                {label}
                            </TYPE.body>
                            {account && (
                                <TYPE.body
                                    onClick={onMax}
                                    color={theme.text2}
                                    fontWeight={500}
                                    fontSize={14}
                                    style={{ display: 'inline', cursor: 'pointer' }}
                                >
                                    {!hideBalance && !!currencyB && selectedCurrencyBalanceB
                                        ? 'Balance: ' + selectedCurrencyBalanceB?.toSignificant(6)
                                        : ' -'}
                                </TYPE.body>
                            )}
                        </RowBetween>
                    </LabelRow>
                )}
                <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
                    {!hideInput && (
                        <>
                            <NumericalInput
                                className="token-amount-input"
                                value={value}
                                onUserInput={val => {
                                    onUserInput(val)
                                }}
                            />
                            {account && currencyB && showMaxButton && label !== 'To' && (
                                <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
                            )}
                        </>
                    )}
                    {getCurrencySelect("2", currencyB)}
                </InputRow>
            </Container>
            {!disableCurrencySelect && onCurrency2Select && (
                <CurrencySearchModal
                    isOpen={modalOpen !== null}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={handleSelect}
                    selectedCurrency={modalOpen === "1" ? currencyA : currencyB}
                    otherSelectedCurrency={otherCurrency}
                    showCommonBases={showCommonBases}
                />
            )}
        </InputPanel>
    )
}
