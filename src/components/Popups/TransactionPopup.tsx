import React  from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getEtherscanLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import Smiley from '../Smiley'

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
  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        <Smiley success={success} />
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={400}>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TYPE.body>
        {chainId && (
          <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>
            View on {chainId === 1285 ? 'Moonriver' : chainId === 1287 ? 'Moonbase' : 'BSC'} explorer
          </ExternalLink>
        )}
      </AutoColumn>
    </RowNoFlex>
  )
}
