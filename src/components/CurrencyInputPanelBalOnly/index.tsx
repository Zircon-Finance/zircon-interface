import { Currency, Pair } from 'zircon-sdk'
import React, { useState, useCallback } from 'react'
import styled, { useTheme } from 'styled-components'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { useTranslation } from 'react-i18next'

import { useActiveWeb3React, useWindowDimensions } from '../../hooks'
import CurrencyLogo from '../CurrencyLogo'
import { Text } from 'rebass'
import { Dots } from '../../pages/Pool/styleds'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: end;
  width: 100%;
  padding: ${({ selected }) => (selected ? '0 0.5rem 0.75rem 0' : '0 0.75rem 0.75rem 0')};
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 10px;
  line-height: 1rem;
  padding: 5px;
  span:hover {
    cursor: pointer;
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
  background-color: ${({ theme }) => theme.darkMode ? theme.liquidityBg : '#F5F3F3'};
`

const StyledBalanceMax = styled.button`
  height: 30px;
  width: 50px;
  background-color: ${({ theme }) => theme.maxButton};
  &:hover {
    background-color: ${({ theme }) => theme.maxButtonHover};
  }
  border: 0;
  letter-spacing: 0.05em
  border-radius: 0.9rem;
  font-size: 13px;
  outline: none;
  border-radius: 27px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.darkMode ? '#CA90BB' : '#9E4D86'};

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
  price?: number
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
  exists,
  price
}: CurrencyInputPanelProps) {

  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useActiveWeb3React()
  const [focus, setIsFocus] = useState(false)

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput} style={{boxShadow: focus ? `0px 0px 1px 1px ${theme.pinkGamma}` : 'none'}}>
        {!hideInput && (
          <LabelRow>
            <RowBetween style={{display: 'flex', flexFlow: 'column'}}>
              <div style={{display: 'flex', width: '100%'}}>
                <InputRow style={hideInput ? { alignItems: 'center', padding: '0', borderRadius: '8px' } : {alignItems: 'center'}} selected={disableCurrencySelect}>
                {!hideInput && (
                  <>
                      <span style={{padding: '5px 10px 0px 5px'}}>
                        <CurrencyLogo currency={currency} size={'30px'} chainId={chainId} />
                        </span>
                      <span style={{fontSize: '16px', alignSelf: 'center', paddingRight: '5px', fontWeight: 500}}>
                        {(currency && currency.symbol && currency.symbol.length > 20
                          ? currency.symbol.slice(0, 4) +
                          '...' +
                          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                          : currency?.symbol) || t('selectToken')}
                      </span>
                      <span style={{fontSize: width < 700 ? '13px' : '16px', color: theme.darkMode ? 'rgba(255, 255, 255, 0.9' : '#080506', fontWeight: 500}}>
                        {isFloat ? 'Float' : 'Stable'}
                      </span>

                    <NumericalInput
                      currency={currency}
                      onFocus={()=>setIsFocus(true)}
                      onBlur={()=>setIsFocus(false)}
                      style={{background: 'transparent', textAlign: 'end'}}
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
                  color={theme.text2}
                  fontWeight={400}
                  fontSize={14}
                  style={{ display: 'flex',
                           justifyContent: 'space-between',
                           width: '100%',
                           padding: showMaxButton ? '0px' : '10px 0 5px 5px'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', fontSize: '13px'}}>
                  {account && currency && showMaxButton && label !== 'To' && (
                  <StyledBalanceMax onClick={onMax} style={{cursor: 'pointer'}}>MAX</StyledBalanceMax>
                  )}
                  <Text color={theme.darkMode ? '#9C8F95' : '#6A6768'}>
                    {!hideBalance && !!currency && selectedCurrencyBalance
                    ? 'Balance: ' + selectedCurrencyBalance?.toSignificant(6)
                    : ' -'}
                  </Text>
                  </div>
                  {currency &&
                  <Text style={{paddingRight: '0.75rem', alignSelf: 'center', marginTop: showMaxButton ? '10px' : '0px'}} color={theme.whiteHalf}>
                  {Number.isNaN(parseFloat(selectedCurrencyBalance?.toFixed(Math.min(6, currency?.decimals)))) && <Dots>{'Loading'}</Dots>}
                    {`${price && !Number.isNaN(parseFloat(selectedCurrencyBalance?.toFixed(Math.min(6, currency?.decimals)))) &&
                     (value === '' ? '~'+(price*parseFloat(selectedCurrencyBalance?.toFixed(Math.min(6, currency?.decimals)))).toFixed(2) :
                     (price*parseFloat(value)).toFixed(2))
                    || ''} ${price > 0 && !Number.isNaN(parseFloat(selectedCurrencyBalance?.toFixed(Math.min(6, currency?.decimals)))) ? `$` : ''}`}
                </Text>
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
          chainId={chainId}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          isFloat={isFloat}
        />
      )}
    </InputPanel>
  )
}
