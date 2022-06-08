import { SvgProps } from '@pancakeswap/uikit'
import React from 'react'
import { useTheme } from 'styled-components'
import { useIsDarkMode } from '../../state/user/hooks'

const QuestionMarkIcon: React.FC<SvgProps> = () => {
  const theme = useTheme()
  const darkMode = useIsDarkMode()
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19Z" fill= {theme.questionMarks }/>
    <path d="M7.57495 7.50002C7.77087 6.94307 8.15758 6.47344 8.66658 6.17429C9.17558 5.87515 9.77403 5.7658 10.3559 5.86561C10.9378 5.96542 11.4656 6.26795 11.8458 6.71962C12.2261 7.17129 12.4342 7.74295 12.4333 8.33335C12.4333 10 9.93328 10.8334 9.93328 10.8334V12.0833" stroke={darkMode ? "#BFB7CA" : '#080506'} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14.1667H10.0083" stroke={darkMode ? "#BFB7CA" : '#080506'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>


  )
}

export default QuestionMarkIcon