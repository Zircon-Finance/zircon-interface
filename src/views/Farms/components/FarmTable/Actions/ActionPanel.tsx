import React, {Dispatch, SetStateAction, useCallback, useState} from 'react'
import styled, { keyframes, css, useTheme } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Text } from '@pancakeswap/uikit'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
// import { getBscScanLink } from 'utils'
import Portal from '@reach/portal'
import HarvestAction from './HarvestAction'
import StakedAction from './StakedAction'
import Apr, { AprProps } from '../Apr'
import { MultiplierProps } from '../Multiplier'
import { MaxUint256 } from '@ethersproject/constants'
import Liquidity, { LiquidityProps } from '../Liquidity'
import { StakedProps } from '../Staked'
import DoubleCurrencyLogo from '../../../../../components/DoubleLogo'
import { BadgeSmall } from '../../../../../components/Header'
import { ButtonLinkGet, ButtonPinkGamma } from '../../../../../components/Button'
import { ArrowIcon } from '../Details'
import StakeAdd from '../../FarmCard/StakeAdd'
import DepositModal from '../../DepositModal'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useERC20, useSousChef } from '../../../../../hooks/useContract'
import { ModalContainer, RewardPerBlock } from '../../../Farms'
import { useAddPopup, useWalletModalToggle } from '../../../../../state/application/hooks'
import { Link } from 'react-router-dom'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { useActiveWeb3React, useWindowDimensions } from '../../../../../hooks'
import { Flex } from 'rebass'
import { Token } from 'zircon-sdk'
import { DeserializedPool } from '../../../../../state/types'
import { usePool, usePools } from '../../../../../state/pools/hooks'
import { fetchPoolsUserDataAsync } from '../../../../../state/pools'
import { useCallWithGasPrice } from '../../../../../hooks/useCallWithGasPrice'
import { BIG_ZERO } from '../../../../../utils/bigNumber'

import QuestionMarkIcon from '../../../../../components/QuestionMarkIcon'
import { QuestionMarkContainer, ToolTip } from '../Row'
import CapacityIndicatorSmall from '../../../../../components/CapacityIndicatorSmall/index'
import DaysLeftBar from '../../../../../components/DaysLeftBar'
import { HealthFactorParams } from '../../../../../state/mint/pylonHooks'
import { getEtherscanLink } from '../../../../../utils'

export interface ActionPanelProps {
  apr: AprProps
  staked: StakedProps
  multiplier?: MultiplierProps
  liquidity: LiquidityProps
  details: DeserializedPool
  userDataReady: boolean
  expanded: boolean
  clickAction: Dispatch<SetStateAction<boolean>>
  gamma: number
  healthFactor: HealthFactorParams,
  currentBlock: any
}

interface ToolTipProps {
  option: string
}

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

const Container = styled.div<{ expanded, staked }>`
  animation: ${({ expanded }) =>
      expanded
          ? css`
            ${expandAnimation} 300ms linear forwards
          `
          : css`
            ${collapseAnimation} 300ms linear forwards
          `};
  overflow: hidden;
  background: ${({ theme }) => theme.darkMode ? '#452632' : '#F5F3F4'};
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  border-radius: 17px;
  margin-bottom: ${({ expanded }) => (expanded ? '0' : '5px')};
  grid-template-columns: ${({ staked }) => staked ? '25% 20% 20% auto 40px' : '25% 35% auto 40px'};
  @media (min-width: 800px) {
    grid-template-columns: ${({ staked }) => staked ? '24% 25% 25% auto 40px' : '24% 50% auto 40px'};
    display: grid;
    gap: 5px;
  }
  position: relative;
`
//25% 20% 20% auto 40px
//25% 35% auto 40px

export const StyledLinkExternal = styled.a`
  font-weight: 300;
  font-size: 13px;
  text-decoration: none;
  color: ${({ theme }) => theme.whiteHalf};
`

// const TagsContainer = styled.div`
//   display: flex;
//   align-items: center;
//   margin-top: 25px;


//   > div {
//     height: 24px;
//     padding: 0 6px;
//     font-size: 14px;
//     margin-right: 4px;

//     svg {
//       width: 14px;
//     }
//   }
// `

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
`

const QuarterContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ValueContainer = styled.div`
  display: block;
  a {
    text-decoration: none;
  }
`

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0px;
  font-size: 13px !important; 
`

export const SpaceBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
interface ModalProps {
  max: BigNumber
  lpLabel: string
  apr: number
  onDismiss: () => void
  displayApr: string
  stakedBalance: BigNumber
  onConfirm: (amount: string, token: Token) => Promise<void>
  tokenName: string
  addLiquidityUrl: string
  cakePrice: BigNumber
  token: Token
  pool?: DeserializedPool
}

export const ModalTopDeposit: React.FunctionComponent<ModalProps> = ({
                                                                       max,
                                                                       pool,
                                                                       lpLabel,
                                                                       apr,
                                                                       onDismiss,
                                                                       displayApr,
                                                                       stakedBalance,
                                                                       onConfirm,
                                                                       tokenName,
                                                                       addLiquidityUrl,
                                                                       cakePrice,
                                                                       token}) => {
  return (
      <Portal>
        <ModalContainer>
          <DepositModal
              max={max}
              lpLabel={lpLabel}
              apr={apr}
              onDismiss={onDismiss}
              displayApr={displayApr}
              stakedBalance={stakedBalance}
              onConfirm={onConfirm}
              tokenName={tokenName}
              addLiquidityUrl={addLiquidityUrl}
              cakePrice={cakePrice}
              token={token}
              pool={pool}
          />
        </ModalContainer>
      </Portal>
  )
}


const ActionPanel: React.FunctionComponent<ActionPanelProps> = ({
                                                                  details,
                                                                  apr,
                                                                  liquidity,
                                                                  userDataReady,
                                                                  clickAction,
                                                                  expanded,
                                                                  gamma,
                                                                  healthFactor,
                                                                  currentBlock
                                                                }) => {
  const farm = details
  const staked = details.userData.stakedBalance.gt(0)
  const { t } = useTranslation()
  const { isAnchor, token1, token2, isClassic } = farm
  const lpLabel = `${farm.token1.symbol}-${farm.token2.symbol}`
  const lpAddress = farm.stakingToken.address
  const theme = useTheme()
  const {pools} = usePools()
  const { pool } = usePool(farm.contractAddress)
  const tokenBalance = pool.userData.stakingTokenBalance
  const stakedBalance = pool.userData.stakedBalance
  const [showModal, setShowModal] = useState(false)
  const { onStake } = useStakeFarms(farm.contractAddress, farm.stakingToken.address)
  const { account } = useWeb3React()
  const dispatch = useDispatch()
  const allowance = farm.userData?.allowance ? new BigNumber(farm.userData.allowance) : BIG_ZERO
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const lpContract = useERC20(lpAddress)
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const toggleWalletModal = useWalletModalToggle()
  const { width } = useWindowDimensions()
  const sousChefContract = useSousChef(pool.contractAddress)
  const { callWithGasPrice } = useCallWithGasPrice()
  const [hoverRisk, setHoverRisk] = useState(false)
  const handleApproval = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return callWithGasPrice(lpContract, 'approve', [sousChefContract.address, MaxUint256])
          .then(response => {
            addTransaction(response, {
              summary:  `Enable ${farm.token1.symbol}-${farm.token2.symbol} stake contract`
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
      dispatch(fetchPoolsUserDataAsync({chainId, account, pools}))
    }
  }, [dispatch,
    account,
    addPopup,
    fetchWithCatchTxError,
    addTransaction,
    callWithGasPrice,
    farm.token1.symbol,
    farm.token2.symbol,
    lpContract,
    sousChefContract.address,
  ])

  const handleStake = async (amount: string, token: Token) => {
      // console.log("amount", amount)
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount, token.decimals).then((response) => {
        addTransaction(response, {
          summary: `Stake ${token1.symbol}-${token2.symbol} LP tokens`
        })
        return response
      })
    })
    if (receipt?.status) {
      addPopup(
          {
            txn: {
              hash: receipt.transactionHash,
              success: receipt.status === 1,
              summary: 'Staked '+amount+' '+token1.symbol+"-"+token2.symbol+' LP to farm',
            }
          },
          receipt.transactionHash
      )
      dispatch(fetchPoolsUserDataAsync({chainId, account, pools}))
    }
  }

  const TooltipContentRisk: React.FC<ToolTipProps> = ({option}) => {return (
    <ToolTip style={{left: width >= 700 ? '-410px' : '-230px', bottom: width >= 700 ? '-10px' : '-20px', width: width >= 700 ? '400px' : '230px'}} show={hoverRisk}>
      <Text fontSize='13px' fontWeight={500} color={theme.text1}>
      {`${option === 'health' ? 'The health factor measures how balanced this Stable vault is. Imbalanced vaults may be partially slashed when withdrawing during critical market activity.' :
          option === 'divergence' ? 'Divergence measures how much impermanent loss the Float vault is suffering.' :
          'General info'}`}
      </Text>
    </ToolTip>
  )}
  const [hovered, setHovered] = useState(false)
  const {chainId} = useActiveWeb3React()

  return (
      <>
        {showModal && (
            <ModalTopDeposit
                pool={pool}
                max={tokenBalance}
                lpLabel = {lpLabel}
                apr = {1}
                onDismiss = {() => setShowModal(false) }
                displayApr = {'111'}
                stakedBalance = {stakedBalance}
                onConfirm = {handleStake }
                tokenName = {farm.stakingToken.symbol}
                addLiquidityUrl = {farm.isClassic ?
                    `#/add/${farm.token1.address}/${farm.token2.address}` :
                    `#/add-pro/${farm.token1.address}/${farm.token2.address}/${farm.isAnchor ? 'stable' : 'float'}`}
                cakePrice = {1 as unknown as BigNumber}
                token = {farm.stakingToken}
            />
        )}
        <Container expanded={expanded} staked={staked}>
          <QuarterContainer>
            <ActionContainer style={{padding: '0 10px'}}>
              {width >= 800 ? (
                  <SpaceBetween>
                    <div>
                      <>
                        <Flex flexWrap='wrap'>
                          <BadgeSmall
                              style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '0px', display: 'flex', alignItems: 'center', marginRight: '5px'}}>
                      <span
                      style={{
                        color: theme.darkMode ? theme.text1 : "#080506",
                        fontSize: "16px",
                        marginRight: "3px",
                        fontWeight: 400,
                        letterSpacing: "0",
                      }}
                      >
                        {!isClassic && (!isAnchor ? token1.symbol : token2.symbol)}{" "}
                        {isClassic ? "CLASSIC" : !isAnchor ? "Float" : "Stable"}
                      </span>                          </BadgeSmall>
                          <Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{`${token1.symbol}/${token2.symbol}`}</Text>
                        </Flex>
                      </>
                    </div>
                    {isClassic ? (
                        <DoubleCurrencyLogo currency0={token1} currency1={token2} margin={false} size={width >= 500 ? 25 : 30} />
                    ) : (
                        <DoubleCurrencyLogo currency0={!isAnchor ? token1 : token2} currency1={null} margin={false} size={30} />
                    )}
                  </SpaceBetween>
              ) : (
                  <SpaceBetween style={{paddingTop: '16px', paddingBottom: '5px', marginBottom: '5px', borderBottom: `1px solid ${theme.opacitySmall}`}}>
                    <Flex alignItems={'center'}>
                      {isClassic ? (
                          <DoubleCurrencyLogo currency0={token1} currency1={token2} margin={false} size={width >= 500 ? 25 : 30} />
                      ) : (
                          <DoubleCurrencyLogo currency0={!isAnchor ? token1 : token2} currency1={null} margin={false} size={30} />
                      )}
                      <div>
                        <>
                          <Flex flexWrap='wrap'>
                            <BadgeSmall
                                style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '0px', display: 'flex', alignItems: 'center', marginRight: '5px'}}>
                                <span
                                style={{
                                  color: theme.darkMode ? theme.text1 : "#080506",
                                  fontSize: "16px",
                                  marginRight: "3px",
                                  fontWeight: 400,
                                  letterSpacing: "0",
                                }}
                                >
                                  {!isClassic && (!isAnchor ? token1.symbol : token2.symbol)}{" "}
                                  {isClassic ? "CLASSIC" : !isAnchor ? "Float" : "Stable"}
                                </span>                             
                              </BadgeSmall>
                          </Flex>
                        </>
                      </div>
                    </Flex>
                    <QuarterContainer onClick={() => clickAction(false)}
                                      style={{justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexDirection: 'row'}}>
                    <Text color={theme.whiteHalf} style={{minWidth: 'max-content'}} fontWeight={400}>{`${token1.symbol}/${token2.symbol}`}</Text>
                      <ArrowIcon toggled={expanded}  />
                    </QuarterContainer>
                  </SpaceBetween>
              )}
              {!farm.isFinished && <DaysLeftBar startBlock={farm.startBlock} endBlock={farm.endBlock} currentBlock={currentBlock} viewMode={'actionPanel'} />}
                  <>
                    <Flex>
                    {
                    !farm.isFinished ?
                    <>
                      <Flex flexDirection={'row'} style={{width: '100%', marginBottom: '5px', marginTop: '10px', justifyContent: 'space-between'}}>
                        <Text color={theme.text1} style={{minWidth: 'max-content', fontSize: '13px'}} fontWeight={400}>{'Monthly rewards'}</Text>
                        <Flex flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
                          <RewardPerBlock earningRewardsBlock={pool.earningTokenInfo} />
                        </Flex>
                      </Flex>
                    </> : <></>
                    }
                    </Flex>
                    <SpaceBetween style={{borderTop: `1px solid ${theme.opacitySmall}`, paddingTop: '5px', marginBottom: width <= 800 && '20px'}}>
                      <StyledLinkExternal style={{color:theme.darkMode ? theme.meatPink : theme.poolPinkButton, fontWeight: 400}} 
                      href={getEtherscanLink(chainId, farm?.contractAddress, 'address')}>
                        {t('View contract ↗')}
                      </StyledLinkExternal>
                      <StyledLinkExternal style={{color:theme.darkMode ? theme.meatPink : theme.poolPinkButton, fontWeight: 400}} 
                      href={getEtherscanLink(chainId, farm?.lpAddress, 'address')}>
                        {t('See pair info ↗')}
                      </StyledLinkExternal>
                    </SpaceBetween>
                  </>
            </ActionContainer>
          </QuarterContainer>

          {staked ? (
              <>
                <QuarterContainer>
                  <ActionContainer>
                    <HarvestAction {...farm} userDataReady={userDataReady} />
                  </ActionContainer>
                </QuarterContainer>

                <QuarterContainer style={{paddingLeft: width > 800 ? '5px' : '0'}}>
                  <ActionContainer>
                    <StakedAction {...farm} userDataReady={userDataReady} lpLabel={lpLabel} displayApr={apr.value} />
                  </ActionContainer>
                </QuarterContainer>
              </>
          ) : (
              <QuarterContainer >
                {(isApproved || chainId === 1285) ? (
                        <StakeAdd 
                          pink={true} clickAction={() => {!farm.isFinished && setShowModal(true)}} 
                          row={true} margin={false} 
                          width={'100px'} 
                          height='42px' 
                          isFinished={farm.isFinished} />)
                    : (
                        <ButtonPinkGamma 
                        onMouseOver={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        style={{
                            background: hovered ? theme.pinkGamma : '#B05D98',
                            border: 'none', 
                            color: '#FFF', 
                            height: '42px', 
                            padding: '0 15px', 
                            borderRadius: '12px', 
                            width: 'auto'
                          }}
                                        m="auto" width="150px" disabled={pendingTx || farm.isFinished} onClick={account ? handleApproval : toggleWalletModal}>
                          {account ? 'Enable contract' : 'Connect wallet'}
                        </ButtonPinkGamma>
                    )}
              </QuarterContainer>
          )}


          <QuarterContainer style={{padding: width < 992 ? '0 10px' : '0 0 0 10px', justifyContent: 'center'}}>
            <ValueContainer>
              <ValueWrapper>
                <Text fontSize='13px' fontWeight={400} color={theme.text1}>{t('APR')}</Text>
                <Apr white={true} left={true} {...apr} showHover={false} />
              </ValueWrapper>
              <ValueWrapper>
                <Text color={theme.text1} fontSize='13px' fontWeight={400}>{t('Liquidity')}</Text>
                <Liquidity small={true} {...liquidity} />
              </ValueWrapper>
              {!farm.isFinished && <SpaceBetween>
              <Text color={theme.text1} fontSize='13px' fontWeight={400}>{isAnchor ? 'Health Factor' : 'Divergence'}</Text>
              <div style={{display: 'flex', marginLeft: '20px', alignItems: 'center', justifyContent: 'flex-end'}}>
                <CapacityIndicatorSmall showHover={false} gamma={gamma} health={healthFactor} isFloat={!isAnchor} noSpan={true} hoverPage={'farmAction'}
                currencies={[token1, token2]}
                 />
                <QuestionMarkContainer
                    onMouseEnter={() => setHoverRisk(true)}
                    onMouseLeave={() => setHoverRisk(false)}
                >{hoverRisk && (
                    <TooltipContentRisk option={!isAnchor ? 'divergence' : 'health'} />
                )}
                  <QuestionMarkIcon />
                </QuestionMarkContainer>
              </div>
              </SpaceBetween>}
              <Link to={farm.isClassic ?
                  `/add/${farm.token1.address}/${farm.token2.address}` :
                  `/add-pro/${farm.token1.address}/${farm.token2.address}/${farm.isAnchor ? 'stable' : 'float'}`}>
                <ButtonLinkGet
                style={{
                  margin: '10px 0',
                  padding: '5px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 500 }}>
                  {`Get ${token1.symbol} - ${token2.symbol} ${isClassic ? 'Classic' : isAnchor ? 'Stable' : 'Float'} LP`}</ButtonLinkGet>
              </Link>
            </ValueContainer>
          </QuarterContainer>
          {width >= 800 && <QuarterContainer onClick={() => clickAction(false)} style={{justifyContent: 'center', alignItems: 'center', cursor: 'pointer'}}>
            <ArrowIcon toggled={expanded}  />
          </QuarterContainer>}
        </Container>
      </>
  )
}

export default ActionPanel
