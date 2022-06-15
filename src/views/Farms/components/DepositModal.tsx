import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Modal, Skeleton } from '@pancakeswap/uikit'
import { ModalActions, ModalInput } from '../../../components/ModalFarm'
import RoiCalculatorModal from '../../../components/RoiCalculatorModal'
import { useTranslation } from 'react-i18next'

import { getFullDisplayBalance, formatNumber } from '../../../utils/formatBalance'
import { getInterestBreakdown } from '../../../utils/compoundApyHelpers'
import { ButtonOutlined, ButtonPrimary } from '../../../components/Button'
import { Link } from 'rebass'
import { StyledErrorMessage } from '../../../components/ModalFarm/ModalInput'
import { Token } from 'zircon-sdk'

const AnnualRoiContainer = styled(Flex)`
  cursor: pointer;
`

const AnnualRoiDisplay = styled(Text)`
  width: 72px;
  max-width: 72px;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
`

interface DepositModalProps {
  max: BigNumber
  stakedBalance: BigNumber
  multiplier?: string
  lpLabel?: string
  onConfirm: (amount: string, token: Token) => void
  onDismiss?: () => void
  tokenName?: string
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
  cakePrice?: BigNumber
  token: Token
}

const DepositModal: React.FC<DepositModalProps> = ({
  max,
  stakedBalance,
  onConfirm,
  onDismiss,
  tokenName = '',
  multiplier,
  displayApr,
  lpLabel,
  apr,
  addLiquidityUrl,
  cakePrice,
  token,
}) => {
  const [val, setVal] = useState('')
  const [pendingTx, setPendingTx] = useState(false)
  const [showRoiCalculator, setShowRoiCalculator] = useState(false)
  const { t } = useTranslation()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const lpTokensToStake = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)

  const usdToStake = lpTokensToStake.times(1)

  const interestBreakdown = getInterestBreakdown({
    principalInUSD: !lpTokensToStake.isNaN() ? usdToStake.toNumber() : 0,
    apr,
    earningTokenPrice: 1,
  })
  const two = new BigNumber(2)
  const annualRoi = two.times(interestBreakdown[3])
  const annualRoiAsNumber = annualRoi.toNumber()
  const formattedAnnualRoi = formatNumber(annualRoiAsNumber, annualRoi.gt(10000) ? 0 : 2, annualRoi.gt(10000) ? 0 : 2)

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )

  const isBalanceZero = fullBalance === '0' || !fullBalance

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  if (showRoiCalculator) {
    return (
      <RoiCalculatorModal
        linkLabel={t('Get ', lpLabel)}
        stakingTokenBalance={stakedBalance.plus(max)}
        stakingTokenSymbol={tokenName}
        stakingTokenPrice={111}
        earningTokenPrice={cakePrice.toNumber()}
        apr={apr}
        multiplier={multiplier}
        displayApr={displayApr}
        linkHref={addLiquidityUrl}
        isFarm
        initialValue={val}
        onBack={() => setShowRoiCalculator(false)}
      />
    )
  }

  return (
    <Modal style={{position: 'absolute', width: 'auto', maxWidth: '360px'}} title={t('Stake LP tokens')} onDismiss={onDismiss}>
      <ModalInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={lpLabel}
        addLiquidityUrl={addLiquidityUrl}
        inputTitle={t('Stake')}
      />
      {isBalanceZero && (
        <StyledErrorMessage fontSize="13px" color="#C16BAD">
          {'No tokens to stake'}
        </StyledErrorMessage>
      )}
      <ButtonOutlined style={{ alignSelf: 'center', width: 'auto', height: '30px', margin: '15px 0',
      background: isBalanceZero ? '#C16BAD' : 'transparent' }}>
        <Link style={{textDecoration: 'none', color: '#fff', fontWeight: '300', fontSize: '13px'}} 
        href={addLiquidityUrl}>{'Get ' + lpLabel}</Link>
      </ButtonOutlined>
      <Flex mb="15px" alignItems="center" justifyContent="space-around">
        <Text mr="8px" color="textSubtle" fontSize='13px' fontWeight={500}>
          {t('Annual ROI at current rates')}:
        </Text>
        {Number.isFinite(annualRoiAsNumber) ? (
          <AnnualRoiContainer
            alignItems="center"
            onClick={() => {
              setShowRoiCalculator(true)
            }}
          >
            <AnnualRoiDisplay>${formattedAnnualRoi}</AnnualRoiDisplay>
          </AnnualRoiContainer>
        ) : (
          <Skeleton width={60} />
        )}
      </Flex>
      <ModalActions>
        <ButtonOutlined height={'60px'} onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </ButtonOutlined>
        <ButtonPrimary
            height={'60px'}
            disabled={
            pendingTx || !lpTokensToStake.isFinite() || lpTokensToStake.eq(0) || lpTokensToStake.gt(fullBalanceNumber)
          }
          onClick={async () => {
            setPendingTx(true)
            await onConfirm(val, token)
            onDismiss?.()
            setPendingTx(false)
          }}
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </ButtonPrimary>
      </ModalActions>
    </Modal>
  )
}

export default DepositModal
