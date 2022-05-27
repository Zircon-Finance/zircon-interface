import React, { Children } from 'react'
import styled from 'styled-components'

const ModalActions: React.FC = ({ children }) => {
  const l = Children.toArray(children).length
  return (
    <StyledModalActions>
      {Children.map(children, (child, i) => (
        <>
          <StyledModalAction>{child}</StyledModalAction>
          {i < l - 1}
        </>
      ))}
    </StyledModalActions>
  )
}

const StyledModalActions = styled.div`
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.bg1}00;
  display: flex;
  margin: 0;
`

const StyledModalAction = styled.div`
  width: 49%;
`

export default ModalActions
