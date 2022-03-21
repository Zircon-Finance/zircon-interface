// import { Flex, Skeleton, Text } from '@pancakeswap/uikit'
import { Flex, Text } from '@pancakeswap/uikit'
import { FC } from 'react'
import React from 'react'
import styled from 'styled-components'

interface TokenDisplayProps {
  value?: number | string
  inputSymbol?: string
  outputSymbol?: string
  format?: boolean
}

const TextLabel = styled(Text)`
  font-size: 32px;
  line-height: 1.1;
`

const PairPriceDisplay: FC<TokenDisplayProps> = ({
  value,
  inputSymbol,
  outputSymbol,
  children,
  format = true,
  ...props
}) => {
  return value ? (
    <div style={{display: 'flex', alignItems: "baseline"}}>
      <Flex alignItems="inherit">
        <TextLabel mr="8px" bold>
          {value}
        </TextLabel>
        {inputSymbol && outputSymbol && (
          <Text color="textSubtle" fontSize="20px" bold lineHeight={1.1}>
            {`${inputSymbol}/${outputSymbol}`}
          </Text>
        )}
      </Flex>
      {children}
    </div>
  ) : (
    <Text />
  )
}

export default PairPriceDisplay
