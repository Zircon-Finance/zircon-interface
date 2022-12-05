import { Currency, Pair } from 'zircon-sdk'
import React, { useState, useCallback } from 'react'
import styled, { useTheme } from 'styled-components'
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
import { Text } from 'rebass'
import { useIsDarkMode } from '../../state/user/hooks'

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
  height: 100%;
  font-weight: 200;
  background-color: ${({ selected, theme }) => (selected ? theme.badgeSmall : theme.inputSelect1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.blackBrown)};
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
    background-color: ${({ theme, selected }) => !selected ? theme.meatPinkBrown : theme.darkMode ? '#513642' : '#E5D9DB'};
    color: ${({ theme, selected }) => !selected ? '#fff' : theme.darkMode ? '#fff' : theme.blackBrown};
    path {
      stroke: #fff;
    }
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
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0 0 10px;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.whiteHalf : theme.blackBrown)};
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
  background-color: ${({ theme }) => theme.darkMode ? theme.blackBrown : theme.bg6};
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 5px;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  16px;
  align-self: center;

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
  color: ${({ theme }) => theme.hoveredButton};

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
  isFloat?: boolean
  price? : number
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
  isFloat,
  style,
  price,
  showCommonBases
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [focus, setIsFocus] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const theme = useTheme()
  const darkMode = useIsDarkMode()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput} style={{boxShadow: focus ? `0px 0px 1px 1px ${theme.pinkGamma}` : 'none'}}>
        {!hideInput && (
          <LabelRow>
            <RowBetween style={{display: 'flex', flexFlow: 'column'}}>
              <div style={{display: 'flex', width: '100%'}}>
                <CurrencySelect
                selected={!!currency}
                style={{border: !darkMode ? !currency ? `1px solid ${theme.bg8}` : `1px solid rgba(0,0,0,0.2)` : 'none'}}
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
                        : currency?.symbol) || <p style={{height: '24px', margin: 0}}>{t("selectToken")}</p>}
                    </StyledTokenName>
                  )}
                  {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
                </Aligner>
              </CurrencySelect>
                <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
                {!hideInput && (
                  <>
                    <NumericalInput
                      currency={currency}
                      onFocus={()=>setIsFocus(true)}
                      onBlur={()=>setIsFocus(false)}
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
                  color={theme.text2}
                  fontWeight={400}
                  fontSize={14}
                  style={{ display: 'flex',
                           justifyContent: 'space-between',
                           width: '100%',
                           padding: showMaxButton ? '0px' : !hideBalance && '10px 0 5px 5px'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', fontSize: '13px', marginTop: showMaxButton ? '10px' : '0px'
                , color: theme.whiteHalf}}>
                  {account && currency && showMaxButton && label !== 'To' && (
                  <StyledBalanceMax onClick={onMax} style={{cursor: 'pointer'}}>MAX</StyledBalanceMax>
                  )}
                  <Text color={theme.whiteHalf}>
                    {!hideBalance && !!currency && selectedCurrencyBalance
                    ? 'Balance: ' + selectedCurrencyBalance?.toSignificant(6)
                    : !hideBalance && ' -'}
                  </Text>
                  </div>
                  {currency && !hideBalance &&
                  <Text style={{paddingRight: '0.75rem', alignSelf: 'center', marginTop: showMaxButton ? '10px' : '0px'}} color={theme.whiteHalf}>
                    {`${price && (price*parseFloat(selectedCurrencyBalance?.toFixed(6))).toFixed(2) || ''} ${price > 0 ? `$` : ''}` /* This was added, it's supposed to convert to $ */}
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
