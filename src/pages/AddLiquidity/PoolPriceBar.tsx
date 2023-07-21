import { Currency, Percent, Price } from 'diffuse-sdk'
import React  from 'react'
import { Text } from 'rebass'
import { useTheme } from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { ONE_BIPS } from '../../constants'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
}) {
  const theme = useTheme()
  return (
    <AutoColumn gap="md" style={{display: 'flex'}}>
      <div style={{width: '50%'}}>
      <AutoColumn justify="center" style={{display: 'flex'}}>
          <TYPE.black color={theme.whiteHalf} minWidth={'max-content'}>{price?.toSignificant(6) ?? '-'}</TYPE.black>
          <Text fontWeight={300} fontSize={14} color={theme.whiteHalf} ml={2} minWidth={'max-content'}>
            {currencies[Field.CURRENCY_B]?.symbol} per {currencies[Field.CURRENCY_A]?.symbol}
          </Text>
        </AutoColumn>
        <AutoColumn justify="center" style={{display: 'flex'}}>
          <TYPE.black color={theme.whiteHalf} minWidth={'max-content'}>{price?.invert()?.toSignificant(6) ?? '-'}</TYPE.black>
          <Text fontWeight={300} fontSize={14} color={theme.whiteHalf} ml={2} minWidth={'max-content'}>
            {currencies[Field.CURRENCY_A]?.symbol} per {currencies[Field.CURRENCY_B]?.symbol}
          </Text>
        </AutoColumn>
      </div>
      <AutoRow justify="space-around" gap="4px">

        <AutoColumn justify="center" style={{width: '100%', justifyItems: 'end'}}>
          <TYPE.black color={theme.whiteHalf}>
            {noLiquidity && price
              ? '100'
              : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
            %
          </TYPE.black>
          <Text fontWeight={300} fontSize={14} color={theme.whiteHalf} pt={1}>
            Share of Pool
          </Text>
        </AutoColumn>
      </AutoRow>
    </AutoColumn>
  )
}
