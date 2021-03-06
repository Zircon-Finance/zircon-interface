import { Currency, Pair } from 'zircon-sdk'
import React, { useState, useContext, useCallback } from 'react'
import styled, { ThemeContext } from 'styled-components'
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
  align-items: end;
  width: 100%;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 3rem;
  padding-left: 10px;
  font-size: 16px;
  font-weight: 200;
  background-color: ${({ selected, theme }) => (selected ? theme.bg7 : '#A987C2')};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 10px;
  transition: all 0.2s;

  :focus,
  :hover {
    background-color: ${({ theme }) => theme.bg10};
    color: white !important;
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 5px;
  span:hover {
    cursor: pointer;
    color: white;
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
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '17px')};
  background-color: transparent;
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '17px')};
  background-color: ${({ theme }) => theme.bg6};
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.75rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  16px;
  align-self: center;

`

const StyledBalanceMax = styled.button`
  height: 30px;
  width: 50px;
  padding: 6px 10px 7px;
  background-color: #68597B;
  border: 0;
  letter-spacing: 0.05em
  border-radius: 0.9rem;
  font-size: 10px;
  outline: none;
  border-radius: 27px;
  font-weight: 300;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.primaryText1};

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
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  style?: React.CSSProperties
  showCommonBases?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  style,
  showCommonBases
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const theme = useContext(ThemeContext)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween style={{display: 'flex', flexFlow: 'column'}}>
              <div style={{display: 'flex', width: '100%'}}>
                <CurrencySelect
                selected={!!currency}
                className="open-currency-select-button"
                onClick={() => {
                  if (!disableCurrencySelect) {
                    setModalOpen(true)
                  }
                }}
              >
                <Aligner style={{width: 'max-content'}}>
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
                <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
                {!hideInput && (
                  <>
                    <NumericalInput
                      style={{textAlign: 'end'}}
                      className="token-amount-input"
                      value={value}
                      onUserInput={val => {
                        onUserInput(val)
                      }}
                    />
                  </>
                )}

              </InputRow>
              </div>
              {account && currency && (
                <TYPE.body
                  onClick={onMax}
                  color={theme.text2}
                  fontWeight={400}
                  fontSize={14}
                  style={{ display: 'flex',
                           cursor: 'pointer',
                           justifyContent: 'space-between',
                           width: '100%',
                           padding: showMaxButton ? '0px' : !hideBalance && '10px 0 5px 5px'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', fontSize: '13px', marginTop: showMaxButton ? '10px' : '0px'}}>
                  {account && currency && showMaxButton && label !== 'To' && (
                  <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
                  )}
                  {!hideBalance && !!currency && selectedCurrencyBalance
                    ? 'Balance: ' + selectedCurrencyBalance?.toSignificant(6)
                    : !hideBalance && ' -'}
                  </div>
                  {currency && !hideBalance &&
                  <div style={{paddingRight: '0.75rem', alignSelf: 'center', marginTop: showMaxButton ? '10px' : '0px'}}>
                    {'0$' /* This was added, it's supposed to convert to $ */}
                  </div>
                  }
                </TYPE.body>
              )}
            </RowBetween>
          </LabelRow>
        )}
      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  )
}
