import { Currency, Pair } from 'zircon-sdk'
import React, { useState, useContext, useCallback } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { useTranslation } from 'react-i18next'

import { useActiveWeb3React } from '../../hooks'
import CurrencyLogo from '../CurrencyLogo'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: end;
  width: 100%;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 0' : '0.75rem 0.75rem 0.75rem 0')};
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

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '17px')};
  background-color: ${({ theme }) => theme.bg2};
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '17px')};
  background-color: ${({ theme }) => theme.bg6};
`

const StyledBalanceMax = styled.button`
  height: 30px;
  width: 50px;
  padding: 0 0.55rem 0 0.55rem;
  background-color: ${({ theme }) => theme.bg9};
  border: 0;
  border-radius: 0.9rem;
  font-size: 0.675rem;
  outline: none;

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
  currency?: any
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  style?: React.CSSProperties
  showCommonBases?: boolean
  isFloat?: boolean
  sync?: string
  exists?: boolean
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
  showCommonBases,
  isFloat,
  sync,
  exists
}: CurrencyInputPanelProps) {

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const theme = useContext(ThemeContext)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const { t } = useTranslation()

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween style={{display: 'flex', flexFlow: 'column'}}>
              <div style={{display: 'flex', width: '100%'}}>
                <InputRow style={hideInput ? { alignItems: 'center', padding: '0', borderRadius: '8px' } : {alignItems: 'center'}} selected={disableCurrencySelect}>
                {!hideInput && (
                  <>
                  <div style={{display: 'flex', flexFlow:'column', border: `2px solid ${theme.bg11}`, borderRadius: '12px'}}>
                  <span style={{padding: '10px 12px 10px 12px', fontWeight:400}}>
                    {!isFloat? 'ANCHOR' : 'FLOAT'}
                  </span>
                    <div style={{display: 'flex', justifyContent: 'center', borderTop: `2px solid ${theme.bg11}`, borderRadius: '12px'}}>
                      <span style={{padding: '12px 5px 12px 12px'}}>
                        <CurrencyLogo currency={currency} size={'30px'} />
                        </span>
                      <span style={{fontSize: '15px', alignSelf: 'center', paddingRight: '12px'}}>
                        {(currency && currency.symbol && currency.symbol.length > 20
                          ? currency.symbol.slice(0, 4) +
                          '...' +
                          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                          : currency?.symbol) || t('selectToken')}
                      </span>
                    </div>
                  </div>

                    <NumericalInput
                      style={{textAlign: 'end'}}
                      className="token-amount-input"
                      value={value}
                      onUserInput={val => {
                        (!isFloat || sync !== 'half' || !exists) && onUserInput(val)
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
                           padding: showMaxButton ? '10px 0 0 0' : '10px 0 5px 5px'
                  }}
                >
                  <div>
                  {account && currency && showMaxButton && label !== 'To' && (
                  <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
                  )}
                  {!hideBalance && !!currency && selectedCurrencyBalance
                    ? 'Balance: ' + selectedCurrencyBalance?.toSignificant(6)
                    : ' -'}
                  </div>
                  {currency &&
                  <div style={{paddingRight: '0.75rem', alignSelf: 'center'}}>
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
