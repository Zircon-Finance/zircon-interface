import {Currency, CurrencyAmount, Fraction, Percent} from 'zircon-sdk'
import React from 'react'
import {Text} from 'rebass'
import {ButtonPrimary} from '../../components/Button'
import {RowBetween, RowFixed} from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import {Field} from '../../state/mint/actions'
import {TYPE} from '../../theme'
import {Separator} from '../../components/SearchModal/styleds'
import {PylonState} from "../../data/PylonReserves";

export function ConfirmAddModalBottom({
    pylonState,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
    sync,
    isFloat,
  onAdd
}: {
  pylonState?: PylonState
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
    sync: string
    isFloat: boolean

}) {
  return (
    <>
        {(sync === "half" || isFloat) && <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_A]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <TYPE.body style={{overflow: 'auto'}}>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>}
        {(sync === "half" || !isFloat || pylonState !== PylonState.EXISTS) && <RowBetween>
        <TYPE.body>{currencies[Field.CURRENCY_B]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <TYPE.body style={{overflow: 'auto'}}>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>}
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
      {/*<RowBetween>*/}
      {/*  <TYPE.smallerBody>Share of Pool:</TYPE.smallerBody>*/}
      {/*  <TYPE.smallerBody>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</TYPE.smallerBody>*/}
      {/*</RowBetween>*/}
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={400} fontSize={16}>
          {pylonState === PylonState.EXISTS ? 'Confirm Supply' : pylonState === PylonState.ONLY_PAIR ? 'Create Pylon & Supply' : 'Create Pair' }
        </Text>
      </ButtonPrimary>
    </>
  )
}
