import React from 'react'
import styled, { useTheme } from 'styled-components'

const Label = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.whiteHalf};
  text-align: left;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
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
  const theme = useTheme()
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <Label
          style={{
            color: hovered ? theme.darkMode ? theme.whiteHalf : '#080506' : "transparent",
            position: "absolute",
            bottom: "40px",
          }}
        >
          {label}
        </Label>
      )}
      <ContentContainer>{children}</ContentContainer>
    </div>
  );
}

export default CellLayout
