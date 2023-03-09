import React from 'react'
import { useIsDarkMode } from '../../state/user/hooks'

const SunLogo = () => {
  const darkMode = useIsDarkMode()
  return darkMode ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 1V3" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21V23" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.21997 4.22021L5.63997 5.64021" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 18.3599L19.78 19.7799" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 12H3" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H23" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.21997 19.7799L5.63997 18.3599" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 5.64021L19.78 4.22021" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  )
  : 
  (
    <svg width="20" height="20" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 10.29C18.8427 11.9922 18.2039 13.6144 17.1583 14.9668C16.1127 16.3192 14.7035 17.3458 13.0957 17.9265C11.4879 18.5073 9.74801 18.6181 8.07952 18.2461C6.41104 17.8741 4.88302 17.0345 3.67425 15.8258C2.46548 14.617 1.62596 13.089 1.25393 11.4205C0.881899 9.75202 0.992739 8.01208 1.57348 6.4043C2.15423 4.79651 3.18085 3.38737 4.53324 2.34175C5.88562 1.29614 7.50782 0.657305 9.21002 0.5C8.21344 1.84827 7.73387 3.50945 7.85856 5.18141C7.98324 6.85338 8.70388 8.42506 9.88943 9.6106C11.075 10.7961 12.6466 11.5168 14.3186 11.6415C15.9906 11.7662 17.6518 11.2866 19 10.29V10.29Z" stroke="#D5AEAF" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default SunLogo