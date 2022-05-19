import React from 'react'
import styled from 'styled-components'
import { ChevronDownIcon, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'


interface DetailsProps {
  actionPanelToggled: boolean
}

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  padding-right: 10px;
  color: ${({ theme }) => theme.text1};
`

export const ArrowIcon = styled(ChevronDownIcon)<{ toggled: boolean }>`
  transform: ${({ toggled }) => (toggled ? 'rotate(180deg)' : 'rotate(0)')};
  height: 20px;
`

const Details: React.FC<DetailsProps> = ({ actionPanelToggled }) => {
  const { t } = useTranslation()
  const { isDesktop } = useMatchBreakpoints()

  return (
    <Container>
      {!isDesktop && t('Details')}
      <ArrowIcon toggled={actionPanelToggled} />
    </Container>
  )
}

export default Details
