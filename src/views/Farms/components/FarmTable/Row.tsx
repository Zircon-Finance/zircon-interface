import React, { useEffect, useState, createElement } from 'react'
import styled, { css, keyframes, useTheme } from 'styled-components'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
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
  justify-content: flex-start;
`

const StyledTr = styled.tr<{ expanded }>`
animation: ${({ expanded }) =>
  expanded
    ? css`
        ${expandAnimation} 200ms
      `
    : css`
        ${collapseAnimation} 300ms linear forwards
      `};
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
  width: 15%;
`

const expandAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`
const collapseAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const Row: React.FunctionComponent<RowPropsWithLoading> = (props) => {
  const [isVisible, setIsVisible] = useState(false)
  const { 
    // details,
     userDataReady } = props
  // const hasStakedAmount = !!useFarmUser(details.pid).stakedBalance.toNumber()
  const hasStakedAmount = false;
  const [actionPanelExpanded, setActionPanelExpanded] = useState(hasStakedAmount)
  const [hovered, setHovered] = useState(false)
  const shouldRenderChild = actionPanelExpanded
  const { t } = useTranslation()

  const toggleActionPanel = () => {
    setActionPanelExpanded(!actionPanelExpanded)
  }

  useEffect(() => {
    setActionPanelExpanded(hasStakedAmount)
    setIsVisible(true)
  }, [hasStakedAmount, isVisible])

  const { isDesktop, isMobile } = useMatchBreakpoints()
  const isSmallerScreen = !isDesktop
  const theme = useTheme()
  const tableSchema = isSmallerScreen ? MobileColumnSchema : DesktopColumnSchema
  const columnNames = tableSchema.map((column) => column.name)
  const handleRenderRow = () => {
    if (!isMobile) {
      return (
        !actionPanelExpanded && (
        <StyledTr expanded={isVisible} onClick={toggleActionPanel} onMouseOver={() => setHovered(true)} 
        onMouseOut={() => setHovered(false)} style={hovered ? {backgroundColor: theme.cardExpanded} : null}>
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
                  <TableData style={{minWidth: '300px'}} key={key}>
                    <CellInner style={{justifyContent: 'flex-start'}}>
                      <CellLayout hovered={hovered} label={hovered && t(tableSchema[columnIndex].label)}>
                        {createElement(cells[key], { ...props[key] })}
                      </CellLayout>
                    </CellInner>
                  </TableData>
                )
              case 'apr':
                return (
                  <TableData key={key}>
                    <CellInner>
                      <CellLayout hovered={hovered} label={t('APR')}>
                        <Apr {...props.apr} hideButton={isSmallerScreen} />
                      </CellLayout>
                    </CellInner>
                  </TableData>
                )
              default:
                return (
                  <TableData key={key}>
                    <CellInner>
                      <CellLayout hovered={hovered} label={t(tableSchema[columnIndex].label)}>
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
      <StyledTr expanded={isVisible} onClick={toggleActionPanel} 
      onMouseOver={() => setHovered(true)} 
      onMouseOut={() => setHovered(false)}>
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
        <tr style={{display: 'flex', flexDirection: 'column'}}>
          <td colSpan={6}>
            <ActionPanel {...props} expanded={actionPanelExpanded} clickAction={setActionPanelExpanded} />
          </td>
        </tr>
      )}
    </>
  )
}

export default Row
