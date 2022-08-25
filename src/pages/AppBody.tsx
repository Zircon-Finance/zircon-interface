import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 480px;
  width: 100%;
  font-size: 13px;
  background: ${({ theme }) => theme.bg1};
  border-radius: 27px;
  @media (min-width: 700px) {
    font-size: 16px;
  }
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
