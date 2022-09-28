import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { useTheme } from 'styled-components'
import { Card, Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import { ButtonOutlined } from '../../../../components/Button'
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
import { useGamma } from '../../../../data/PylonData'
import {useDerivedPylonMintInfo} from "../../../../state/mint/pylonHooks";
import { StyledLinkExternal } from '../FarmTable/Actions/ActionPanel'
import CapacityIndicatorSmall from '../../../../components/CapacityIndicatorSmall'
import { useWindowDimensions } from '../../../../hooks'
import { CONTRACT_ADDRESS_BASE } from '../../../../constants/lists'

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
  background: ${({ theme }) => theme.liquidityBg};
  justify-content: space-around;
  padding: 10px;
  height: 550px;
  a {
    text-decoration: none;
  }
`



interface FarmCardProps {
  farm: DeserializedPool
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: string
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, displayApr, removed, cakePrice, account }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  // const totalValueFormatted =
  //   farm.liquidity && farm.liquidity.gt(0)
  //     ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  //     : ''

  const lpLabel = `${farm.token1.symbol}-${farm.token2.symbol}`
  const addLiquidityUrl = '#/add-pro/' + farm.token1.address+'/' + farm.token2.address + '/' + farm.isAnchor ? "stable":"float"
  const isPromotedFarm = farm.token1.symbol === 'CAKE'
  const isApproved = account && farm.userData.allowance && farm.userData.allowance.isGreaterThan(0)
  const [showModalDeposit, setShowModalDeposit] = useState(false)
  const { onStake } = useStakeFarms(farm.sousId)
  const addPopup = useAddPopup()
  const dispatch = useDispatch()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const addTransaction = useTransactionAdder()
  const [currency1,currency2] = [useCurrency(farm.token1.address),useCurrency(farm.token2.address)]
  const {
    pylonPair,
    healthFactor
  } = useDerivedPylonMintInfo(
      currency1 ?? undefined,
      currency2 ?? undefined,
      false,
      "off"
  );
  const gammaBig = useGamma(pylonPair?.address)
  const gamma = new BigNumber(gammaBig).div(new BigNumber(10).pow(18))
  const {width} = useWindowDimensions()

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
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }
  const pairLiquidity = 0 //usePairLiquidity(farm.token1, farm.token2)

  return (
    <StyledCard isActive={isPromotedFarm}>
      <FarmCardInnerContainer>
        <CardHeading
          earningToken={farm.earningToken}
          isClassic={farm.isClassic}
          isAnchor={farm.isAnchor}
          lpLabel={lpLabel}
          token={farm.token1}
          quoteToken={farm.token2}
          gamma={gamma}
          healthFactor={healthFactor}
          sousId={farm.sousId}
          vaultAddress={farm.vaultAddress}
        />
        {farm.userData.stakedBalance.gt(0) || !isApproved ? (
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
                  cakePrice={(112 as unknown) as BigNumber}
                  token={farm.stakingToken}
                  pool={farm}
                />
              </ModalContainer>
            )}

            <StakeAdd
              clickAction={() => setShowModalDeposit(true)}
              row={false}
              disabled={pendingTx}
            />
          </>
        )}

        {!removed && (
          <Flex justifyContent="space-between" alignItems="center" mt={width <= 500 && '15px' }>
            <Text color={theme.whiteHalf} fontSize="14px">
              {t("APR")}:
            </Text>
            <Text
              color={theme.text1}
              fontSize="14px"
              style={{ display: "flex", alignItems: "center" }}
            >
              {" "}
              {farm?.apr?.toFixed(2)}%
            </Text>
          </Flex>
        )}
        <Flex mt="10px" justifyContent="space-between">
          <Text color={theme.whiteHalf} fontSize="14px">
            {t("Liquidity")}:
          </Text>
          <Text color={theme.text1} fontSize="14px">
            {farm.isClassic ? pairLiquidity : new BigNumber(farm?.liquidity).toFixed(2)} USD
          </Text>
        </Flex>
        {account && (
            <Flex justifyContent="space-between" alignItems="center" mt="10px">
              <Text color={theme.whiteHalf} fontSize="14px">
                {`Health Factor`}:
              </Text>
              <CapacityIndicatorSmall
                gamma={gamma}
                health={healthFactor}
                isFloat={!farm.isAnchor}
                noSpan={false}
                hoverPage={"tableCard"}
                font={'14px'}
              />
            </Flex>
          )}
        <Link
          to={
            farm.isClassic
              ? `/add/${farm.token1.address}/${farm.token2.address}`
              : `/add-pro/${farm.token1.address}/${farm.token2.address}/${
                  farm.isAnchor ? "stable" : "float"
                }`
          }
        >
          <ButtonOutlined
            mt="15px"
            style={{
              margin: "10px 0",
              padding: "10px",
              fontSize: "13px",
              color: theme.pinkGamma,
              background: theme.tableButton,
              border: "none",
              fontWeight: 500,
            }}
          >
            {`Get ${farm.token1.name} - ${farm.token2.name} LP tokens`}
          </ButtonOutlined>
        </Link>
        <Flex justifyContent={'space-around'} mb={width <= 500 && '10px'}>
          <StyledLinkExternal
            style={{ color: theme.pinkBrown, fontWeight: 500, marginRight: '10px' }}
            href={"Placeholder"}
          >
            {"See Pair Info ↗"}
          </StyledLinkExternal>
          <StyledLinkExternal
            style={{
              color: theme.pinkBrown,
              fontWeight: 500,
            }}
            href={CONTRACT_ADDRESS_BASE+farm.contractAddress}
          >
            {"View Contract ↗"}
          </StyledLinkExternal>
        </Flex>
      </FarmCardInnerContainer>
    </StyledCard>
  );
}

export default FarmCard
