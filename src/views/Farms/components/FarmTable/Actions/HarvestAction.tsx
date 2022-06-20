import React from 'react'
import { Heading, Skeleton, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Balance from '../../../../../components/Balance'
import { useTranslation } from 'react-i18next'

import useCatchTxError from '../../../../../hooks/useCatchTxError'

import { useDispatch } from 'react-redux'
import { BIG_ZERO } from '../../../../../utils/bigNumber'
import { getBalanceAmount } from '../../../../../utils/formatBalance'
import useHarvestFarm from '../../../hooks/useHarvestFarm'
import { ActionContainer, ActionContent, HarvestButton } from './styles'
import { useTheme } from 'styled-components'
import { DeserializedPool } from '../../../../../state/types'
import { useAddPopup } from '../../../../../state/application/hooks'
import { useTransactionAdder } from '../../../../../state/transactions/hooks'
import { fetchPoolsUserDataAsync } from '../../../../../state/pools'

interface HarvestActionProps extends DeserializedPool {
  userDataReady: boolean
}

const HarvestAction: React.FunctionComponent<HarvestActionProps> = ({ earningToken ,sousId, userData, userDataReady }) => {
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const earningsBigNumber = new BigNumber(userData.pendingReward)
  console.log('earningsBigNumber', earningsBigNumber)
  let earnings = BIG_ZERO
  let earningsBusd = 0
  let displayBalance = userDataReady ? userData.pendingReward.toLocaleString() : <Skeleton width={60} />

  // If user didn't connect wallet default balance will be 0
  if (!earningsBigNumber.isZero()) {
    earnings = getBalanceAmount(earningsBigNumber)
    displayBalance = earnings.toFixed(6, BigNumber.ROUND_DOWN)
  }

  const { onReward } = useHarvestFarm(sousId)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const theme = useTheme()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()

  return (
    <ActionContainer style={{background: theme.actionPanelBg}}>
      <ActionContent>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
          <div style={{display: 'flex', flexFlow: 'column', height: '100%', justifyContent: 'space-between'}}>
            <Text color={theme.text1} fontSize="13px">
              {t('Earned')}
            </Text>
            <Heading color={theme.text1} style={{margin: '8px 0', fontWeight: '400', fontSize: '24px'}}>{displayBalance}</Heading>
            {earningsBusd > 0 && (
              <Balance fontSize="12px" color={theme.whiteHalf} decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
            )}
          </div>
          <HarvestButton
          disabled={earnings.eq(0) || pendingTx || !userDataReady}
          onClick={async () => {
            const receipt = await fetchWithCatchTxError(() => {
              return onReward().then((response) => {
                addTransaction(response, {
                  summary: 'Harvest '+earningToken.symbol+' tokens'
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
                    summary: 'Harvest tokens',
                  }
                },
                receipt.transactionHash
              )
              dispatch(fetchPoolsUserDataAsync(account))
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
