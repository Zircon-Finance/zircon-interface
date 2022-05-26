import React from 'react'
import { Flex, Text } from 'rebass'
import { ButtonOutlined } from '../../../../components/Button'

interface StakeAddProps {
  row: boolean
  margin?: boolean
  width? : string
  clickAction? :  any
  onClick? : () => void
}

const StakeAdd : React.FC<StakeAddProps> = ({clickAction, row, margin, width}) => {
  return (
    <div style={{paddingTop: row ? '0px' : '50px', display: 'flex', height: '100%'}} onClick={clickAction}>
      <ButtonOutlined onClick={clickAction}
        style={{padding: row ? '0px' : null, width: width || '40%', margin: margin ? 'auto 0 auto 0' : 'auto'}}>
        <Flex justifyContent={'space-between'} flexDirection={row ? 'row' : 'column'} alignItems={'center'}>
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