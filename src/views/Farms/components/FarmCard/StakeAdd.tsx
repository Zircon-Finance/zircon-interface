import React from 'react'
import { Flex, Text } from 'rebass'
import { ButtonOutlined } from '../../../../components/Button'

interface StakeAddProps {
  row: boolean
  margin?: boolean
  width? : string
  clickAction? :  any
  onClick? : () => void
  disabled? : boolean
}

const StakeAdd : React.FC<StakeAddProps> = ({clickAction, row, margin, width, disabled}) => {
  return (
    <div style={{display: 'flex', height: '100%', pointerEvents: disabled ? 'none' : 'auto'}} onClick={clickAction}>
      <ButtonOutlined disabled={disabled} onClick={clickAction}
        style={{padding: row ? '5px' : null, width: width || '40%', margin: margin ? 'auto 0 auto 0' : 'auto'}}>
        <Flex justifyContent={'space-between'} flexDirection={row ? 'row' : 'column'} alignItems={'center'}>
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.75 9.875V36.125" stroke="#9D94AA" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.625 23H35.875" stroke="#9D94AA" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
            <Text style={{minWidth: 'auto'}}>Stake</Text>
        </Flex>
    </ButtonOutlined>
    </div>
    
  )
}

export default StakeAdd