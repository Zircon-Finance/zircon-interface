import React  from 'react'
import { AlertCircle } from 'react-feather'
import styled, { useTheme } from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getEtherscanLink } from '../../utils'
import CheckIcon from '../CheckIcon'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TransactionPopup({
  hash,
  success,
  summary
}: {
  hash: string
  success?: boolean
  summary?: string
}) {
  const { chainId } = useActiveWeb3React()

  const theme = useTheme()

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckIcon /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={400}>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TYPE.body>
        {chainId && (
          <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>View on Moonbeam explorer</ExternalLink>
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
