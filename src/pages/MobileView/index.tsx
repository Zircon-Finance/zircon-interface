import React from 'react'
import { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import LaptopIcon from '../../components/LaptopIcon'
import { Text } from 'rebass'

export default function MobileView() {
    const theme = useContext(ThemeContext)

return (
    <div style={{
    margin: 'auto',
    width: '90%',
    backgroundColor: theme.bg10,
    display: 'flex',
    justifyContent: 'center',
    flexFlow: 'column',
    borderRadius: '27px',
    height: '400px',
    padding: '70px 10px 10px 10px',
    zIndex: 10,
    }}>
    <span style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
        <LaptopIcon />
    </span>
            
    <Text fontWeight={400} fontSize={18} padding={'40px 40px 10px 40px'} textAlign={'center'} >{'Please use your desktop to try the Zircon Beta'} </Text>
    <Text fontWeight={400} fontSize={13} color={theme.text2} textAlign={'center'}>{'Our app will be available on your phone soon'} </Text>
    </div>
    )
}