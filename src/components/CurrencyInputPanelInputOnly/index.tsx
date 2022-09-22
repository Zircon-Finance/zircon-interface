import { Currency, Pair } from 'zircon-sdk'
import React, { useState, useCallback } from 'react'
import styled, { useTheme } from 'styled-components'

import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
// import { RowBetween } from '../Row'

import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from '../../hooks'
import { useIsDarkMode } from '../../state/user/hooks'



const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  font-size: 16px;
  font-weight: 200;
  background-color: ${({ selected, theme }) => (selected ? theme.badgeSmall : theme.inputSelect1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.blackBrown)};
  border-radius: 17px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  width: 100%;
  padding-left: 10px;
  height: 100%;

  :focus,
  :hover {
    background-color: ${({ theme, selected }) => !selected ? theme.poolPinkButton : theme.darkMode ? '#513642' : '#E5D9DB'};
    color: '${({ theme, selected }) => !selected ? '#fff' : theme.darkMode ? '#fff' : theme.blackBrown}';
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
  height: 100%;
  line-height: 1rem;
  padding: 0;
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
  margin: 0;
  height: 35%;

  @media (min-width: 700px) {
    margin: 0 0 0 10px;
  }

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.whiteHalf : theme.blackBrown)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  width: 50%;
  margin: 0 5px;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  z-index: 1;
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '17px')};
  background-color: ${({ theme }) => theme.anchorFloatBadge};
  height: 100%;
  width: 100%;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem')}
  font-size:  13px;
  align-self: center;
  text-align: left;
  display: flex;
  flex-flow: column;
  align-items: center;
  @media (min-width: 500px) {
    font-size: 16px;
    flex-flow: row;
    ${({ active }) => (active ? '  margin: 0 0.75 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem')}
  }
`


interface CurrencyInputPanelProps {
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
  anchor?: boolean
  price?: number
}

export default function CurrencyInputPanel({
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
  anchor,
  price,
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)


  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const darkMode = useIsDarkMode()
  const [hovered, setHovered] = useState(false)

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            {/* <RowBetween style={{display: 'flex', flexFlow: 'column'}}> */}
            {/* <span style={{alignSelf: 'start',padding: '5px 5px 5px 10px', fontSize: '10px', letterSpacing: '0.05em'}}>{anchor ? 'ANCHOR' : 'FLOAT'}</span> */}
            {/* <div style={{display: 'flex', width: '100%'}}> */}
            <CurrencySelect
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{border: !darkMode ? !currency ? `1px solid ${theme.bg8}` : `1px solid rgba(0,0,0,0.2)` : 'none'}}
              selected={!!currency}
              className="open-currency-select-button"
              onClick={() => {
                if (!disableCurrencySelect) {
                  setModalOpen(true);
                }
              }}
            >
              <Aligner>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {pair ? (
                    <DoubleCurrencyLogo
                      currency0={pair.token0}
                      currency1={pair.token1}
                      size={24}
                      margin={true}
                    />
                  ) : currency ? (
                    <CurrencyLogo currency={currency} size={"24px"} />
                  ) : null}
                  {pair ? (
                    <StyledTokenName className="pair-name-container">
                      {pair?.token0.symbol}:{pair?.token1.symbol}
                    </StyledTokenName>
                  ) : (
                    <StyledTokenName
                      className="token-symbol-container"
                      active={Boolean(currency && currency.symbol)}
                    >
                      {(currency &&
                      currency.symbol &&
                      currency.symbol.length > 20 ? (
                        currency.symbol.slice(0, 4) +
                        "..." +
                        currency.symbol.slice(
                          currency.symbol.length - 5,
                          currency.symbol.length
                        )
                      ) : (
                        <>
                          <p
                            style={{
                              margin: width >= 500 ? "10px 0" : "0 0 0 0",
                              width: '100%',
                              alignSelf: 'center',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {currency?.symbol}
                          </p>
                          <span
                            style={{
                              width: '100%',
                              color: hovered ? theme.darkMode ? theme.cardLightBorder : currency ? theme.blackBrown : theme.cardLightBorder : !currency ? theme.blackBrown : theme.whiteHalf,
                              marginLeft: width <= 500 ? '0' : "5px",
                              fontSize: width > 500 ? "16px" : "13px",
                            }}
                          >
                            {anchor ? "STABLE" : "FLOAT"}
                          </span>
                        </>
                      )) || <p>{t("selectToken")}</p>}
                    </StyledTokenName>
                  )}
                </div>
                {!disableCurrencySelect && (
                  <StyledDropDown selected={!!currency} style={{}} />
                )}
              </Aligner>
            </CurrencySelect>
            {/* </div> */}
            {/* Line below should be {account && ( */}
            {/* </RowBetween> */}
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
          isFloat={!anchor}
        />
      )}
    </InputPanel>
  );
}
