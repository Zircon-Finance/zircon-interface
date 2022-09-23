import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Flex, useModal } from '@pancakeswap/uikit'
import RoiCalculatorModal from '../../../../components/RoiCalculatorModal'
import { useTranslation } from 'react-i18next'
import { usePool } from '../../../../state/pools/hooks'

const ApyLabelContainer = styled(Flex)<{ white: boolean }>`
  font-size: 13px;
  color: ${({ theme, white }) => white ? theme.text1 : theme.whiteHalf};
  margin-left: 3px;
  @media (min-width: 992px) {
    font-size: 16px;
    margin-left: 0;
    color: ${({ theme }) => theme.text1};
  }
`

export interface ApyButtonProps {
  variant: 'text' | 'text-and-button'
  pid: number
  lpSymbol: string
  lpLabel?: string
  multiplier?: string
  cakePrice?: BigNumber
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
  white?: boolean
}

const ApyButton: React.FC<ApyButtonProps> = ({
  variant,
  pid,
  lpLabel,
  lpSymbol,
  cakePrice,
  apr,
  multiplier,
  displayApr,
  addLiquidityUrl,
  white,
}) => {
  const { t } = useTranslation()
  const { pool } = usePool(pid)
  const tokenBalance = pool.userData.stakingTokenBalance
  const stakedBalance = pool.userData.stakedBalance
  const [onPresentApyModal] = useModal(
    <RoiCalculatorModal
      linkLabel={t('Get %symbol%', { symbol: lpLabel })}
      stakingTokenBalance={stakedBalance.plus(tokenBalance)}
      stakingTokenSymbol={lpSymbol}
      stakingTokenPrice={1}
      earningTokenPrice={1}
      apr={apr}
      multiplier={multiplier}
      displayApr={displayApr}
      linkHref={addLiquidityUrl}
      isFarm
    />,
  )

  const handleClickButton = (event): void => {
    event.stopPropagation()
    onPresentApyModal()
  }

  return (
    <ApyLabelContainer alignItems="center" onClick={handleClickButton} white={white}>
      {displayApr}%
    </ApyLabelContainer>
  )
}

export default ApyButton
