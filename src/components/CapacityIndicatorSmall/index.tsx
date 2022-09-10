import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

const Battery = styled.div`
    height: 15px;
    width: 20px;
    border-radius: 5px;
    margin-left: 5px;
    margin-top: 2px;
    align-self: center;
`

const CapacityIndicatorSmall = (gamma) => {
  return (
    <Flex>
        <span>{`${gamma >= 0.7 ? 'Full' : gamma < 0.4 ? 'Empty' : 'Free'}`}</span>
        <Battery style={{ border: `1px solid ${gamma >= 0.7 ? '#FFF000' : gamma < 0.4 ? '#FF0000' : '#00FF00'}` }} />
    </Flex>
  )
}

export default CapacityIndicatorSmall