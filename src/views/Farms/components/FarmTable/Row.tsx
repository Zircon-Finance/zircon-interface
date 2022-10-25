import React, { useEffect, useState, createElement, useCallback } from 'react'
import styled, { css, keyframes, useTheme } from 'styled-components'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
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
import QuestionMarkIcon from '../../../../components/QuestionMarkIcon'
import StakeAdd from '../FarmCard/StakeAdd'
import { useActiveWeb3React, useWindowDimensions } from '../../../../hooks'
import { ButtonPinkGamma } from '../../../../components/Button'
import { useAddPopup, useWalletModalToggle } from '../../../../state/application/hooks'
import { useERC20, useSousChef } from '../../../../hooks/useContract'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { useDispatch } from 'react-redux'
import { useIsDarkMode } from '../../../../state/user/hooks'
import { usePool } from '../../../../state/pools/hooks'
import { useCallWithGasPrice } from '../../../../hooks/useCallWithGasPrice'
import { useCurrency } from '../../../../hooks/Tokens'
import {useDerivedPylonMintInfo} from "../../../../state/mint/pylonHooks";
import BigNumberJs from "bignumber.js";
import {useGamma} from "../../../../data/PylonData";
import CapacityIndicatorSmall from "../../../../components/CapacityIndicatorSmall";
import { fetchPoolsUserDataAsync } from '../../../../state/pools'
import { RewardPerBlock } from '../../Farms'
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

interface ToolTipProps {
  option: string
}

const CellInner = styled.div`
  padding: 14px 0px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  position: relative;
`

export const QuestionMarkContainer = styled.div`
  position: relative;
  margin-left: 10px;
  margin-top: 5px;
  svg {
    pointer-events: none;
  }
  &:hover {
    path {
      fill: ${({theme}) => theme.blackBrown};
      stroke: ${({theme}) => !theme.darkMode && '#fff' };
    }
`

export const ToolTip = styled.div<{ show }>`
animation: ${({ show }) =>
  show
    ? css`
        ${expandAnimation} 200ms
      `
    : css`
        ${collapseAnimation} 200ms linear forwards
      `};
background: ${({theme}) => theme.questionMarkBg};
border-radius: 17px; 
padding: 10px;
position: absolute; 
bottom: 30px;
width: 230px;
left: -100px;
z-index: 999;
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
  border-radius: 17px;
  margin: ${({ expanded }) => expanded ? '0 0 5px 0' : '10px 0 10px 0'};
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.opacitySmall};
  @media (min-width: 992px) {
    display: table;
    height: 80px;
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
  const [currency1, currency2] = [useCurrency(details.token1.address),useCurrency(details.token2.address)]
  // const [, pylonPair] = usePylon(currency1, currency2)

  // const gamma = new BigNumber(gammaBig).div(new BigNumber(10).pow(18))
  // const healthFactor = useHealthFactor(currency1, currency2)
  const {
    pylonPair,
    healthFactor
  } = useDerivedPylonMintInfo(
      currency1 ?? undefined,
      currency2 ?? undefined,
      false,
      "off"
  );
  const pool = usePool(details.sousId).pool
  const gamma = useGamma(pylonPair?.address)//TODO: change with pool?.gamma

  const hasStakedAmount = !!pool.userData.stakedBalance.toNumber()
  const [actionPanelExpanded, setActionPanelExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const shouldRenderChild = actionPanelExpanded
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const theme = useTheme()
  const {width} = useWindowDimensions()

  const TooltipContentRisk: React.FC<ToolTipProps> = ({option}) => {return (
    <ToolTip show={hoverRisk}>
      <Text fontSize='13px' fontWeight={500} color={theme.text1}>
      {`${option === 'health' ? 'The health factor measures how balanced this Stable vault is. Imbalanced vaults may be partially slashed when withdrawing during critical market activity.' :
          option === 'divergence' ? 'Divergence measures how much impermanent loss the Float vault is suffering.' :
          'General info'}`}
      </Text>
    </ToolTip>
  )}


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
  const sousChefContract = useSousChef(details.sousId)
  const { callWithGasPrice } = useCallWithGasPrice()
  const [pendingTx, setPendingTx] = useState(false)

  const handleApproval = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256]).then(response => {
        setPendingTx(true)
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
      setPendingTx(false)
      dispatch(fetchPoolsUserDataAsync(account))
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
  const isApproved = account && details.userData.allowance && details.userData.allowance.isGreaterThan(0)
  const stakedAmount = usePool(details.sousId).pool.userData.stakedBalance.toNumber()
  const toggleWalletModal = useWalletModalToggle()
  const darkMode = useIsDarkMode()
  const [rewardTokens, setRewardTokens] = useState("")
  useEffect(() => {
    let r = ''
    props.farm?.earningToken.forEach((token) => r += ` ${token.symbol === 'MOVR' ? 'wMOVR' : token.symbol} &`)
    setRewardTokens(r.slice(0, -1))
  }, [])
  const [hoverRisk, setHoverRisk] = useState(false)
  const gammaAdjusted = new BigNumberJs(gamma).div(new BigNumberJs(10).pow(18))

  const handleRenderRow = () => {
    if (!mobileVer) {
      return (
        !actionPanelExpanded && (
        <StyledTr expanded={isVisible} onClick={toggleActionPanel} onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        style={{backgroundColor: hovered ? theme.cardExpanded : null, borderBottom: !darkMode ? `1px solid ${theme.cardExpanded}` : null}} >
          {Object.keys(props).map((key) => {
            const columnIndex = columnNames.indexOf(key)
            if (columnIndex === -1) {
              return null
            }

            switch (key) {
              case 'details':
                // const risk = gammaAdjusted && (gammaAdjusted.isLessThanOrEqualTo(0.7) || gammaAdjusted.isGreaterThanOrEqualTo(0.5))
                return (
                  <TableData key={key} style={{width: gamma ? '15%' : '12%'}}>
                    <CellInner>
                      <CellLayout>
                        <div style={{width: '200%', display: 'flex', marginLeft: '20px', alignItems: 'center', justifyContent: 'flex-end'}}>
                            {!props.farm.isFinished && <><CapacityIndicatorSmall gamma={gammaAdjusted} health={healthFactor} isFloat={!props.farm.isAnchor} noSpan={false}
                            hoverPage={'farmRow'}/>
                            <QuestionMarkContainer
                              onMouseEnter={() => setHoverRisk(true)}
                              onMouseLeave={() => setHoverRisk(false)}
                              >{hoverRisk && (
                                <TooltipContentRisk option={!props.farm.isAnchor ? 'divergence' : 'health'} />
                              )}
                            <QuestionMarkIcon />
                            </QuestionMarkContainer></>}
                        </div>
                        <Details actionPanelToggled={actionPanelExpanded} />
                      </CellLayout>
                    </CellInner>
                  </TableData>
                )
              case 'farm':
                return (
                  <TableData style={{minWidth: '280px', maxWidth: '281px'}} key={key}>
                    <CellInner style={{width: '100%',justifyContent: 'flex-start'}}>
                      <CellLayout hovered={hovered} label={hovered && t(tableSchema[columnIndex].label)}>
                        <Flex width={'100%'} justifyContent={'space-between'}>
                        {createElement(cells[key], { ...props[key] })}
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
                      <Flex style={{alignItems: 'center'}}>
                        <>
                        {!account ? (
                        <Text style={{width: '70%'}} color={'#4e7455'}>
                          {`Earn${rewardTokens.slice(0, -1)}`}
                        </Text>
                        ) : (
                        !props.farm.isFinished &&
                        <Flex flexDirection={'column'}>
                          <Text fontSize='13px' fontWeight={500} color={4e7455} marginBottom={2}>
                            {'Monthly Rewards:'}
                          </Text>
                            <RewardPerBlock earningRewardsBlock={details?.earningTokenInfo}  />
                        </Flex>
                        )}
                        </>
                      </Flex>
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
                      <StakeAdd row={true} margin={true} width={'60%'} height={'34px'} isFinished={props.farm.isFinished} />)
                    : (
                      <ButtonPinkGamma style={{width: '80%', fontSize: '13px', padding: '0 15px', borderRadius: '12px', height: '34px'}} disabled={pendingTx || props.farm.isFinished}
                      onClick={handleApproval}>{pendingTx ? 'Enabling...' : 'Enable contract'}</ButtonPinkGamma>)) : (
                        <ButtonPinkGamma style={{width: '80%', fontSize: '13px', padding: '0 15px', borderRadius: '12px', height: '34px'}}
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
                    <ButtonPinkGamma style={{fontSize: '13px', padding: '10px', borderRadius: '12px', maxHeight: '38px'}}>
                      <Flex justifyContent={'space-between'} flexDirection={'row'} alignItems={'center'}>
                        <svg width="25" height="25" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.75 9.875V36.125" stroke="#CA98BB" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.625 23H35.875" stroke="#CA98BB" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <Text style={{minWidth: 'auto'}}>Stake</Text>
                      </Flex>
                    </ButtonPinkGamma>
                  )) : (
                    <ButtonPinkGamma style={{fontSize: '13px', padding: '10px', borderRadius: '12px', height: '34px'}} disabled={pendingTx || props.farm.isFinished}
                    onClick={handleApproval}>{pendingTx ? 'Enabling...' : 'Enable contract'}</ButtonPinkGamma>
                  )) : (
                    <ButtonPinkGamma style={{fontSize: '13px', padding: '10px', borderRadius: '12px', height: '34px'}}
                    onClick={toggleWalletModal}>{'Connect wallet'}</ButtonPinkGamma>
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
            <ActionPanel {...props} expanded={actionPanelExpanded} clickAction={setActionPanelExpanded} gamma={gammaAdjusted.toNumber()}healthFactor={healthFactor} />
          </td>
        </tr>
      )}
    </>
  )
}

export default Row
