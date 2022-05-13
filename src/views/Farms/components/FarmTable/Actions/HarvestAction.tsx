import React from 'react'
import { Heading, Skeleton, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Balance from '../../../../../components/Balance'
import { useTranslation } from 'react-i18next'

import { ToastDescriptionWithTx } from '../../../../../components/Toast'
import useToast from '../../../../../hooks/useToast'
import useCatchTxError from '../../../../../hooks/useCatchTxError'

import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from '../../../../../state/farms'
import { usePriceCakeBusd } from '../../../../../state/farms/hooks'
import { BIG_ZERO } from '../../../../../utils/bigNumber'
import { getBalanceAmount } from '../../../../../utils/formatBalance'
import { FarmWithStakedValue } from '../../types'
import useHarvestFarm from '../../../hooks/useHarvestFarm'
import { ActionContainer, ActionContent, HarvestButton } from './styles'
import { useTheme } from 'styled-components'

interface HarvestActionProps extends FarmWithStakedValue {
  userDataReady: boolean
}

const HarvestAction: React.FunctionComponent<HarvestActionProps> = ({ pid, userData, userDataReady }) => {
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const earningsBigNumber = new BigNumber(userData.earnings)
  const cakePrice = usePriceCakeBusd()
  let earnings = BIG_ZERO
  let earningsBusd = 0
  let displayBalance = userDataReady ? earnings.toLocaleString() : <Skeleton width={60} />

  // If user didn't connect wallet default balance will be 0
  if (!earningsBigNumber.isZero()) {
    earnings = getBalanceAmount(earningsBigNumber)
    earningsBusd = earnings.multipliedBy(cakePrice).toNumber()
    displayBalance = earnings.toFixed(3, BigNumber.ROUND_DOWN)
  }

  const { onReward } = useHarvestFarm(pid)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const theme = useTheme()

  return (
    <ActionContainer style={{background: theme.bg6}}>
      <ActionContent>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%', alignItems: 'center'}}>
          <div style={{display: 'flex', flexFlow: 'column', height: '100%', justifyContent: 'space-between'}}>
            <Text fontSize="13px">
              {t('Earned')}
            </Text>
            <Heading style={{margin: '0'}} fontWeight={300}>{displayBalance}</Heading>
            {earningsBusd > 0 && (
              <Balance fontSize="13px" color={theme.whiteHalf} decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
            )}
          </div>
          <HarvestButton
          disabled={earnings.eq(0) || pendingTx || !userDataReady}
          onClick={async () => {
            const receipt = await fetchWithCatchTxError(() => {
              return onReward()
            })
            if (receipt?.status) {
              toastSuccess(
                `${t('Harvested')}!`,
                <ToastDescriptionWithTx txHash={receipt.transactionHash}>
                  {t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'CAKE' })}
                </ToastDescriptionWithTx>,
              )
              dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
            }
          }}
        >
          {pendingTx ? t('Harvesting') : t('Harvest')}
        </HarvestButton>
        </div>
        
      </ActionContent>
    </ActionContainer>
  )
}

export default HarvestAction
