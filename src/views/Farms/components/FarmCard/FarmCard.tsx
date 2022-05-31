import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { useTheme } from 'styled-components'
import { Card, Flex, Text, Skeleton } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import CardHeading from './CardHeading'
import { FarmWithStakedValue } from '../types'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'
import { ButtonOutlined } from '../../../../components/Button'
import { SpaceBetween, StyledLinkExternal } from '../FarmTable/Actions/ActionPanel'
import StakeAdd from './StakeAdd'
import { ModalContainer } from '../../Farms'
import DepositModal from '../DepositModal'
import { useLpTokenPrice } from '../../../../state/farms/hooks'
import useCatchTxError from '../../../../hooks/useCatchTxError'
import useStakeFarms from '../../hooks/useStakeFarms'
import { useAddPopup } from '../../../../state/application/hooks'
import { fetchFarmUserDataAsync } from '../../../../state/farms'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTransactionAdder } from '../../../../state/transactions/hooks'

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
  justify-content: space-around;
  padding: 10px;
  height: 500px;
  a {
    text-decoration: none;
  }
`



interface FarmCardProps {
  farm: FarmWithStakedValue
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

  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const addLiquidityUrl = '#/add-pro/' + farm.token.address+'/' + farm.quoteToken.address
  const isPromotedFarm = farm.token.symbol === 'CAKE'
  const isApproved = account && farm.userData.allowance && farm.userData.allowance.isGreaterThan(0)
  const [showModalDeposit, setShowModalDeposit] = useState(false)
  const lpPrice = useLpTokenPrice(farm.lpSymbol)
  const { onStake } = useStakeFarms(farm.pid)
  const addPopup = useAddPopup()
  const dispatch = useDispatch()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const addTransaction = useTransactionAdder()


  const handleStake = async (amount: string) => {
    const receipt = await fetchWithCatchTxError(() => {
      return onStake(amount).then((response) => {
        addTransaction(response, {
          summary: `Stake ${farm.token.symbol}-${farm.quoteToken.symbol} tokens`
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
            summary: 'Staked '+amount+' '+farm.token.symbol+"-"+farm.quoteToken.symbol+' LP to farm',
          }
        },
        receipt.transactionHash
      )  
      dispatch(fetchFarmUserDataAsync({ account, pids: [farm.pid] }))
    }
  }


  return (
    <StyledCard isActive={isPromotedFarm}>
      <FarmCardInnerContainer>
        <CardHeading
          lpLabel={lpLabel}
          multiplier={farm.multiplier}
          isCommunityFarm={farm.isCommunity}
          token={farm.token}
          quoteToken={farm.quoteToken}
        />
        {
          farm.userData.stakedBalance.gt(0) || !isApproved ? (
            <CardActionsContainer
              farm={farm}
              lpLabel={lpLabel}
              account={account}
              addLiquidityUrl={addLiquidityUrl}
              displayApr={displayApr}
            /> ) : (
              <>
              {showModalDeposit && 
                <ModalContainer>   
                  <DepositModal
                    max={farm.userData.tokenBalance}
                    lpPrice={lpPrice}
                    lpLabel={lpLabel}
                    apr={farm.apr}
                    onDismiss={() => setShowModalDeposit(false)}
                    displayApr={'111'}
                    stakedBalance={farm.userData.stakedBalance}
                    onConfirm={handleStake}
                    tokenName={farm.lpSymbol}
                    multiplier={farm.multiplier}
                    addLiquidityUrl={'#/add-pro/'+farm.token.address+'/'+farm.quoteToken.address}
                    cakePrice={112 as unknown as BigNumber}/>
                </ModalContainer>
              }
                
                <StakeAdd clickAction={()=>setShowModalDeposit(true)} row={false} disabled = {pendingTx} />
              </>
            )
        }
        
        {!removed && (
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize='13px'>{t('APR')}:</Text>
            <Text fontSize='13px' style={{ display: 'flex', alignItems: 'center' }}>
              {farm.apr ? (
                <ApyButton
                  variant="text-and-button"
                  pid={farm.pid}
                  lpSymbol={farm.lpSymbol}
                  multiplier={farm.multiplier}
                  lpLabel={lpLabel}
                  addLiquidityUrl={addLiquidityUrl}
                  cakePrice={cakePrice}
                  apr={farm.apr}
                  displayApr={displayApr}
                />
              ) : (
                <Skeleton height={24} width={80} />
              )}
            </Text>
          </Flex>
        )}
        <Flex mt='10px' justifyContent="space-between">
          <Text fontSize='13px'>{t('Liquidity')}:</Text>
          <Text fontSize='13px'>{'farm.liquidity.toNumber()'}</Text>
        </Flex>
        <Link to={`add-pro/${farm.token.address}/${farm.quoteToken.address}`}>
          <ButtonOutlined mt='20px' style={{padding: '10px', fontSize: '13px'}}>
            {`Get ${farm.token.name} - ${farm.quoteToken.name} Anchor LP`}
          </ButtonOutlined>
        </Link>
        <SpaceBetween style={{marginTop:'20px'}}>
            <StyledLinkExternal color={theme.whiteHalf} href={'Placeholder'}>{t('View Contract ↗')}</StyledLinkExternal>
            <StyledLinkExternal color={theme.whiteHalf} href={'Placeholder'}>{t('See Pair Info ↗')}</StyledLinkExternal>
          </SpaceBetween>
      </FarmCardInnerContainer>
    </StyledCard>
  )
}

export default FarmCard