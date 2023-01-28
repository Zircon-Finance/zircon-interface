import React from 'react'
import { useTheme } from 'styled-components'
import { RowBetween } from '../Row'
import { Flex } from 'rebass'
import styled from 'styled-components'
import AlertIcon from '../AlertIcon'

const SmallDivider = styled.div`
  width: 4px;
  border-radius: 7px 0px 0px 7px;
  background-color: ${({theme}) => theme.percentageRed};
  margin-top: 25px;
  margin-bottom: 25px;
`

const ErrorTxContainer = ({errorTx}) => {
  const theme = useTheme()
  return (
    <Flex>
          <SmallDivider />
          <RowBetween style={{ marginTop: 25, marginBottom: 25, padding: '9px 10px 10px', background: theme.darkMode ? 'rgba(230, 112, 102, 0.05)' :
            'rgba(188, 41, 41, 0.05)', 
            border: `1px solid ${theme.darkMode ? 'rgba(230, 112, 102, 0.1)' : 
            'rgba(188, 41, 41, 0.1)'}`,
            borderRadius: '0px 7px 7px 0px'}} 
          >
            <AlertIcon />
            <span style={{ color: theme.text1, width: '100%', fontSize: '16px', marginLeft: '10px' }}>{errorTx}</span>
          </RowBetween>
        </ Flex>
  )
}

export default ErrorTxContainer