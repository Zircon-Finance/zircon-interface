import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import styled, { keyframes, css, useTheme } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Text } from '@pancakeswap/uikit'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { getAddress } from '../../../../../utils/addressHelpers'
// import { getBscScanLink } from 'utils'
import { FarmWithStakedValue } from '../../types'

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
import useToast from '../../../../../hooks/useToast'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
import { ToastDescriptionWithTx } from '../../../../../components/Toast'
import { fetchFarmUserDataAsync } from '../../../../../state/farms'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import useApproveFarm from '../../../hooks/useApproveFarm'
import { useERC20 } from '../../../../../hooks/useContract'
import { ModalContainer } from '../../../Farms'

export interface ActionPanelProps {
  apr: AprProps
  staked: StakedProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
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
  background: ${({ theme }) => theme.anchorFloatBadge};
  display: grid;
  width: 100%;
  padding: 5px;
  border-radius: 17px;
  margin-top: 5px;
  grid-template-columns: ${({ staked }) => staked ? '22% 22% 22% auto 40px' : '22% 44% auto 40px'};
  gap: 5px;
  position: relative;
`

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

// const ModalBehind = {position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '1'}

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
  const { quoteToken, token } = farm
  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  // getLiquidityUrlPathParts({
  //   quoteTokenAddress: quoteToken.address,
  //   tokenAddress: token.address,
  // })
  const lpAddress = getAddress(farm.lpAddresses)
  const bsc = 'placeholder'
  // getBscScanLink(lpAddress, 'address')
  const info = `/info/pool/${lpAddress}`
  const theme = useTheme()

  const lpPrice = useLpTokenPrice(farm.lpSymbol)
  const { tokenBalance, stakedBalance } = useFarmUser(farm.pid)
  const [showModal, setShowModal] = useState(false)

  const { onStake } = useStakeFarms(farm.pid)
  const { toastSuccess } = useToast()
  const { account } = useWeb3React()
  const dispatch = useDispatch()
  const { allowance } = farm.userData || {}
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const lpContract = useERC20(lpAddress)
  const { onApprove } = useApproveFarm(lpContract)


  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove()
    })
    if (receipt?.status) {
      toastSuccess(t('Contract Enabled'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      dispatch(fetchFarmUserDataAsync({ account, pids: [farm.pid] }))
    }
  }, [onApprove, dispatch, account, farm.pid, t, toastSuccess, fetchWithCatchTxError])

  const handleStake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount)
    })
    if (receipt?.status) {
      toastSuccess(
        `${t('Staked')}!`,
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Your funds have been staked in the farm')}
        </ToastDescriptionWithTx>,
      )
      dispatch(fetchFarmUserDataAsync({ account, pids: [farm.pid] }))
    }
  }

  return (
    <>
    {showModal && (
      <ModalContainer>
        <DepositModal
        max={tokenBalance}
        lpPrice={lpPrice}
        lpLabel={lpLabel}
        apr={farm.apr}
        onDismiss={() => setShowModal(false)}
        displayApr={'111'}
        stakedBalance={stakedBalance}
        onConfirm={handleStake}
        tokenName={farm.lpSymbol}
        multiplier={farm.multiplier}
        addLiquidityUrl={'Placeholder'}
        cakePrice={112 as unknown as BigNumber}
      />
      </ModalContainer>
    )}
    <Container expanded={expanded} staked={staked}>
      <QuarterContainer>
        <ActionContainer style={{padding: '0 10px'}}>
          <SpaceBetween>
            <span>{token.name + '-' + quoteToken.name}</span>
            <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={25} />
          </SpaceBetween>
          <SpaceBetween>
            <BadgeSmall style={{fontSize: '13px',margin: '0'}}>{'ANCHOR'}</BadgeSmall>
            <span>{'High risk'}</span>
          </SpaceBetween>
          <SpaceBetween>
            <StyledLinkExternal color={theme.whiteHalf} href={bsc}>{t('View Contract ↗')}</StyledLinkExternal>
            <StyledLinkExternal color={theme.whiteHalf} href={info}>{t('See Pair Info ↗')}</StyledLinkExternal>
          </SpaceBetween>
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
        <StakeAdd clickAction={() => {setShowModal(true)}} row={true} margin={false} width={'30%'} />)
        : (
          <ButtonOutlined mt='10px' mb='50px' width="100%" disabled={pendingTx} onClick={handleApprove}>
            {t('Enable Contract')}
          </ButtonOutlined>
        )}
      </QuarterContainer>
    )}
     

      <QuarterContainer style={{paddingLeft: '10px'}}>
        <ValueContainer>
          <ValueWrapper>
            <Text fontSize='13px' fontWeight={300}>{t('APR')}</Text>
            <Apr left={true} {...apr} />
          </ValueWrapper>
          <ValueWrapper>
            <Text fontSize='13px' fontWeight={300}>{t('Liquidity')}</Text>
            <Liquidity {...liquidity} />
          </ValueWrapper>
          <ButtonOutlined style={{padding: '10px', fontSize: '13px'}}>{`Get ${token.name} - ${quoteToken.name} Anchor LP`}</ButtonOutlined>
        </ValueContainer>
      </QuarterContainer>
      <QuarterContainer onClick={() => clickAction(false)} style={{justifyContent: 'center', alignItems: 'center', cursor: 'pointer'}}>
        <ArrowIcon toggled={expanded}  />
      </QuarterContainer>

    </Container>
    </>
  )
}

export default ActionPanel
