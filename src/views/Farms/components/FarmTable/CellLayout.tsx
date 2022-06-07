import React from 'react'
import styled from 'styled-components'

const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.whiteHalf};
  text-align: left;
`

const ContentContainer = styled.div`
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

interface CellLayoutProps {
  label?: string
  hovered?: boolean
}

const CellLayout: React.FC<CellLayoutProps> = ({ label = '', children, hovered }) => {
  return (
    <div style={{width: '100%'}}>
      {label && <Label style={{color: hovered ? 'rgba(255,255,255,0.5)' : 'transparent', position: 'absolute', bottom: '42px'}}>{label}</Label>}
      <ContentContainer>{children}</ContentContainer>
    </div>
  )
}

export default CellLayout
