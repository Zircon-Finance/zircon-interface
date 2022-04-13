import React from 'react'
import { useTheme } from 'styled-components'
import LaptopIcon from '../../components/LaptopIcon'
import { Text } from 'rebass'

interface MobileView {
    icon: string,
    upperText: string,
    lowerText?: string
  }

export default function MobileView({
        icon,
        upperText,
        lowerText
    } : MobileView) {
    const theme = useTheme()

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
            {icon === 'laptop' ? <LaptopIcon /> : 'Loading placeholder'}
        </span>

        <Text fontWeight={400} fontSize={18} padding={'40px 40px 10px 40px'} textAlign={'center'} >{upperText} </Text>
        <Text fontWeight={400} fontSize={13} color={theme.text2} textAlign={'center'}>{lowerText} </Text>
        </div>
    )
}
