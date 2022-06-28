import React from 'react'
import styled from 'styled-components'
import { ReactComponent as DropDown } from '../../../../assets/images/dropdown.svg'


interface DetailsProps {
  actionPanelToggled: boolean
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding-right: 15px;
  color: ${({ theme }) => theme.text1};
  width: 100%;
  justify-content: flex-end;
`

export const ArrowIcon = styled(DropDown)<{ toggled: boolean }>`
  transform: ${({ toggled }) => (toggled ? 'rotate(180deg)' : 'rotate(0)')};
  height: 20px;
`

const Details: React.FC<DetailsProps> = ({ actionPanelToggled }) => {

  return (
    <Container>
      <ArrowIcon toggled={actionPanelToggled} />
    </Container>
  )
}

export default Details
