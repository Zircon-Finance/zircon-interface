import React from 'react'
import { Flex, Text } from 'rebass'
import { ButtonOutlined } from '../../../../components/Button'

const StakeAdd = () => {
  return (
    <div style={{paddingTop: '50px'}}>
      <ButtonOutlined style={{width: '40%', margin: 'auto'}}>
        <Flex justifyContent={'space-between'} flexDirection={'column'} alignItems={'center'}>
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.75 9.875V36.125" stroke="#9D94AA" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.625 23H35.875" stroke="#9D94AA" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
            <Text>Stake</Text>
        </Flex>
    </ButtonOutlined>
    </div>
    
  )
}

export default StakeAdd