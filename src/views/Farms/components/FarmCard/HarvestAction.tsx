import React from 'react'
import { Flex, Heading} from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Balance from '../../../../components/Balance'
import { useTranslation } from 'react-i18next'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import { useDispatch } from 'react-redux'
import { usePriceCakeBusd } from '../../../../state/farms/hooks'
import { BIG_ZERO } from '../../../../utils/bigNumber'
import { getBalanceAmount } from '../../../../utils/formatBalance'
import useHarvestFarm from '../../hooks/useHarvestFarm'
import { ButtonLighter } from '../../../../components/Button'
import { useTheme } from 'styled-components'
import { fetchPoolsUserDataAsync } from '../../../../state/pools'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { useAddPopup } from '../../../../state/application/hooks'
import { Token } from 'zircon-sdk'

interface FarmCardActionsProps {
  earnings?: BigNumber
  pid?: number
  earningToken: Token
}

const HarvestAction: React.FC<FarmCardActionsProps> = ({ earningToken,earnings, pid }) => {
  const { account } = useWeb3React()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { t } = useTranslation()
  const { onReward } = useHarvestFarm(pid)
  const cakePrice = usePriceCakeBusd()
  const dispatch = useDispatch()
  const rawEarningsBalance = account ? getBalanceAmount(earnings) : BIG_ZERO
  const displayBalance = rawEarningsBalance.toFixed(3, BigNumber.ROUND_DOWN)
  const earningsBusd = rawEarningsBalance ? rawEarningsBalance.multipliedBy(cakePrice).toNumber() : 0
  const theme = useTheme()
  const addPopup = useAddPopup()
  const addTransaction = useTransactionAdder()

  return (
    <Flex mb="8px" justifyContent="space-between" alignItems="center">
      <Flex flexDirection="column" alignItems="flex-start">
        <Heading style={{fontSize: '24px', fontWeight: 400}} color={rawEarningsBalance.eq(0) ? theme.whiteHalf : theme.text1}>{displayBalance}</Heading>
          <Balance fontSize="12px" color={theme.whiteHalf} decimals={2} value={earningsBusd} unit=" USD" prefix="~" />
      </Flex>
      <ButtonLighter
        style={{width: 'auto', background: theme.hoveredButton, color: '#fff'}}
        disabled={rawEarningsBalance.eq(0) || pendingTx}
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
      </ButtonLighter>
    </Flex>
  )
}

export default HarvestAction
