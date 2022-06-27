import React, { useEffect, useState, createElement, useCallback } from 'react'
import styled, { css, keyframes, useTheme } from 'styled-components'
import { useMatchBreakpoints, useTooltip } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
// import { useFarmUser } from '../../../../state/farms/hooks'

import Apr, { AprProps } from './Apr'
import Farm, { FarmProps } from './Farm'
import Earned, { EarnedProps } from './Earned'
import Details from './Details'
import { MaxUint256 } from '@ethersproject/constants'
import Multiplier from './Multiplier'
import Liquidity, { LiquidityProps } from './Liquidity'
import ActionPanel from './Actions/ActionPanel'
import CellLayout from './CellLayout'
import { DesktopColumnSchema, MobileColumnSchema } from '../types'
import Staked, { StakedProps } from './Staked'
import { Flex, Text } from 'rebass'
import RiskHealthIcon from '../../../../components/RiskHealthIcon'
import TrendingHealthIcon from '../../../../components/TrendingHealthIcon'
import QuestionMarkIcon from '../../../../components/QuestionMarkIcon'
import StakeAdd from '../FarmCard/StakeAdd'
import { useActiveWeb3React, useWindowDimensions } from '../../../../hooks'
import { ButtonLighter, ButtonPinkGamma } from '../../../../components/Button'
import { useAddPopup, useWalletModalToggle } from '../../../../state/application/hooks'
import { useERC20, useSousChef } from '../../../../hooks/useContract'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from '../../../../state/farms'
import { useIsDarkMode } from '../../../../state/user/hooks'
import { usePool } from '../../../../state/pools/hooks'
import { useCallWithGasPrice } from '../../../../hooks/useCallWithGasPrice'
// import { useFarmUser } from '../../../../state/farms/hooks'

export interface RowProps {
  apr: AprProps
  farm: FarmProps
  earned: EarnedProps
  staked: StakedProps
  liquidity: LiquidityProps
  details: any
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
  padding: 19px 0px;
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
        ${collapseAnimation} 200ms linear forwards
      `};
  cursor: pointer;
  margin: ${({ expanded }) => expanded ? '0 0 5px 0' : '10px 0 10px 0'};
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.bg7};
  @media (min-width: 992px) {
    display: table;
`

const EarnedMobileCell = styled.td`
  padding: 16px 0 24px 16px;
  font-size: 13px;
`

const AprMobileCell = styled.td`
  padding-top: 16px;
  padding-bottom: 24px;
  padding-right: 16px;
  font-size: 13px;
`

const FarmMobileCell = styled.td`
  padding-top: 24px;
  width: 100%;
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
  const hasStakedAmount = !!usePool(details.sousId).pool.userData.stakedBalance.toNumber()
  const [actionPanelExpanded, setActionPanelExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const shouldRenderChild = actionPanelExpanded
  const { t } = useTranslation()
  const theme = useTheme()
  const {width} = useWindowDimensions()
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
    setActionPanelExpanded(false)
    setIsVisible(true)
  }, [hasStakedAmount, isVisible])
  const lpContract = useERC20(details.stakingToken.address)
  const { fetchWithCatchTxError } = useCatchTxError()
  const addTransaction = useTransactionAdder()
  const addPopup = useAddPopup()
  const dispatch = useDispatch()
  const { account } = useActiveWeb3React()
  const sousChefContract = useSousChef(details.sousId)
  const { callWithGasPrice } = useCallWithGasPrice()

  const handleApproval = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256]).then(response => {
        addTransaction(response, {
          summary:  `Enable ${details.token1.symbol}-${details.token2.symbol} stake contract`
        })
        return response
      })
    })
    if (receipt?.status) {
      addPopup(
        {
          txn: {
            hash: receipt.transactionHash,
            success: true,
            summary: 'Contract enabled!',
          }
        },
        receipt.transactionHash
      )
      dispatch(fetchFarmUserDataAsync({ account, pids: [details.sousId] }))
    }
  },
  [
    dispatch, 
    fetchWithCatchTxError, 
    addPopup, 
    addTransaction, 
    account,
    details.sousId,
    details.token1.symbol,
    details.token2.symbol,
    lpContract,
    sousChefContract.address,
    callWithGasPrice,
  ])
  const mobileVer = width <= 992
  const { isDesktop } = useMatchBreakpoints()
  const isSmallerScreen = !isDesktop
  const tableSchema = isSmallerScreen ? MobileColumnSchema : DesktopColumnSchema
  const columnNames = tableSchema.map((column) => column.name)
  const { targetRef, tooltip, tooltipVisible } = useTooltip(tooltipContent, {
    placement: 'top-end',
    tooltipOffset: [20, 10],
  })
  const isApproved = account && details.userData.allowance && details.userData.allowance.isGreaterThan(0)
  const stakedAmount = usePool(details.sousId).pool.userData.stakedBalance.toNumber()
  const toggleWalletModal = useWalletModalToggle()
  const darkMode = useIsDarkMode()
  let rewardTokens = ''
  props.farm.earningToken.forEach((token) => rewardTokens += `${token.symbol} `)

  const handleRenderRow = () => {
    if (!mobileVer) {
      return (
        !actionPanelExpanded && (
        <StyledTr expanded={isVisible} onClick={toggleActionPanel} onMouseOver={() => setHovered(true)} 
        onMouseOut={() => setHovered(false)} 
        style={{backgroundColor: hovered ? theme.cardSmall : null, borderBottom: !darkMode ? `1px solid ${theme.cardExpanded}` : null}} >
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
                  <TableData style={{minWidth: width > 1400 ? '502px' : width > 992 ? '405px' : 'auto'}} key={key}>
                    <CellInner style={{width: '100%',justifyContent: 'flex-start'}}>
                      <CellLayout hovered={hovered} label={hovered && t(tableSchema[columnIndex].label)}>
                        <Flex width={'100%'} justifyContent={'space-between'}>
                        {createElement(cells[key], { ...props[key] })}
                            <div style={{width: '40%', display: 'flex', marginLeft: '20px', alignItems: 'center'}}>
                            {risk ?
                            <RiskHealthIcon /> : <TrendingHealthIcon /> }
                            <Text width={"max-content"} ml={'10px'}>{risk ? 'High Risk' : props[key].farmHealth}</Text>
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
                    {props.staked.staked.gt(0) ? (
                      <CellInner>
                        <CellLayout hovered={hovered} label={t('Earned')}>
                          {createElement(cells[key], { ...props[key], userDataReady, hovered, setHovered })}
                        </CellLayout>
                      </CellInner>
                    ) : (
                      <Text color={theme.whiteHalf}>
                        {`Earn ${rewardTokens}`}
                        </Text>
                  )}
                  </TableData>
                )
              case 'staked':
                return (
                  <TableData key={key}>
                    {account ? (
                    isApproved ?
                    props.staked.staked.gt(0) ? (
                      <CellInner>
                        <CellLayout hovered={hovered} label={t('Staked')}>
                          {createElement(cells[key], { ...props[key], hovered, setHovered })}
                        </CellLayout>
                      </CellInner>) : (
                      <StakeAdd row={true} margin={true} width={'75%'} />)
                    : (
                      <ButtonPinkGamma style={{width: '80%', fontSize: '13px', padding: '10px', borderRadius: '12px'}}
                      onClick={handleApproval}>{'Enable contract'}</ButtonPinkGamma>)) : (
                        <ButtonPinkGamma style={{width: '80%', fontSize: '13px', padding: '10px', borderRadius: '12px'}}
                    onClick={toggleWalletModal}>{'Connect wallet'}</ButtonPinkGamma>)}
                  </TableData>
                )

              default:
                return (
                  <TableData key={key}>
                    <CellInner>
                      <CellLayout hovered={hovered} label={t(tableSchema[columnIndex].label)}>
                        {createElement(cells[key], { ...props[key], userDataReady, hovered, setHovered })}
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
      !actionPanelExpanded && (
      <StyledTr expanded={isVisible} onClick={toggleActionPanel} 
      onMouseOver={() => setHovered(true)} 
      onMouseOut={() => setHovered(false)}>
        <td>
          <tr style={{width: '100%', display: 'flex'}}>
            <FarmMobileCell>
              <CellLayout>
                <Farm {...props.farm} />
                <Details actionPanelToggled={actionPanelExpanded} />
              </CellLayout>
            </FarmMobileCell>
          </tr>
          <tr style={{display: 'flex', width:' 100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <EarnedMobileCell>
              <CellLayout label={t('Earned')}>
                {account ? (
                  isApproved ? (stakedAmount ? (
                    <>
                      <span style={{color: theme.whiteHalf, fontSize: '13px', marginRight: '5px'}}>{'Earned: '}</span>
                      <Earned {...props.earned} userDataReady={userDataReady} />
                    </>
                  ) : (
                    <ButtonLighter style={{fontSize: '13px', padding: '10px', borderRadius: '12px', maxHeight: '38px'}}>
                      <Flex justifyContent={'space-between'} flexDirection={'row'} alignItems={'center'}>
                        <svg width="25" height="25" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.75 9.875V36.125" stroke="#9D94AA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.625 23H35.875" stroke="#9D94AA" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <Text style={{minWidth: 'auto'}}>Stake</Text>
                      </Flex>
                    </ButtonLighter>
                  )) : (
                    <ButtonLighter style={{fontSize: '13px', padding: '10px', borderRadius: '12px'}}
                    onClick={handleApproval}>{'Enable contract'}</ButtonLighter>
                  )) : (
                    <ButtonLighter style={{fontSize: '13px', padding: '10px', borderRadius: '12px'}}
                    onClick={toggleWalletModal}>{'Connect wallet'}</ButtonLighter>
                  )}
                
              </CellLayout>
            </EarnedMobileCell>
            <AprMobileCell>
              <CellLayout label={t('APR')}>
                <>
                  <span style={{color: theme.whiteHalf, fontSize: '13px'}}>{'APR: '}</span>
                  <Apr {...props.apr} hideButton />
                </>
              </CellLayout>
            </AprMobileCell>
          </tr>
        </td>
      </StyledTr>
    )
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
