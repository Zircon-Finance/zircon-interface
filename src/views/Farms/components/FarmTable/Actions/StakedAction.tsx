import React from 'react'
import { Button, IconButton, Skeleton, Text, useModal } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
// import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from '../../../../../components/Toast'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { useTranslation } from 'react-i18next'

import { useERC20 } from '../../../../../hooks/useContract'
import useToast from '../../../../../hooks/useToast'
import useCatchTxError from '../../../../../hooks/useCatchTxError'
// import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from '../../../../../state/farms'
import { useFarmUser, useLpTokenPrice, usePriceCakeBusd } from '../../../../../state/farms/hooks'
import styled, { useTheme } from 'styled-components'
import { getAddress } from '../../../../../utils/addressHelpers'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import useApproveFarm from '../../../hooks/useApproveFarm'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useUnstakeFarms from '../../../hooks/useUnstakeFarms'
import DepositModal from '../../DepositModal'
import WithdrawModal from '../../WithdrawModal'
import { ActionContainer, ActionContent, ActionTitles } from './styles'
import { FarmWithStakedValue } from '../../types'
import StakedLP from '../../StakedLP'
import PlusIcon from '../../PlusIcon'
import MinusIcon from '../../MinusIcon'

const IconButtonWrapper = styled.div`
  display: flex;
`

interface StackedActionProps extends FarmWithStakedValue {
  userDataReady: boolean
  lpLabel?: string
  displayApr?: string
}

const Staked: React.FunctionComponent<StackedActionProps> = ({
  pid,
  apr,
  multiplier,
  lpSymbol,
  lpLabel,
  lpAddresses,
  quoteToken,
  token,
  userDataReady,
  displayApr,
  lpTotalSupply,
  tokenAmountTotal,
  quoteTokenAmountTotal,
}) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { account } = useWeb3React()
  const { allowance, tokenBalance, stakedBalance } = useFarmUser(pid)
  const { onStake } = useStakeFarms(pid)
  const { onUnstake } = useUnstakeFarms(pid)
  // const router = useRouter()
  const lpPrice = useLpTokenPrice(lpSymbol)
  const cakePrice = usePriceCakeBusd()

  const isApproved = account && allowance && allowance.isGreaterThan(0)

  const lpAddress = getAddress(lpAddresses)
  // const liquidityUrlPathParts = 'placeholder'
  // getLiquidityUrlPathParts({
  //   quoteTokenAddress: quoteToken.address,
  //   tokenAddress: token.address,
  // })
  const addLiquidityUrl = 'placeholder'
  // `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`

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
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }

  const handleUnstake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onUnstake(amount)
    })
    if (receipt?.status) {
      toastSuccess(
        `${t('Unstaked')}!`,
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Your earnings have also been harvested to your wallet')}
        </ToastDescriptionWithTx>,
      )
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }

  const [onPresentDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      lpPrice={lpPrice}
      lpLabel={lpLabel}
      apr={apr}
      displayApr={displayApr}
      stakedBalance={stakedBalance}
      onConfirm={handleStake}
      tokenName={lpSymbol}
      multiplier={multiplier}
      addLiquidityUrl={addLiquidityUrl}
      cakePrice={cakePrice}
    />,
  )
  const [onPresentWithdraw] = useModal(
    <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={lpSymbol} />,
  )
  const lpContract = useERC20(lpAddress)
  const dispatch = useDispatch()
  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      return onApprove()
    })
    if (receipt?.status) {
      toastSuccess(t('Contract Enabled'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
    }
  }, [onApprove, dispatch, account, pid, t, toastSuccess, fetchWithCatchTxError])
  const theme = useTheme()

  if (!account) {
    return (
      <ActionContainer style={{background: theme.bg6}}>
        <ActionTitles>
          <Text fontSize="13px">
            {t('Start Farming')}
          </Text>
        </ActionTitles>
        <ActionContent>
          {/* <ConnectWalletButton width="100%" /> */}
        </ActionContent>
      </ActionContainer>
    )
  }

  if (isApproved) {
    if (stakedBalance.gt(0)) {
      return (
        <ActionContainer style={{background: theme.bg6}}>
          <ActionTitles>
            <Text fontSize="13px">
              {t('Staked')}
            </Text>
          </ActionTitles>
          <ActionContent>
            <StakedLP
              stakedBalance={stakedBalance}
              lpSymbol={lpSymbol}
              quoteTokenSymbol={quoteToken.symbol}
              tokenSymbol={token.symbol}
              lpTotalSupply={lpTotalSupply}
              tokenAmountTotal={tokenAmountTotal}
              quoteTokenAmountTotal={quoteTokenAmountTotal}
            />
            <IconButtonWrapper>
            <IconButton style={{background: 'transparent', width: 'auto'}} variant="tertiary" onClick={onPresentWithdraw} mr="6px">
              <MinusIcon />
            </IconButton>
              <IconButton
                style={{background: 'transparent', width: 'auto', border:'none'}} 
                variant="secondary"
                onClick={onPresentDeposit}
                disabled={['history', 'archived'].some((item) => window.location.pathname.includes(item))}
              >
                <PlusIcon/>
              </IconButton>
            </IconButtonWrapper>
          </ActionContent>
        </ActionContainer>
      )
    }

    return (
      <ActionContainer style={{background: theme.bg6}}>
        <ActionTitles>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px" pr="4px">
            {t('Stake')}
          </Text>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px">
            {lpSymbol}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Button
            width="100%"
            onClick={onPresentDeposit}
            variant="secondary"
            disabled={['history', 'archived'].some((item) => window.location.pathname.includes(item))}
          >
            {t('Stake LP')}
          </Button>
        </ActionContent>
      </ActionContainer>
    )
  }

  if (!userDataReady) {
    return (
      <ActionContainer style={{background: theme.bg6}}>
        <ActionTitles>
          <Text fontSize="13px">
            {t('Start Farming')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Skeleton width={180} marginBottom={28} marginTop={14} />
        </ActionContent>
      </ActionContainer>
    )
  }

  return (
    <ActionContainer style={{background: theme.bg6}}>
      <ActionTitles>
        <Text fontSize="13px">
          {t('Enable Farm')}
        </Text>
      </ActionTitles>
      <ActionContent>
        <Button width="100%" disabled={pendingTx} onClick={handleApprove} variant="secondary">
          {t('Enable')}
        </Button>
      </ActionContent>
    </ActionContainer>
  )
}

export default Staked
