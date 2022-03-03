import {JSBI, Pair, Percent, Pylon, TokenAmount} from 'zircon-sdk'
import React, { useState, useContext } from 'react'
import { ChevronDown, ChevronUp, Plus } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonOutlined, ButtonPrimary } from '../Button'

import Card, { OutlineCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'
import {
  useGamma,
  useLastK,
  useLastPoolTokens,
  useVirtualAnchorBalance,
  useVirtualFloatBalance
} from "../../data/PylonData";

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  
`

const BadgeSmall = styled.span`
  background-color: #321f46;
  padding: 3px 5px;
  border-radius: 5px;
  color: ${({ theme }) => theme.text2};
  margin-left: 5px;
`

interface PositionCardProps {
  pair: Pair,
  showUnwrapped?: boolean
  border?: string
}
interface PylonPositionCardProps {
  pylon:  Pylon,
  isFloat?:  boolean,
  showUnwrapped?: boolean
  border?: string
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && (
        <OutlineCard border={border} style={{width: '340px', margin: 'auto'}}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontWeight={400} fontSize={13}>
                  Your position
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                <Text fontWeight={400} fontSize={16}>
                  {currency0.symbol}/{currency1.symbol}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={400} fontSize={16} color={theme.text2}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px">
              <FixedHeightRow>
                <Text color="#FFF" fontSize={13} fontWeight={400}>
                  Pooled {currency0.symbol}
                </Text>
                {token0Deposited ? (
                  <RowFixed>
                    <Text color="#FFF" fontSize={13} fontWeight={400} marginLeft={'6px'}>
                      {token0Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text color="#FFF" fontSize={13} fontWeight={400}>
                Pooled {currency1.symbol}
                </Text>
                {token1Deposited ? (
                  <RowFixed>
                    <Text color="#FFF" fontSize={13} fontWeight={400} marginLeft={'6px'}>
                      {token1Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </OutlineCard>
      )}
    </>
  )
}



export default function FullPositionCard({ pair, border }: PositionCardProps) {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <HoverCard border={'none'} backgroundColor={showMore ? '#3C2955' : '#2B1840'}>
      <AutoColumn gap="12px">
        <FixedHeightRow onClick={() => setShowMore(!showMore)} style={{ cursor: 'pointer' }}>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={28} />
            <Text fontWeight={400} fontSize={16} style={{display: 'flex', alignItems: 'center'}}>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
              <BadgeSmall>{'CLASSIC'}</BadgeSmall>
            </Text>
          </RowFixed>
          <RowFixed>
            <Text fontSize={16} fontWeight={400} color={theme.text2}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
            </Text>
            {showMore ? (
              <ChevronUp size="20" style={{ marginLeft: '10px' }} />
            ) : (
              <ChevronDown size="20" style={{ marginLeft: '10px' }} />
            )}
          </RowFixed>
        </FixedHeightRow>
        {showMore && (
          <AutoColumn gap="8px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={13} fontWeight={400}>
                  Pooled {currency0.symbol}:
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={13} fontWeight={400} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={13} fontWeight={400}>
                  Pooled {currency1.symbol}:
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={13} fontWeight={400} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            <FixedHeightRow>
              <Text fontSize={13} fontWeight={400}>
                Your pool share:
              </Text>
              <Text fontSize={13} fontWeight={400}>
                {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
              </Text>
            </FixedHeightRow>
              <ButtonPrimary as={Link} to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`} style={{backgroundColor: '#5F299F'}}>
                <Text fontSize={16} fontWeight={400}>
                  Remove
                </Text>
              </ButtonPrimary>
              <ButtonOutlined as={Link} to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`} padding={'6px'} >
                <Plus strokeWidth={1} />
                <Text fontSize={13} fontWeight={400}>
                  Add liquidity
                </Text>
              </ButtonOutlined>
          </AutoColumn>
        )}
      </AutoColumn>
    </HoverCard>
  )
}

export function PylonPositionCard({ isFloat, border, pylon }: PylonPositionCardProps) {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const currency0 = unwrappedToken(pylon.token0)
  const currency1 = unwrappedToken(pylon.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, isFloat ? pylon.floatLiquidityToken : pylon.anchorLiquidityToken)
  const pylonPoolBalance = useTokenBalance(pylon.address, pylon.pair.liquidityToken)
  const ptTotalSupply = useTotalSupply(isFloat ? pylon.floatLiquidityToken : pylon.anchorLiquidityToken)
  const totalSupply = useTotalSupply(pylon.pair.liquidityToken)
  const vab = useVirtualAnchorBalance(pylon.address)
  const vfb = useVirtualFloatBalance(pylon.address)
  const lastK = useLastK(pylon.address)
  const gamma = useGamma(pylon.address)
  const lpt = useLastPoolTokens(pylon.address)
  // const poolTokenPercentage =
  //   !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
  //     ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
  //     : undefined
  // pylon.pair.token0, totalPoolTokens, userPoolBalance, false) : new TokenAmount(totalPoolTokens.token, BigInt(0)
  const [token0Deposited, token1Deposited] =
    !!pylon &&
    !!userPoolBalance &&
    !!pylonPoolBalance &&
    !!totalSupply &&
    !!ptTotalSupply &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply

  JSBI.greaterThanOrEqual(ptTotalSupply.raw, userPoolBalance.raw)
      ? [
        isFloat ?
             pylon.burnFloat(totalSupply, ptTotalSupply, userPoolBalance, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt)) :
            new TokenAmount(totalSupply.token, BigInt(0)),
          isFloat ? new TokenAmount(totalSupply.token, BigInt(0)) :
              pylon.burnAnchor(totalSupply, ptTotalSupply, userPoolBalance, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))

        ]
      : [undefined, undefined]

  return (
    <HoverCard border={'none'} backgroundColor={showMore ? '#3C2955' : '#2B1840'}>
      <AutoColumn gap="12px">
        <FixedHeightRow onClick={() => setShowMore(!showMore)} style={{ cursor: 'pointer' }}>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={28} />
            <Text fontWeight={400} fontSize={16} style={{display: 'flex', alignItems: 'center'}}>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : 
              `${currency0.symbol}/${currency1.symbol}`}
              <BadgeSmall>{isFloat? 'FLOAT' : 'ANCHOR'}</BadgeSmall>
            </Text>  
          </RowFixed>
          <RowFixed>
            <Text fontSize={16} fontWeight={400} color={theme.text2}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
            </Text>
            {showMore ? (
              <ChevronUp size="20" style={{ marginLeft: '10px' }} />
            ) : (
              <ChevronDown size="20" style={{ marginLeft: '10px' }} />
            )}
          </RowFixed>
        </FixedHeightRow>
        {showMore && (
          <AutoColumn gap="8px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={13} fontWeight={400}>
                  Pooled {currency0.symbol}:
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={13} fontWeight={400} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={13} fontWeight={400}>
                  Pooled {currency1.symbol}:
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={13} fontWeight={400} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            {/*<FixedHeightRow>*/}
            {/*  <Text fontSize={13} fontWeight={400}>*/}
            {/*    Your pool share:*/}
            {/*  </Text>*/}
            {/*  <Text fontSize={13} fontWeight={400}>*/}
            {/*    {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}*/}
            {/*  </Text>*/}
            {/*</FixedHeightRow>*/}
              <ButtonPrimary as={Link} to={`/remove-pro/${currencyId(currency0)}/${currencyId(currency1)}/${isFloat ? "FLOAT" : "ANCHOR"}`}
              style={{backgroundColor: '#5F299F'}}>
                <Text fontSize={16} fontWeight={400}>
                  Remove
                </Text>
              </ButtonPrimary>
              <ButtonOutlined as={Link} to={`/add-pro/${currencyId(currency0)}/${currencyId(currency1)}`} padding={'6px'} >
                <Plus strokeWidth={1} />
                <Text fontSize={13} fontWeight={400}>
                  Add liquidity
                </Text>
              </ButtonOutlined>
          </AutoColumn>
        )}
      </AutoColumn>
    </HoverCard>
  )
}
export function MinimalPositionPylonCard({ pylon, showUnwrapped = false, border, isFloat}: PylonPositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = showUnwrapped ? pylon.pair.token0 : unwrappedToken(pylon.pair.token0)
  const currency1 = showUnwrapped ? pylon.pair.token1 : unwrappedToken(pylon.pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, isFloat ? pylon.floatLiquidityToken : pylon.anchorLiquidityToken)
  const pylonPoolBalance = useTokenBalance(pylon.address, pylon.pair.liquidityToken)
  const ptTotalSupply = useTotalSupply(isFloat ? pylon.floatLiquidityToken : pylon.anchorLiquidityToken)
  const totalSupply = useTotalSupply(pylon.pair.liquidityToken)
  const vab = useVirtualAnchorBalance(pylon.address)
  const vfb = useVirtualFloatBalance(pylon.address)
  const lastK = useLastK(pylon.address)
  const gamma = useGamma(pylon.address)
  const lpt = useLastPoolTokens(pylon.address)
  // const poolTokenPercentage =
  //   !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
  //     ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
  //     : undefined
  // pylon.pair.token0, totalPoolTokens, userPoolBalance, false) : new TokenAmount(totalPoolTokens.token, BigInt(0)
  const [token0Deposited, token1Deposited] =
      !!pylon &&
      !!userPoolBalance &&
      !!pylonPoolBalance &&
      !!totalSupply &&
      !!ptTotalSupply &&
      !!userPoolBalance &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply

      JSBI.greaterThanOrEqual(ptTotalSupply.raw, userPoolBalance.raw)
          ? [
            isFloat ?
                pylon.burnFloat(totalSupply, ptTotalSupply, userPoolBalance, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt)) :
                new TokenAmount(totalSupply.token, BigInt(0)),
            isFloat ? new TokenAmount(totalSupply.token, BigInt(0)) :
                pylon.burnAnchor(totalSupply, ptTotalSupply, userPoolBalance, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))

          ]
          : [undefined, undefined]

  return (
      <>
        {userPoolBalance && (
            <OutlineCard border={border} style={{width: '340px', margin: 'auto' }}>
              <AutoColumn gap="12px">
                <FixedHeightRow>
                  <RowFixed>
                    <Text fontWeight={400} fontSize={13}>
                      {"Your " + (isFloat ? "Float" : "Anchor") + " position"}
                    </Text>
                  </RowFixed>
                </FixedHeightRow>
                <FixedHeightRow onClick={() => setShowMore(!showMore)}>
                  <RowFixed>
                    <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                    <Text fontWeight={400} fontSize={16}>
                      {currency0.symbol}/{currency1.symbol}
                    </Text>
                  </RowFixed>
                  <RowFixed>
                    <Text fontWeight={400} fontSize={16}>
                      {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                    </Text>
                  </RowFixed>
                </FixedHeightRow>
                <AutoColumn gap="4px">
                  <FixedHeightRow>
                    <Text color="#FFF" fontSize={13} fontWeight={400}>
                      Pooled {currency0.symbol}
                    </Text>
                    {token0Deposited ? (
                        <RowFixed>
                          <Text color="#FFF" fontSize={13} fontWeight={400} marginLeft={'6px'}>
                            {token0Deposited?.toSignificant(6)}
                          </Text>
                        </RowFixed>
                    ) : (
                        '-'
                    )}
                  </FixedHeightRow>
                  <FixedHeightRow>
                    <Text color="#FFF" fontSize={13} fontWeight={400}>
                      Pooled {currency1.symbol}
                    </Text>
                    {token1Deposited ? (
                        <RowFixed>
                          <Text color="#FFF" fontSize={13} fontWeight={400} marginLeft={'6px'}>
                            {token1Deposited?.toSignificant(6)}
                          </Text>
                        </RowFixed>
                    ) : (
                        '-'
                    )}
                  </FixedHeightRow>
                </AutoColumn>
              </AutoColumn>
            </OutlineCard>
        )}
      </>
  )
}
