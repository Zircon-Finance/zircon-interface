import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import styled, { keyframes, css, useTheme } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Text } from '@pancakeswap/uikit'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
// import { getBscScanLink } from 'utils'
import { FarmWithStakedValue } from '../../types'
import Portal from '@reach/portal'
import HarvestAction from './HarvestAction'
import StakedAction from './StakedAction'
import Apr, { AprProps } from '../Apr'
import { MultiplierProps } from '../Multiplier'
import Liquidity, { LiquidityProps } from '../Liquidity'
import { StakedProps } from '../Staked'
import DoubleCurrencyLogo from '../../../../../components/DoubleLogo'
import { BadgeSmall } from '../../../../../components/Header'
import { ButtonOutlined } from '../../../../../components/Button'
import { ArrowIcon } from '../Details'
import StakeAdd from '../../FarmCard/StakeAdd'
import DepositModal from '../../DepositModal'
import { useFarmUser, useLpTokenPrice } from '../../../../../state/farms/hooks'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
import { fetchFarmUserDataAsync } from '../../../../../state/farms'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import useApproveFarm from '../../../hooks/useApproveFarm'
import { useERC20 } from '../../../../../hooks/useContract'
import { ModalContainer } from '../../../Farms'
import { useAddPopup, useWalletModalToggle } from '../../../../../state/application/hooks'
import { Link } from 'react-router-dom'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { useWindowDimensions } from '../../../../../hooks'
import { Flex } from 'rebass'

export interface ActionPanelProps {
  apr: AprProps
  staked: StakedProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
  userDataReady: boolean
  expanded: boolean
  zIndex: number
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

const Container = styled.div<{ expanded, staked, zIndex }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: hidden;
  background: ${({ theme }) => theme.anchorFloatBadge};
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 5px;
  border-radius: 17px;
  margin-bottom: 5px;
  grid-template-columns: ${({ staked }) => staked ? '25% 20% 20% auto 40px' : '25% 35% auto 40px'};
  @media (min-width: 800px) {
    grid-template-columns: ${({ staked }) => staked ? '22% 25% 25% auto 40px' : '22% 50% auto 40px'};
    display: grid;
    gap: 5px;
  }
  position: relative;
  z-index: ${({ zIndex }) => zIndex};
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

export const modalTopDeposit = (max, lpPrice, lpLabel, apr, onDismiss, displayApr, stakedBalance, onConfirm, tokenName, multiplier, addLiquidityUrl, cakePrice) => {
  return (
    <Portal>
      <ModalContainer>
        <DepositModal
        max={max}
        lpPrice={lpPrice}
        lpLabel={lpLabel}
        apr={apr}
        onDismiss={onDismiss}
        displayApr={displayApr}
        stakedBalance={stakedBalance}
        onConfirm={onConfirm}
        tokenName={tokenName}
        multiplier={multiplier}
        addLiquidityUrl={addLiquidityUrl}
        cakePrice={cakePrice}
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
  zIndex,
}) => {
  const farm = details
  const staked = details.userData.stakedBalance.gt(0)
  const { t } = useTranslation()
  const { quoteToken, token } = farm
  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  // getLiquidityUrlPathParts({
  //   quoteTokenAddress: quoteToken.address,
  //   tokenAddress: token.address,
  // })
  const lpAddress = farm.lpAddress
  const bsc = 'placeholder'
  // getBscScanLink(lpAddress, 'address')
  const info = `/info/pool/${lpAddress}`
  const theme = useTheme()

  const lpPrice = useLpTokenPrice(farm.lpSymbol)
  const { tokenBalance, stakedBalance } = useFarmUser(farm.pid)
  const [showModal, setShowModal] = useState(false)
  const { onStake } = useStakeFarms(farm.pid)
  const { account } = useWeb3React()
  const dispatch = useDispatch()
  const { allowance } = farm.userData || {}
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const lpContract = useERC20(lpAddress)
  const { onApprove } = useApproveFarm(lpContract)
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()
  const toggleWalletModal = useWalletModalToggle()
  const { width } = useWindowDimensions()

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove().then(response => {
        addTransaction(response, {
          summary: `Enable ${token.symbol}-${quoteToken.symbol} stake contract`
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
      dispatch(fetchFarmUserDataAsync({ account, pids: [farm.pid] }))
    }
  }, [onApprove, dispatch, account, farm.pid, addPopup, fetchWithCatchTxError, addTransaction, quoteToken.symbol, token.symbol])

  const handleStake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount).then((response) => {
        addTransaction(response, {
          summary: `Stake ${token.symbol}-${quoteToken.symbol} tokens`
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
            summary: 'Staked '+amount+' '+token.symbol+"-"+quoteToken.symbol+' LP to farm',
          }
        },
        receipt.transactionHash
      )  
      dispatch(fetchFarmUserDataAsync({ account, pids: [farm.pid] }))
    }
  }

  return (
    <>

    {showModal && (
      modalTopDeposit(tokenBalance, 
        lpPrice, 
        lpLabel, 
        farm.apr, 
        () => setShowModal(false), 
        '111', 
        stakedBalance, 
        handleStake, 
        farm.lpSymbol, 
        farm.multiplier, 
        'Placeholder', 
        1 as unknown as BigNumber)
    )}
    <Container zIndex={zIndex} expanded={expanded} staked={staked}>
      <QuarterContainer>
        <ActionContainer style={{padding: '0 10px'}}>
            {width >= 800 ? (
              <SpaceBetween>
                  <span style={{fontWeight: '300'}}>{token.symbol + '-' + quoteToken.symbol}</span>
                  <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={25} />
              </SpaceBetween>
            ) : (
              <SpaceBetween style={{paddingTop: '16px'}}>
                <Flex alignItems={'center'} style={{gap: '10px'}}>
                  <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={25} />
                  <span style={{fontWeight: '300'}}>{token.symbol + '-' + quoteToken.symbol}</span>
                  <BadgeSmall style={{fontSize: '13px',margin: '0'}}>{'ANCHOR'}</BadgeSmall>
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
            <BadgeSmall style={{fontSize: '13px',margin: '0'}}>{'ANCHOR'}</BadgeSmall>
            <span>{'High risk'}</span>
          </SpaceBetween>
          <SpaceBetween>
            <StyledLinkExternal color={theme.whiteHalf} href={bsc}>{t('View Contract ↗')}</StyledLinkExternal>
            <StyledLinkExternal color={theme.whiteHalf} href={info}>{t('See Pair Info ↗')}</StyledLinkExternal>
          </SpaceBetween>
          </> ) : (
            <>
            <SpaceBetween style={{marginBottom: '16px'}}>
              <Flex style={{flexDirection: 'column'}}>
              <StyledLinkExternal style={{margin: '5px 0 5px 0'}} color={theme.whiteHalf} href={bsc}>{t('View Contract ↗')}</StyledLinkExternal>
              <StyledLinkExternal color={theme.whiteHalf} href={info}>{t('See Pair Info ↗')}</StyledLinkExternal>
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

      <QuarterContainer>
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
          <ButtonOutlined m="auto" width="50%" disabled={pendingTx} onClick={account ? handleApprove : toggleWalletModal}>
            {account ? 'Enable Contract' : 'Connect Wallet'}
          </ButtonOutlined>
        )}
      </QuarterContainer>
    )}
     

      <QuarterContainer style={{padding: width < 992 ? '0 10px' : '0 0 0 10px'}}>
        <ValueContainer>
          <ValueWrapper>
            <Text fontSize='13px' fontWeight={300}>{t('APR')}</Text>
            <Apr left={true} {...apr} />
          </ValueWrapper>
          <ValueWrapper>
            <Text fontSize='13px' fontWeight={300}>{t('Liquidity')}</Text>
            <Liquidity {...liquidity} />
          </ValueWrapper>
          <Link to={`/add-pro/${token.address}/${quoteToken.address}`}>
            <ButtonOutlined style={{padding: '10px', fontSize: '13px'}}>{`Get ${token.name} - ${quoteToken.name} Anchor LP`}</ButtonOutlined>
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
