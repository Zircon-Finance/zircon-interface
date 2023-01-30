import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { useTheme } from 'styled-components'
import { Card, Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import { ButtonLinkGet } from '../../../../components/Button'
import StakeAdd from './StakeAdd'
import { ModalContainer } from '../../Farms'
import DepositModal from '../DepositModal'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import useStakeFarms from '../../hooks/useStakeFarms'
import { useAddPopup } from '../../../../state/application/hooks'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTransactionAdder } from '../../../../state/transactions/hooks'
import { DeserializedPool } from '../../../../state/types'
import { fetchPoolsUserDataAsync } from '../../../../state/pools'
// import { usePairLiquidity } from '../../../../state/pools/hooks'
import { useCurrency } from '../../../../hooks/Tokens'
import {useDerivedPylonMintInfo} from "../../../../state/mint/pylonHooks";
import CapacityIndicatorSmall from '../../../../components/CapacityIndicatorSmall'
import { useActiveWeb3React, useWindowDimensions } from '../../../../hooks'
import { formattedNum } from '../../../../utils/formatBalance'
import { usePools } from '../../../../state/pools/hooks'
import { ethers } from 'ethers'

const StyledCard = styled(Card)`
  align-self: baseline;
  max-width: 100%;
  margin: 0 0 24px 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-width: 350px;
    margin: 0 12px 46px;
  }
`

const FarmCardInnerContainer = styled(Flex)`
  flex-direction: column;
  background: ${({ theme }) => theme.darkMode ? '#452632' : '#F8F7F7'};
  justify-content: space-around;
  padding: 10px;
  height: 600px;
  a {
    text-decoration: none;
  }
`



interface FarmCardProps {
  farm: DeserializedPool
  displayApr: string
  removed: boolean
  account?: string
  currentBlock: any
  isFloat: boolean
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, displayApr, removed, account, currentBlock, isFloat }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const {chainId} = useActiveWeb3React()
  const lpLabel = `${farm.token1.symbol}-${farm.token2.symbol}`
  const addLiquidityUrl = '#/add-pro/' + farm.token1.address+'/' + farm.token2.address + '/' + farm.isAnchor ? "stable":"float"
  const isPromotedFarm = farm.token1.symbol === 'CAKE'
  const isApproved = account && farm.userData.allowance && farm.userData.allowance.isGreaterThan(0)
  const [showModalDeposit, setShowModalDeposit] = useState(false)
  const { onStake } = useStakeFarms(farm.contractAddress, farm.stakingToken.address)
  const addPopup = useAddPopup()
  const dispatch = useDispatch()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const addTransaction = useTransactionAdder()
  const [currency1,currency2] = [useCurrency(farm.token1.address),useCurrency(farm.token2.address)]
  const decimals = {
    float: ethers.BigNumber.from(10).pow(currency1?.decimals || 18).toString(),
    anchor: ethers.BigNumber.from(10).pow(currency2?.decimals || 18).toString(),
  }
  const {
    healthFactor
  } = useDerivedPylonMintInfo(
      currency1 ?? undefined,
      currency2 ?? undefined,
      isFloat,
      "off",
      decimals
  );
  const gammaBig = farm?.gamma
  const gamma = new BigNumber(gammaBig).div(new BigNumber(10).pow(18))
  const {width} = useWindowDimensions()
  const {pools} = usePools()

  const handleStake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount, farm.stakingToken.decimals).then((response) => {
        addTransaction(response, {
          summary: `Stake ${farm.token1.symbol}-${farm.token2.symbol} LP tokens`
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
            summary: 'Staked '+amount+' '+farm.token1.symbol+"-"+farm.token2.symbol+' LP to farm',
          }
        },
        receipt.transactionHash
      )
      dispatch(fetchPoolsUserDataAsync({chainId, account, pools}))
    }
  }
  const pairLiquidity = 0 //usePairLiquidity(farm.token1, farm.token2)

  return (
    <StyledCard isActive={isPromotedFarm}>
      <FarmCardInnerContainer>
        <CardHeading
          earningToken={farm.earningToken}
          earningTokenBlock={farm.earningTokenInfo}
          isClassic={farm.isClassic}
          isAnchor={farm.isAnchor}
          lpLabel={lpLabel}
          token={farm.token1}
          quoteToken={farm.token2}
          gamma={gamma}
          healthFactor={healthFactor}
          vaultAddress={farm.vaultAddress}
          isFinished={farm.isFinished}
          endBlock={farm.endBlock}
          startBlock={farm.startBlock}
          currentBlock={currentBlock === 0 ? null : currentBlock}
          lpAddress={farm.lpAddress}
          contractAddress={farm.contractAddress}
        />
        {farm.userData.stakedBalance.gt(0) || (!isApproved && chainId !== 1285) ? (
          <CardActionsContainer
            farm={farm}
            lpLabel={lpLabel}
            account={account}
            addLiquidityUrl={addLiquidityUrl}
            displayApr={displayApr}
          />
        ) : (
          <>
            {showModalDeposit && (
              <ModalContainer>
                <DepositModal
                  max={farm.userData.stakingTokenBalance}
                  lpLabel={lpLabel}
                  apr={farm?.apr}
                  onDismiss={() => setShowModalDeposit(false)}
                  displayApr={"111"}
                  stakedBalance={farm.userData.stakedBalance}
                  onConfirm={handleStake}
                  tokenName={farm.token2.symbol}
                  addLiquidityUrl={
                    farm.isClassic
                      ? `#/add/${farm.token1.address}/${farm.token2.address}`
                      : `#/add-pro/${farm.token1.address}/${
                          farm.token2.address
                        }/${farm.isAnchor ? "stable" : "float"}`
                  }
                  token={farm.stakingToken}
                  pool={farm}
                />
              </ModalContainer>
            )}

            <StakeAdd
              isFinished = {farm.isFinished}
              clickAction={() => !farm.isFinished && setShowModalDeposit(true)}
              row={false}
              disabled={pendingTx}
            />
          </>
        )}
        <Flex flexDirection={'column'} style={{padding: '0 10px'}}>
        {!removed && (
          <Flex justifyContent="space-between" alignItems="center" mt={width <= 500 && '15px' }>
            <Text color={theme.darkMode ? 'rgba(255,255,255,0.9)' : '#080506'} fontSize="13px">
              {t("APR")}:
            </Text>
            <Text
              color={theme.text1}
              fontSize="13px"
              style={{ display: "flex", alignItems: "center" }}
            >
              {" "}
              {farm?.apr?.toFixed(2)}%
            </Text>
          </Flex>
        )}
        <Flex mt="10px" justifyContent="space-between">
          <Text color={theme.darkMode ? 'rgba(255,255,255,0.9)' : '#080506'} fontSize="13px">
            {t("Liquidity")}:
          </Text>
          <Text color={theme.text1} fontSize="13px">
            {formattedNum(farm.isClassic ? pairLiquidity : new BigNumber(farm?.liquidity?.pair + farm?.liquidity?.pylon).toFixed(2))} USD
          </Text>
        </Flex>
        {!farm.isFinished && (
            <Flex justifyContent="space-between" alignItems="center" mt="10px">
              <Text color={theme.darkMode ? 'rgba(255,255,255,0.9)' : '#080506'} fontSize="13px">
                {!farm.isAnchor ? 'Divergence' : `Health Factor`}:
              </Text>
              <CapacityIndicatorSmall
                gamma={gamma}
                health={healthFactor}
                isFloat={!farm.isAnchor}
                noSpan={false}
                hoverPage={"tableCardBottom"}
                font={'14px'}
              />
            </Flex>
          )}
        </Flex>
        <Link
          to={
            farm.isClassic
              ? `/add/${farm.token1.address}/${farm.token2.address}`
              : `/add-pro/${farm.token1.address}/${farm.token2.address}/${
                  farm.isAnchor ? "stable" : "float"
                }`
          }
        >
          <ButtonLinkGet
            mt="15px"
            style={{
              marginTop: "10px",
              padding: "10px",
              fontSize: "13px",
              border: "none",
              fontWeight: 500,
            }}
          >
            {`Get ${farm.token1.symbol} - ${farm.token2.symbol} LP tokens`}
          </ButtonLinkGet>
        </Link>
      </FarmCardInnerContainer>
    </StyledCard>
  );
}

export default FarmCard
