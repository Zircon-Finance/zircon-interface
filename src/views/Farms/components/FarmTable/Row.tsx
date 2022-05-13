import React, { useEffect, useState, createElement } from 'react'
import styled from 'styled-components'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'

import useDelayedUnmount from '../../../../hooks/useDelayedUnmount'
// import { useFarmUser } from '../../../../state/farms/hooks'

import Apr, { AprProps } from './Apr'
import Farm, { FarmProps } from './Farm'
import Earned, { EarnedProps } from './Earned'
import Details from './Details'
import Multiplier, { MultiplierProps } from './Multiplier'
import Liquidity, { LiquidityProps } from './Liquidity'
import ActionPanel from './Actions/ActionPanel'
import CellLayout from './CellLayout'
import { DesktopColumnSchema, MobileColumnSchema, FarmWithStakedValue } from '../types'
import StakedBalance, { StakedProps } from './StakedBalance'

export interface RowProps {
  apr: AprProps
  farm: FarmProps
  earned: EarnedProps
  staked: StakedProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
  multiplier: MultiplierProps
}

interface RowPropsWithLoading extends RowProps {
  userDataReady: boolean
}

const cells = {
  apr: Apr,
  farm: Farm,
  multiplier: Multiplier,
  earned: Earned,
  details: Details,
  staked: StakedBalance,
  liquidity: Liquidity,
}

const CellInner = styled.div`
  padding: 24px 0px;
  display: flex;
  width: 100%;
  align-items: center;
  padding-right: 8px;
`

const StyledTr = styled.tr`
  cursor: pointer;
  margin: 10px 0 10px 0;
  display: table;
  width: 100%;
  background: ${({ theme }) => theme.anchorFloatBadge};
  border-radius: 17px;
`

const EarnedMobileCell = styled.td`
  padding: 16px 0 24px 16px;
`

const AprMobileCell = styled.td`
  padding-top: 16px;
  padding-bottom: 24px;
`

const FarmMobileCell = styled.td`
  padding-top: 24px;
`

export const TableData = styled.td`
  width: 16%;
`

const Row: React.FunctionComponent<RowPropsWithLoading> = (props) => {
  const { 
    // details,
     userDataReady } = props
  // const hasStakedAmount = !!useFarmUser(details.pid).stakedBalance.toNumber()
  const hasStakedAmount = false;
  const [actionPanelExpanded, setActionPanelExpanded] = useState(hasStakedAmount)
  const shouldRenderChild = useDelayedUnmount(actionPanelExpanded, 300)
  const { t } = useTranslation()

  const toggleActionPanel = () => {
    setActionPanelExpanded(!actionPanelExpanded)
  }

  useEffect(() => {
    setActionPanelExpanded(hasStakedAmount)
  }, [hasStakedAmount])

  const { isDesktop, isMobile } = useMatchBreakpoints()

  const isSmallerScreen = !isDesktop
  const tableSchema = isSmallerScreen ? MobileColumnSchema : DesktopColumnSchema
  const columnNames = tableSchema.map((column) => column.name)
  const handleRenderRow = () => {
    if (!isMobile) {
      return (
        !actionPanelExpanded && (
        <StyledTr onClick={toggleActionPanel}>
          {Object.keys(props).map((key) => {
            const columnIndex = columnNames.indexOf(key)
            if (columnIndex === -1) {
              return null
            }

            switch (key) {
              case 'details':
                return (
                  <TableData key={key}>
                    <CellInner>
                      <CellLayout>
                        <Details actionPanelToggled={actionPanelExpanded} />
                      </CellLayout>
                    </CellInner>
                  </TableData>
                )
              case 'farm':
                return (
                  <TableData style={{width: '25%'}} key={key}>
                    <CellInner>
                      <CellLayout label={t(tableSchema[columnIndex].label)}>
                        {createElement(cells[key], { ...props[key] })}
                      </CellLayout>
                    </CellInner>
                  </TableData>
                )
              case 'apr':
                return (
                  <TableData key={key}>
                    <CellInner>
                      <CellLayout label={t('APR')}>
                        <Apr {...props.apr} hideButton={isSmallerScreen} />
                      </CellLayout>
                    </CellInner>
                  </TableData>
                )
              default:
                return (
                  <TableData key={key}>
                    <CellInner>
                      <CellLayout label={t(tableSchema[columnIndex].label)}>
                        {createElement(cells[key], { ...props[key], userDataReady })}
                      </CellLayout>
                    </CellInner>
                  </TableData>
                )
            }
          })}
        </StyledTr>
        )
      )
    }

    return (
      <StyledTr onClick={toggleActionPanel}>
        <td>
          <tr>
            <FarmMobileCell>
              <CellLayout>
                <Farm {...props.farm} />
              </CellLayout>
            </FarmMobileCell>
          </tr>
          <tr>
            <EarnedMobileCell>
              <CellLayout label={t('Earned')}>
                <Earned {...props.earned} userDataReady={userDataReady} />
              </CellLayout>
            </EarnedMobileCell>
            <AprMobileCell>
              <CellLayout label={t('APR')}>
                <Apr {...props.apr} hideButton />
              </CellLayout>
            </AprMobileCell>
          </tr>
        </td>
        <td>
          <CellInner>
            <CellLayout>
              <Details actionPanelToggled={actionPanelExpanded} />
            </CellLayout>
          </CellInner>
        </td>
      </StyledTr>
    )
  }

  return (
    <>
      {handleRenderRow()}
      {shouldRenderChild && (
        <tr style={{display: 'flex', flexDirection: 'column'}} onClick={()=> {setActionPanelExpanded(!actionPanelExpanded)}}>
          <td colSpan={6}>
            <ActionPanel {...props} expanded={actionPanelExpanded} />
          </td>
        </tr>
      )}
    </>
  )
}

export default Row
