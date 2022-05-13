import styled from 'styled-components'

export const ActionContainer = styled.div`
  padding: 16px;
  border-radius: 16px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-right: 12px;
    margin-bottom: 0;
    max-height: 100px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    margin-right: 0;
    margin-bottom: 0;
    max-height: 100px;
  }
`

export const ActionTitles = styled.div`
  display: flex;
`

export const ActionContent = styled.div`
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: center;
`

export const HarvestButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 12px 9px;
  gap: 40px;
  border: none;

  width: 74px;
  height: 33px;

  background: ${({ theme }) => theme.questionMarks};
  border-radius: 12px;
`