import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
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
import { ButtonOutlined } from '../../../../../components/Button'
import { ArrowIcon } from '../Details'
import StakeAdd from '../../FarmCard/StakeAdd'
import DepositModal from '../../DepositModal'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useERC20, useSousChef } from '../../../../../hooks/useContract'
import { ModalContainer } from '../../../Farms'
import { useAddPopup, useWalletModalToggle } from '../../../../../state/application/hooks'
import { Link } from 'react-router-dom'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { useWindowDimensions } from '../../../../../hooks'
import { Flex } from 'rebass'
import { Token } from 'zircon-sdk'
import { DeserializedPool } from '../../../../../state/types'
import { usePool } from '../../../../../state/pools/hooks'
import { fetchPoolsUserDataAsync } from '../../../../../state/pools'
import { useCallWithGasPrice } from '../../../../../hooks/useCallWithGasPrice'
import { BIG_ZERO } from '../../../../../utils/bigNumber'

export interface ActionPanelProps {
  apr: AprProps
  staked: StakedProps
  multiplier?: MultiplierProps
  liquidity: LiquidityProps
  details: DeserializedPool
  userDataReady: boolean
  expanded: boolean
  clickAction: Dispatch<SetStateAction<boolean>>
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
  background: ${({ theme }) => theme.card.background};
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 5px;
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
}

export const ModalTopDeposit: React.FunctionComponent<ModalProps> = ({
  max, 
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
}) => {
  const farm = details
  const staked = details.userData.stakedBalance.gt(0)
  const { t } = useTranslation()
  const { earningToken, stakingToken, isAnchor, token1, token2, isClassic } = farm
  const lpLabel = `${farm.token1.symbol}-${farm.token2.symbol}`
  // getLiquidityUrlPathParts({
  //   quoteTokenAddress: quoteToken.address,
  //   tokenAddress: token.address,
  // })
  const bsc = 'placeholder'
  // getBscScanLink(lpAddress, 'address')
  const lpAddress = farm.stakingToken.address
  const info = `/info/pool/${lpAddress}`
  const theme = useTheme()

  const { pool } = usePool(farm.sousId)
  const tokenBalance = pool.userData.stakingTokenBalance
  const stakedBalance = pool.userData.stakedBalance
  const [showModal, setShowModal] = useState(false)
  const { onStake } = useStakeFarms(farm.sousId)
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
  const sousChefContract = useSousChef(pool.sousId)
  const { callWithGasPrice } = useCallWithGasPrice()
  console.log('Pending rewards: ',farm.userData.pendingReward.toFixed(6))
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
      dispatch(fetchPoolsUserDataAsync(account))
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
            summary: 'Staked '+amount+' '+earningToken.symbol+"-"+stakingToken.symbol+' LP to farm',
          }
        },
        receipt.transactionHash
      )  
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }

  return (
    <>
    {showModal && (
      <ModalTopDeposit 
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
          `#/add-pro/${farm.token1.address}/${farm.token2.address}`}
        cakePrice = {1 as unknown as BigNumber}
        token = {farm.stakingToken}
        />
    )}
    <Container expanded={expanded} staked={staked}>
      <QuarterContainer>
        <ActionContainer style={{padding: '0 10px'}}>
            {width >= 800 ? (
              <SpaceBetween>
                  <div style={{letterSpacing: '0.05em'}}>
                  {!isClassic ? (
                  !isAnchor ? (
                    <>
                    <Flex flexWrap='wrap'>  
                      <BadgeSmall 
                      style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '0px', display: 'flex', alignItems: 'center', marginRight: '5px'}}>
                      <span style={{color: theme.text1, fontSize: '16px', marginRight: '3px'}}>{token1.symbol} </span>{'FLOAT'}
                      </BadgeSmall>
                      <Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{` - ${token2.symbol}`}</Text>
                    </Flex>
                      
                    </>
                  ) : (
                    <>
                    <Flex flexWrap='wrap'>
                      <Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{token1.symbol} -</Text>
                      <BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '5px', display: 'flex', alignItems: 'center'}}>
                        <span style={{color: theme.text1, fontSize: '16px', marginRight: '3px'}}>{`${token2.symbol}`}</span>{'ANCHOR'}
                      </BadgeSmall>
                    </Flex>
                    </>
                  )) : (
                    <Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{token1.symbol} - {token2.symbol}</Text>
                  )}
                  </div>
                  <DoubleCurrencyLogo currency0={token1} currency1={token2} size={25} />
              </SpaceBetween>
            ) : (
              <SpaceBetween style={{paddingTop: '16px'}}>
                <Flex alignItems={'center'} style={{gap: '10px'}}>
                  <DoubleCurrencyLogo currency0={token1} currency1={token2} size={25} />
                  <div>
                  {!isClassic ? (
                  !isAnchor ? (
                    <>
                    <Flex flexWrap='wrap'>  
                      <BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '0px', display: 'flex', alignItems: 'center'}}>
                      <span style={{color: theme.text1, fontSize: '16px', marginRight: '3px'}}>{token1.symbol} </span>{'FLOAT'}
                      </BadgeSmall>
                      <Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{` - ${token2.symbol}`}</Text>
                    </Flex>
                      
                    </>
                  ) : (
                    <>
                    <Flex flexWrap='wrap'>
                      <Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{token1.symbol} -</Text>
                      <BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '5px', display: 'flex', alignItems: 'center'}}>
                        <span style={{color: theme.text1, fontSize: '16px', marginRight: '3px'}}>{`${token2.symbol}`}</span>{'ANCHOR'}
                      </BadgeSmall>
                    </Flex>
                    </>
                  )) : (
                    <Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{token1.symbol} - {token2.symbol}</Text>
                  )}
                  </div>
                </Flex>
                <QuarterContainer onClick={() => clickAction(false)} 
                  style={{justifyContent: 'center', alignItems: 'center', cursor: 'pointer'}}>
                  <ArrowIcon toggled={expanded}  />
                </QuarterContainer>
              </SpaceBetween>
            )}
          {width >= 800 ? (
          <>
          <SpaceBetween>
            <Flex flexDirection={'column'}>
              <StyledLinkExternal style={{marginBottom: '5px'}} color={theme.meatPink} href={bsc}>{t('View Contract')}</StyledLinkExternal>
              <StyledLinkExternal color={theme.meatPink} href={info}>{t('See Pair Info')}</StyledLinkExternal>
            </Flex>
            <span>{'High risk'}</span>
          </SpaceBetween>
          </> ) : (
            <>
            <SpaceBetween style={{marginBottom: '16px'}}>
              <Flex style={{flexDirection: 'column'}}>
              <StyledLinkExternal style={{margin: '5px 0 5px 0'}} color={theme.meatPink} href={bsc}>{t('View Contract ↗')}</StyledLinkExternal>
              <StyledLinkExternal color={theme.meatPink} href={info}>{t('See Pair Info ↗')}</StyledLinkExternal>
              </Flex>
              <span>{'High risk'}</span>
            </SpaceBetween>
            </>
          )}

          {/* <TagsContainer> */}
            {/* {farm.isCommunity ? <FarmAuctionTag /> : <CoreTag />} */}
            {/* {dual ? <DualTag /> : null} */}
          {/* </TagsContainer> */}
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
        {isApproved ? (
        <StakeAdd clickAction={() => {setShowModal(true)}} row={true} margin={false} width={width > 992 ? '30%' : '60%'} />)
        : (
          <ButtonOutlined style={{background: theme.hoveredButton, border: 'none', color: '#FFF'}} 
          m="auto" width="50%" disabled={pendingTx} onClick={account ? handleApproval : toggleWalletModal}>
            {account ? 'Enable Contract' : 'Connect Wallet'}
          </ButtonOutlined>
        )}
      </QuarterContainer>
    )}
     

      <QuarterContainer style={{padding: width < 992 ? '0 10px' : '0 0 0 10px'}}>
        <ValueContainer>
          <ValueWrapper>
            <Text fontSize='13px' fontWeight={300} color={theme.text1}>{t('APR')}</Text>
            <Apr left={true} {...apr} />
          </ValueWrapper>
          <ValueWrapper>
            <Text color={theme.text1} fontSize='13px' fontWeight={300}>{t('Liquidity')}</Text>
            <Liquidity {...liquidity} />
          </ValueWrapper>
          <Link to={farm.isClassic ?
                      `/add/${farm.token1.address}/${farm.token2.address}` :
                      `/add-pro/${farm.token1.address}/${farm.token2.address}`}>
            <ButtonOutlined style={{margin: '10px 0', padding: '10px', fontSize: '13px', color: theme.hoveredButton, background: theme.contrastLightButton, border: 'none'}}>
              {`Get ${token1.name} - ${token2.name} ${isClassic ? 'Classic' : isAnchor ? 'Anchor' : 'Float'} LP`}</ButtonOutlined>
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
