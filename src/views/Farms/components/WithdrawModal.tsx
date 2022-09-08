import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Modal } from '@pancakeswap/uikit'
import { ModalActions, ModalInput } from '../../../components/ModalFarm'
import { useTranslation } from 'react-i18next'

import { getFullDisplayBalance } from '../../../utils/formatBalance'
import { ButtonLight, ButtonPrimary } from '../../../components/Button'
import { Token } from 'zircon-sdk'

interface WithdrawModalProps {
  max: BigNumber
  onConfirm: (amount: string, token: Token) => void
  onDismiss?: () => void
  tokenName?: string
  token: Token
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onConfirm, onDismiss, max, tokenName = '', token }) => {
  const [val, setVal] = useState('')
  const [pendingTx, setPendingTx] = useState(false)
  const { t } = useTranslation()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const valNumber = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  return (
    <Modal style={{position: 'absolute', width: 'auto', maxWidth: '360px'}} title={t('Unstake LP tokens')} onDismiss={onDismiss}>
      <ModalInput
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        value={val}
        max={fullBalance}
        symbol={tokenName}
        inputTitle={t('Unstake')}
      />
      <ModalActions>
        <ButtonLight mt={'15px'} height={'60px'} onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </ButtonLight>
        <ButtonPrimary mt={'15px'}
          disabled={pendingTx || !valNumber.isFinite() || valNumber.eq(0) || valNumber.gt(fullBalanceNumber)}
          onClick={async () => {
            setPendingTx(true)
            await onConfirm(val, token)
            onDismiss?.()
            setPendingTx(false)
          }}
          width="100%"
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </ButtonPrimary>
      </ModalActions>
    </Modal>
  )
}

export default WithdrawModal
