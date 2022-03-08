import React from 'react'
import styled from 'styled-components'
import useCopyClipboard from '../../hooks/useCopyClipboard'

import { CheckCircle } from 'react-feather'

// const CopyIcon = styled(LinkStyledButton)`
//   color: ${({ theme }) => theme.text3};
//   flex-shrink: 0;
//   display: flex;
//   text-decoration: none;
//   font-size: 0.825rem;
//   :hover,
//   :active,
//   :focus {
//     text-decoration: none;
//     color: ${({ theme }) => theme.text2};
//   }
// `
const TransactionStatusText = styled.span`
  font-size: 16px;
  margin-left: 10px;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }) {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <div onClick={() => setCopied(props.toCopy)} style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
      {isCopied && (
        <TransactionStatusText>
          <CheckCircle size={'16'} />
          <TransactionStatusText>Copied</TransactionStatusText>
        </TransactionStatusText>
      )}
      {isCopied ? '' : props.children}
    </div>
  )
}
