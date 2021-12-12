import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 420px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 8px;
  padding: 1rem;
  background: rgba(24, 24, 24, 0.37);
  box-shadow: inset 0px 0px 1px rgba(255, 255, 255, 0.37);
  background-clip: padding-box; /* !importanté */
  border: solid 1px transparent; /* !importanté */
  backdrop-filter: blur(26px);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -2;
    border-radius: inherit; /* !importanté */
    //background: rgba(24, 24, 24, 0.37);
    //backdrop-filter: blur(26px);
  }
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
