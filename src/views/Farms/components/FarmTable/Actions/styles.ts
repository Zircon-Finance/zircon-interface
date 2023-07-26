import styled from 'styled-components'

export const ActionContainer = styled.div`
  padding: 0 10px;
  display: flex;
  flex-flow: column;
  border-radius: 16px;
  flex-grow: 1;
  color: ${({ theme }) => theme.text1};
  flex-basis: 0;
  margin-bottom: 16px;
  @media (min-width: 800px) {
    margin-bottom: 0;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    margin-right: 12px;
    margin-bottom: 0;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    margin-right: 0;
    margin-bottom: 0;
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
  .swiper {
    max-width: 100%;
    margin-left: 0px;
    margin-bottom: 10px;
  }
  .swiper-pagination-bullet {
    display: none;
  }
  .swiper-slide {
    width: auto !important;
    padding-right: 10px;
    margin-right: 10px !important;
    text-align: center;
  }
`

export const HarvestButton = styled.button`
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.darkMode ? '#1D1D1F' : '#FFF'};
  cursor: pointer;
  justify-content: center;
  align-items: center;
  padding: 8px 12px 9px;
  gap: 40px;
  border: none;
  height: 27px;

  background: ${({ theme }) => theme.primaryText1};
  border-radius: 12px;
`