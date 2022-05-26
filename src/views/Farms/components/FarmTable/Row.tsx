import React, { useEffect, useState, createElement } from 'react'
import styled, { css, keyframes, useTheme } from 'styled-components'
import { useMatchBreakpoints, useTooltip } from '@pancakeswap/uikit'
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
import Staked, { StakedProps } from './Staked'
import { Flex, Text } from 'rebass'
import RiskHealthIcon from '../../../../components/RiskHealthIcon'
import TrendingHealthIcon from '../../../../components/TrendingHealthIcon'
import QuestionMarkIcon from '../../../../components/QuestionMarkIcon'
import StakeAdd from '../FarmCard/StakeAdd'
import { useFarmUser } from '../../../../state/farms/hooks'
// import { useFarmUser } from '../../../../state/farms/hooks'

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
  details: Details,
  farm: Farm,
  multiplier: Multiplier,
  earned: Earned,
  staked: Staked,
  liquidity: Liquidity,
}

const CellInner = styled.div`
  padding: 24px 0px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  position: relative;
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
  margin: ${({ expanded }) => expanded ? '5px 0 5px 0' : '10px 0 10px 0'};
  display: table;
  position: relative;
  width: 100%;
  background: ${({ theme }) => theme.cardSmall};
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
  width: 12%;
`

const ReferenceElement = styled.div`
  display: inline-block;
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
    details,
     userDataReady, 
  } = props
  const hasStakedAmount = !!useFarmUser(details.pid).stakedBalance.toNumber()
  const [actionPanelExpanded, setActionPanelExpanded] = useState(hasStakedAmount)
  const [hovered, setHovered] = useState(false)
  const shouldRenderChild = actionPanelExpanded
  const { t } = useTranslation()
  const theme = useTheme()
  const tooltipContent = (
    <div style={{background: theme.bg3, borderRadius: '17px', padding: '10px'}}>
      <Text>
        {t(
          'This will be text regarding informations about the farm-s risk and health',
        )}
      </Text>
    </div>
  )

  const toggleActionPanel = () => {
    setActionPanelExpanded(!actionPanelExpanded)
  }

  useEffect(() => {
    setActionPanelExpanded(hasStakedAmount)
    setIsVisible(true)
  }, [hasStakedAmount, isVisible])

  const { isDesktop, isMobile } = useMatchBreakpoints()
  const isSmallerScreen = !isDesktop
  const tableSchema = isSmallerScreen ? MobileColumnSchema : DesktopColumnSchema
  const columnNames = tableSchema.map((column) => column.name)
  const { targetRef, tooltip, tooltipVisible } = useTooltip(tooltipContent, {
    placement: 'top-end',
    tooltipOffset: [20, 10],
  })
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
                const risk = props[key].farmHealth && props[key].farmHealth > 300
                return (
                  <TableData style={{minWidth: '502px'}} key={key}>
                    <CellInner style={{width: '100%',justifyContent: 'flex-start'}}>
                      <CellLayout hovered={hovered} label={hovered && t(tableSchema[columnIndex].label)}>
                        <Flex width={'100%'} justifyContent={'space-between'}>
                        {createElement(cells[key], { ...props[key] })}
                            <div style={{width: '40%', display: 'flex', marginLeft: '20px', alignItems: 'center'}}>
                            {risk ?
                            <RiskHealthIcon /> : <TrendingHealthIcon /> }
                            <Text ml={'10px'}>{risk ? 'High Risk' : props[key].farmHealth}</Text>
                            <ReferenceElement ref={targetRef}>
                            <div style={{marginLeft: '10px'}}><QuestionMarkIcon /></div>
                            </ReferenceElement>
                            {tooltipVisible && tooltip}
                              </div>                            
                        </Flex>
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
              case 'earned':
                return (
                  <TableData key={key}>
                    {props.staked.staked.gt(0) && (
                      <CellInner>
                        <CellLayout hovered={hovered} label={t('Earned')}>
                          {createElement(cells[key], { ...props[key], userDataReady, hovered })}
                        </CellLayout>
                      </CellInner>
                    )}
                  </TableData>
                )
              case 'staked':
                return (
                  <TableData key={key}>
                    {props.staked.staked.gt(0) ? (
                      <CellInner>
                        <CellLayout hovered={hovered} label={t('Staked')}>
                          {createElement(cells[key], { ...props[key], hovered })}
                        </CellLayout>
                      </CellInner>) : (
                      <StakeAdd row={true} margin={true} width={'75%'} />)}
                  </TableData>
                )

              default:
                return (
                  <TableData key={key}>
                    <CellInner>
                      <CellLayout hovered={hovered} label={t(tableSchema[columnIndex].label)}>
                        {createElement(cells[key], { ...props[key], userDataReady, hovered })}
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
