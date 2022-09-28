import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Flex, Text, Modal, Skeleton } from '@pancakeswap/uikit'
import { ModalActions, ModalInput } from '../../../components/ModalFarm'
import RoiCalculatorModal from '../../../components/RoiCalculatorModal'
import { useTranslation } from 'react-i18next'

import { getFullDisplayBalance, formatNumber } from '../../../utils/formatBalance'
import { getInterestBreakdown } from '../../../utils/compoundApyHelpers'
import { ButtonLight, ButtonOutlined, ButtonPrimary } from '../../../components/Button'
import { Link } from 'rebass'
import { StyledErrorMessage } from '../../../components/ModalFarm/ModalInput'
import {Token} from 'zircon-sdk'
import { DeserializedPool } from '../../../state/types'

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
    pool: DeserializedPool
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
                                                       pool,
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

    const usdToStake = lpTokensToStake.times(pool?.isAnchor ? pool?.stakedSL : pool?.stakedFL).multipliedBy(pool?.quotingPrice)
    // console.log('Multiplying user input: ', lpTokensToStake?.toFixed(6),' by ZPT price: ',
    // pool?.isAnchor ? pool?.staked.toFixed(6) : pool?.stakedFL.toFixed(6), ' to get USD value: ', usdToStake.toFixed(6))

    const interestBreakdown = getInterestBreakdown({
        principalInUSD: !lpTokensToStake.isNaN() ? usdToStake.toNumber() : 0,
        apr,
        earningTokenPrice: new BigNumber(pool?.movrPrice).toNumber() //? pool?.earningTokenPrice.reduce((a, r) => a+r) : 0,
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
    const theme = useTheme()

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
            <ButtonOutlined
                mt="15px"
                style={{
                    margin: "10px auto",
                    padding: "10px",
                    fontSize: "13px",
                    color: theme.pinkGamma,
                    background: isBalanceZero ? '#C16BAD' : theme.tableButton,
                    border: "none",
                    fontWeight: 500,
                    width: '130px',
                }}
            >
                <Link style={{textDecoration: 'none', color: isBalanceZero ? '#fff' : theme.pinkGamma, fontWeight: 500, fontSize: '13px'}}
                      href={addLiquidityUrl}>{'Get ' + lpLabel}</Link>
            </ButtonOutlined>
            <Flex mb="15px" alignItems="center" justifyContent="space-around">
                <Text mr="8px" color={theme.text1} fontSize='13px' fontWeight={400}>
                    {t('Annual ROI')}:
                </Text>
                {Number.isFinite(annualRoiAsNumber) ? (
                    <AnnualRoiContainer
                        alignItems="center"
                    >
                        <AnnualRoiDisplay color={theme.text1}>${formattedAnnualRoi}</AnnualRoiDisplay>
                    </AnnualRoiContainer>
                ) : (
                    <Skeleton width={60} />
                )}
            </Flex>
            <ModalActions>
                <ButtonLight height={'60px'} onClick={onDismiss} width="100%" disabled={pendingTx}>
                    {t('Cancel')}
                </ButtonLight>
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
