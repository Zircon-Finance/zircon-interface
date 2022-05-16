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
  padding: 0 10px;
  & tr {
    td {
      font-size: 16px;
      vertical-align: middle;
    }
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
              {rows.map((row) => {
                return <Row {...row.original} userDataReady={userDataReady} key={`table-row-${row.id}`} />
              })}
            </TableBody>
          </StyledTable>
        </TableWrapper>
      </TableContainer>
    </Container>
  )
}

export default FarmTable