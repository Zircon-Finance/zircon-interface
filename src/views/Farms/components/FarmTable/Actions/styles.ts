import styled from 'styled-components'

export const ActionContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-flow: column;
  border-radius: 16px;
  flex-grow: 1;
  color: ${({ theme }) => theme.text1};
  flex-basis: 0;
  margin-bottom: 16px;
  min-height: 120px;
  @media (min-width: 800px) {
    min-height: 50px;
    margin-bottom: 0;
  }
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
  h2 {
    margin: 8px 0;
  }
`

export const HarvestButton = styled.button`
  display: flex;
  flex-direction: row;
  color: white;
  justify-content: center;
  align-items: center;
  padding: 8px 12px 9px;
  gap: 40px;
  border: none;

  width: 74px;
  height: 33px;

  background: ${({ theme }) => theme.poolPinkButton};
  border-radius: 12px;
`