import React, { useRef } from 'react'
import styled from 'styled-components'
import { useTable, ColumnType } from '@pancakeswap/uikit'


import Row, { RowProps } from './Row'

export interface ITableProps {
  data: RowProps[]
  columns: ColumnType<RowProps>[]
  userDataReady: boolean
  sortColumn?: string
}

const Container = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-radius: 16px;
`

const TableWrapper = styled.div`
  overflow: visible;
  scroll-margin-top: 64px;

  &::-webkit-scrollbar {
    display: none;
  }
`

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: 14px;
  border-radius: 4px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`

const TableBody = styled.tbody`
  display: block;
  & tr {
    td {
      font-size: 16px;
      vertical-align: middle;
    }
  }
  :first-child {
    tr {
      margin-top: 5px;
  }
  :nth-child(n) {
    tr {
      position: relative;
    }
`

const TableContainer = styled.div`
  position: relative;
`


const FarmTable: React.FC<ITableProps> = (props) => {
  const tableWrapperEl = useRef<HTMLDivElement>(null)
  const { data, columns, userDataReady } = props
  const { rows } = useTable(columns, data, { sortable: true, sortColumn: 'farm' })

  return (
    <Container id="farms-table">
      <TableContainer>
        <TableWrapper ref={tableWrapperEl}>
          <StyledTable>
            <TableBody>
              {rows.length > 0 ? rows.map((row, index) => {
                return <Row {...row.original} userDataReady={userDataReady} key={`table-row-${row.id}`} />
              }) : <tr><td style={{width: '100%', textAlign: 'center', fontSize: '20px', fontWeight: 500}}>No farms found</td></tr>}
            </TableBody>
          </StyledTable>
        </TableWrapper>
      </TableContainer>
    </Container>
  )
}

export default FarmTable
