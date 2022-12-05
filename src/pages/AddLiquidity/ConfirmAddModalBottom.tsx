import { Currency, CurrencyAmount, Fraction, Percent } from 'zircon-sdk'
import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'
import { Separator } from '../../components/SearchModal/styleds'
import { AlertTriangle } from 'react-feather'
import styled, { useTheme } from 'styled-components'

export const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.red1};
  height: 40px;
  width: 90px;
`

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
  errorTx
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
  errorTx?: string
}) {
  const theme = useTheme()
  return (
    <>
      <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_A]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <TYPE.body style={{overflow: 'auto'}}>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_B]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <TYPE.body style={{overflow: 'auto'}}>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>
      <Separator />
      <RowBetween>
        <TYPE.smallerBody>Rates</TYPE.smallerBody>
        <TYPE.smallerBody>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </TYPE.smallerBody>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>
        <TYPE.smallerBody>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </TYPE.smallerBody>
      </RowBetween>
      <RowBetween>
        <TYPE.smallerBody>Share of Pool:</TYPE.smallerBody>
        <TYPE.smallerBody>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</TYPE.smallerBody>
      </RowBetween>
      {errorTx && (
        <RowBetween mt={10}>
          <StyledWarningIcon />
          <span style={{ color: theme.red1, width: '100%', fontSize: '13px' }}>{errorTx}</span>
        </RowBetween>
      )}
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={400} fontSize={16}>
          {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
        </Text>
      </ButtonPrimary>
    </>
  )
}
