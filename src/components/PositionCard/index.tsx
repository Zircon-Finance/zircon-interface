import {
    JSBI, Pair, Percent, Pylon, PylonFactory,
} from 'zircon-sdk'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React, useWindowDimensions } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonPositionsMobile } from '../Button'

import Card, { OutlineCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'
// import {
//   useGamma,
//   useVirtualAnchorBalance,
// } from "../../data/PylonData";
import { Separator } from '../SearchModal/styleds'
import {getLiquidityValues} from "../../state/burn/hooks";
import {useLastK, usePylonInfo} from "../../data/PylonData";

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.cardExpanded};
`

const BadgeSmall = styled.span`
  background-color: ${({ theme }) => theme.anchorFloatBadge};
  padding: 3px 5px;
  border-radius: 5px;
  color: ${({ theme }) => theme.text1};
  margin-left: 0px;
  margin-right: 10px;
  font-size: 10px;
  @media (min-width: 500px) {
    font-size: 16px;
  }
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
    border?: string,
    blockNumber?: number,
    pylonConstants?: PylonFactory,
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
    const theme = useTheme()
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
                                <Text fontWeight={400} fontSize={16} color={theme.whiteHalf}>
                                    {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                                </Text>
                            </RowFixed>
                        </FixedHeightRow>
                        <AutoColumn gap="4px">
                            <FixedHeightRow>
                                <Text color={theme.text1} fontSize={13} fontWeight={400}>
                                    Pooled {currency0.symbol}
                                </Text>
                                {token0Deposited ? (
                                    <RowFixed>
                                        <Text color={theme.text1} fontSize={13} fontWeight={400} marginLeft={'6px'}>
                                            {token0Deposited?.toSignificant(6)}
                                        </Text>
                                    </RowFixed>
                                ) : (
                                    '-'
                                )}
                            </FixedHeightRow>
                            <FixedHeightRow>
                                <Text color={theme.text1} fontSize={13} fontWeight={400}>
                                    Pooled {currency1.symbol}
                                </Text>
                                {token1Deposited ? (
                                    <RowFixed>
                                        <Text color={theme.text1} fontSize={13} fontWeight={400} marginLeft={'6px'}>
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
    const theme = useTheme()
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

    const { width } = useWindowDimensions();
    const formattedPoolBalance = userPoolBalance.toSignificant(4) as unknown as number


    return (
        <HoverCard border={'none'} padding={showMore ? '0px' : '1.25rem'} backgroundColor={showMore ? theme.cardExpanded : 'transparent'}>
            <AutoColumn gap="12px">
                <div style={{ padding: showMore ? '1.25rem 1.25rem 0 1.25rem' : '0px'}}>
                    <FixedHeightRow onClick={() => setShowMore(!showMore)} style={{ cursor: 'pointer' }}>
                        <RowFixed>
                            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={false} size={20} />
                            <Text color={theme.whiteHalf} fontWeight={400} fontSize={16} style={{display: 'flex', alignItems: 'center', marginLeft: 20}}>
                                <BadgeSmall>{'Classic'}</BadgeSmall>
                                {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
                            </Text>
                        </RowFixed>
                        <RowFixed>
                            { !showMore &&
                            <Text fontSize={width > 500 ? 16 : 10} fontWeight={400} color={theme.whiteHalf}>
                                {userPoolBalance ?  formattedPoolBalance < 0.000000001 ? '0.000...' + String(formattedPoolBalance).slice(-4) : formattedPoolBalance : '-'}
                            </Text>
                            }
                            {
                                width > 500 &&
                                (showMore ? (
                                    <ChevronUp size="20" style={{ marginLeft: '10px' }} />
                                ) : (
                                    <ChevronDown size="20" style={{ marginLeft: '10px' }} />
                                ))
                            }
                        </RowFixed>
                    </FixedHeightRow>
                </div>

                {showMore && (
                    <AutoColumn gap="8px">
                        <div style={{padding: '0 1.25rem'}}>
                            <FixedHeightRow>
                                <RowFixed>
                                    <Text fontSize={16} fontWeight={400}>
                                        Your pool tokens:
                                    </Text>
                                </RowFixed>
                                <RowFixed>
                                    <Text fontSize={16} fontWeight={400}>
                                        {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                                    </Text>
                                </RowFixed>
                            </FixedHeightRow>
                            <Separator style={{margin: '10px 0 10px 0'}} />
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
                        </div>
                        <div style={{display: 'flex', flexFlow: 'row', padding: '5px'}}>
                            <ButtonPositionsMobile as={Link} to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                                                   style={{marginRight: '2.5px'}}>
                                <Text fontSize={width > 500 ? 16 : 13} fontWeight={400}>
                                    {'Remove'}
                                </Text>
                            </ButtonPositionsMobile>
                            <ButtonPositionsMobile as={Link} to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`} padding={'6px'}
                                                   style={{marginLeft: '2.5px'}} >
                                {/* {width > 500 && <Plus strokeWidth={1} /> } */}
                                <Text fontSize={width > 500 ? 16 : 13} fontWeight={400}>
                                    {'Add'}
                                </Text>
                            </ButtonPositionsMobile>
                        </div>
                    </AutoColumn>
                )}
            </AutoColumn>
        </HoverCard>
    )
}

export function PylonPositionCard({ isFloat, border, pylon, blockNumber, pylonConstants }: PylonPositionCardProps) {
    const theme = useTheme()
    const { account } = useActiveWeb3React()
    const currency0 = unwrappedToken(pylon.token0)
    const currency1 = unwrappedToken(pylon.token1)

    const [showMore, setShowMore] = useState(false)

    const userPoolBalance = useTokenBalance(account ?? undefined, isFloat ? pylon.floatLiquidityToken : pylon.anchorLiquidityToken)
    const formattedPoolBalance = userPoolBalance.toSignificant(4) as unknown as number

    const pylonInfo = usePylonInfo(pylon?.address)
    const pylonPoolBalance = useTokenBalance(pylon?.address, pylon?.pair.liquidityToken)
    const ptTotalSupply = useTotalSupply(isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken)
    const totalSupply = useTotalSupply(pylon?.pair.liquidityToken)
    const lastK = useLastK(pylon ? Pair.getAddress(pylon.token0, pylon.token1) : "");

    const [token0Deposited, token1Deposited] =
        !!pylon &&
        !!pylonInfo &&
        !!pylonConstants &&
        !!userPoolBalance &&
        !!pylonPoolBalance &&
        !!totalSupply &&
        !!ptTotalSupply &&
        JSBI.greaterThanOrEqual(ptTotalSupply.raw, userPoolBalance.raw) ?
            getLiquidityValues(pylon, userPoolBalance, pylonPoolBalance,
                totalSupply, ptTotalSupply,
                pylonInfo, pylonConstants, blockNumber, lastK, true, isFloat) :
            [undefined, undefined]

    // const [token0Deposited, token1Deposited] = [undefined, undefined]
    //   !!pylon &&
    //   !!userPoolBalance &&
    //   !!pylonPoolBalance &&
    //   !!totalSupply &&
    //   !!ptTotalSupply &&
    //   !!userPoolBalance &&
    // //   // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    // //
    // JSBI.greaterThanOrEqual(ptTotalSupply.raw, userPoolBalance.raw)
    //     ? [
    //      getLiquidityValues(),
    //         isFloat ? new TokenAmount(totalSupply.token, BigInt(0)) :
    //             pylon.burnAnchor(totalSupply, ptTotalSupply, userPoolBalance, BigInt(vab), BigInt(vfb), BigInt(gamma), BigInt(lastK), pylonPoolBalance, BigInt(lpt))
    //       ]
    //     : [undefined, undefined]

    const { width } = useWindowDimensions();

    return (
        <HoverCard border={'none'} padding={showMore ? '0px' : '1.25rem'} backgroundColor={showMore ? theme.cardExpanded : 'transparent'}>
            <AutoColumn gap="12px">
                <div style={{ padding: showMore ? '1.25rem 1.25rem 0 1.25rem' : '0px'}}>
                    <FixedHeightRow onClick={() => setShowMore(!showMore)} style={{ cursor: 'pointer' }}>
                        <RowFixed>
                            <DoubleCurrencyLogo currency0={isFloat ? currency0 : currency1} currency1={null} margin={false} size={30} />
                            {!currency0 || !currency1 ? <Dots>Loading</Dots> :
                                <>
                                    <Text color={theme.whiteHalf} fontWeight={400} fontSize={16} style={{display: 'flex', alignItems: 'center', marginLeft: 5}}>
                                        <BadgeSmall>{isFloat ? currency0.symbol : currency1.symbol} {isFloat ? 'Float' : 'Stable'}</BadgeSmall>
                                        {currency0.symbol}/{currency1.symbol}
                                    </Text>
                                </> }
                            {/*<div style={{display: 'flex', flexDirection: 'row',marginLeft: 20}}>*/}
                            {/*    {isFloat ? (*/}
                            {/*        <>*/}
                            {/*            <RowFixed>*/}
                            {/*                <Text color={theme.whiteHalf} fontWeight={400} fontSize={16} style={{display: 'flex', alignItems: 'center', marginLeft: 30}}>*/}
                            {/*                    <BadgeSmall>{currency0.symbol} {'Float'}</BadgeSmall>*/}
                            {/*                    {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}*/}
                            {/*                </Text>*/}
                            {/*                /!*<BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '0px', marginRight: '5px',  display: 'flex', alignItems: 'center'}}>*!/*/}
                            {/*                /!*    <span style={{color: theme.text1, fontSize: '16px', marginRight: '3px'}}>{currency0.symbol} {'Float'}</span>*!/*/}
                            {/*                /!*</BadgeSmall>*!/*/}
                            {/*                /!*<Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{` - ${currency1.symbol}`}</Text>*!/*/}
                            {/*            </RowFixed>*/}
                            {/*        </>*/}
                            {/*    ) : (*/}
                            {/*        <>*/}
                            {/*            <Flex>*/}
                            {/*                /!*<Text color={theme.text1} style={{minWidth: 'max-content'}} fontWeight={400}>{currency0.symbol} -</Text>*!/*/}
                            {/*                <BadgeSmall style={{fontSize: '13px', height: '23px', alignSelf: 'center', marginLeft: '0px', marginRight: '5px',  display: 'flex', alignItems: 'center'}}>*/}
                            {/*                    <span style={{color: theme.text1, fontSize: '16px', marginRight: '3px'}}>{`${currency1.symbol} Stable`}</span>*/}
                            {/*                </BadgeSmall>*/}
                            {/*            </Flex>*/}
                            {/*        </>*/}
                            {/*    )*/}
                            {/*    }*/}
                            {/*    <span style={{color: theme.whiteHalf, fontSize: '16px', marginRight: '3px', marginTop: '3px'}}>{`${currency0.symbol}-${currency1.symbol}`}</span>*/}
                            {/*</div>*/}
                        </RowFixed>
                        <RowFixed>
                            { !showMore &&
                            <Text fontSize={width > 500 ? 16 : 10} fontWeight={400} color={theme.whiteHalf}>
                                {userPoolBalance ?  formattedPoolBalance < 0.000000001 ? '0.000...' + String(formattedPoolBalance).slice(-4) : formattedPoolBalance : '-'}
                            </Text>
                            }
                            {
                                width > 500 && (
                                    showMore ? (
                                        <ChevronUp size="20" style={{ marginLeft: '10px' }} />
                                    ) : (
                                        <ChevronDown size="20" style={{ marginLeft: '10px' }} />
                                    ))
                            }
                        </RowFixed>
                    </FixedHeightRow>
                </div>

                {showMore && (
                    <AutoColumn gap="8px">
                        <div style={{padding: '0 1.25rem'}}>
                            <FixedHeightRow>
                                <RowFixed>
                                    <Text fontSize={16} fontWeight={400}>
                                        Your pool tokens:
                                    </Text>
                                </RowFixed>
                                <RowFixed>
                                    <Text fontSize={16} fontWeight={400}>
                                        {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                                    </Text>
                                </RowFixed>
                            </FixedHeightRow>
                            <Separator style={{margin: '10px 0 10px 0'}} />
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
                        </div>
                        {/* <FixedHeightRow>*/}
                        {/*  <Text fontSize={13} fontWeight={400}>*/}
                        {/*    Your pool share:*/}
                        {/*  </Text>*/}
                        {/*  <Text fontSize={13} fontWeight={400}>*/}
                        {/*    {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}*/}
                        {/*  </Text>*/}
                        {/*</FixedHeightRow> */}
                        <div style={{display: 'flex', flexFlow: 'row', padding: '5px'}}>
                            <ButtonPositionsMobile as={Link} to={`/remove-pro/${currencyId(currency0)}/${currencyId(currency1)}/${isFloat ? "FLOAT" : "STABLE"}`}
                                                   style={{marginRight: '2.5px'}}>
                                <Text fontSize={width > 500 ? 16 : 13} fontWeight={400}>
                                    {'Remove'}
                                </Text>
                            </ButtonPositionsMobile>
                            <ButtonPositionsMobile as={Link} to={`/add-pro/${currencyId(currency0)}/${currencyId(currency1)}/${ isFloat ? "float" : "stable"}`} padding={'6px'}
                                                   style={{marginLeft: '2.5px'}} >
                                {/* {width > 500 && <Plus strokeWidth={1} /> } */}
                                <Text fontSize={width > 500 ? 16 : 13} fontWeight={400}>
                                    {'Add'}
                                </Text>
                            </ButtonPositionsMobile>
                        </div>
                    </AutoColumn>
                )}
            </AutoColumn>
        </HoverCard>
    )
}
export function MinimalPositionPylonCard({ pylon, showUnwrapped = false, border, isFloat, blockNumber, pylonConstants}: PylonPositionCardProps) {
    const { account } = useActiveWeb3React()

    const currency0 = showUnwrapped ? pylon.token1 : unwrappedToken(pylon.token0)
    const currency1 = showUnwrapped ? pylon.token0 : unwrappedToken(pylon.token1)

    const [showMore, setShowMore] = useState(false)

    const userPoolBalance = useTokenBalance(account ?? undefined, isFloat ? pylon.floatLiquidityToken : pylon.anchorLiquidityToken)
    const pylonInfo = usePylonInfo(pylon?.address)
    const pylonPoolBalance = useTokenBalance(pylon?.address, pylon?.pair.liquidityToken)
    const ptTotalSupply = useTotalSupply(isFloat ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken)
    const totalSupply = useTotalSupply(pylon?.pair.liquidityToken)
    const lastK = useLastK(pylon ? Pair.getAddress(pylon.token0, pylon.token1) : "");

    const [token0Deposited, token1Deposited] =
        !!pylon &&
        !!pylonInfo &&
        !!pylonConstants &&
        !!userPoolBalance &&
        !!pylonPoolBalance &&
        !!totalSupply &&
        !!ptTotalSupply &&
        JSBI.greaterThanOrEqual(ptTotalSupply.raw, userPoolBalance.raw) ?
            getLiquidityValues(pylon, userPoolBalance, pylonPoolBalance,
                totalSupply, ptTotalSupply,
                pylonInfo, pylonConstants, blockNumber, lastK, true, isFloat) :
            [undefined, undefined]

    const { width } = useWindowDimensions();
    const theme = useTheme()

    return (
        <>
            {userPoolBalance && (
                <OutlineCard border={border} style={{ width: "340px", margin: "auto" }}>
                    <AutoColumn gap="12px">
                        <FixedHeightRow>
                            <RowFixed>
                                <Text fontWeight={400} fontSize={13}>
                                    {"YOUR POSITION"}
                                </Text>
                            </RowFixed>
                        </FixedHeightRow>
                        <FixedHeightRow onClick={() => setShowMore(!showMore)}>
                            <RowFixed>
                                <DoubleCurrencyLogo
                                    currency0={currency0}
                                    currency1={currency1}
                                    margin={true}
                                    size={24}
                                />
                                {isFloat ? (
                                    <>
                                        <Flex>
                                            <BadgeSmall
                                                style={{
                                                    fontSize: "16px",
                                                    height: "23px",
                                                    alignSelf: "center",
                                                    marginLeft: "0px",
                                                    marginRight: "5px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                        <span
                            style={{
                                color: theme.text1,
                                fontSize: "16px",
                                marginRight: "3px",
                            }}
                        >
                          {currency0.symbol}{" "}
                        </span>
                                                {"FLOAT"}
                                            </BadgeSmall>
                                            {/*<Text*/}
                                            {/*  color={theme.text1}*/}
                                            {/*  style={{ minWidth: "max-content" }}*/}
                                            {/*  fontWeight={400}*/}
                                            {/*>{` - ${currency1.symbol}`}</Text>*/}
                                        </Flex>
                                    </>
                                ) : (
                                    <>
                                        <Flex>
                                            {/*<Text*/}
                                            {/*  color={theme.text1}*/}
                                            {/*  style={{ minWidth: "max-content" }}*/}
                                            {/*  fontWeight={400}*/}
                                            {/*>*/}
                                            {/*  {currency0.symbol} -*/}
                                            {/*</Text>*/}
                                            <BadgeSmall
                                                style={{
                                                    fontSize: "16px",
                                                    height: "23px",
                                                    alignSelf: "center",
                                                    marginLeft: "0px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                        <span
                            style={{
                                color: theme.text1,
                                fontSize: "16px",
                                marginRight: "3px",
                            }}
                        >{`${currency1.symbol} `}</span>
                                                {"STABLE"}
                                            </BadgeSmall>
                                        </Flex>
                                    </>
                                )}
                            </RowFixed>
                            <RowFixed>
                                <Text fontWeight={400} fontSize={width > 500 ? 16 : 10}>
                                    {userPoolBalance ? userPoolBalance.toSignificant(4) : "-"}
                                </Text>
                            </RowFixed>
                        </FixedHeightRow>
                        <AutoColumn gap="4px">
                            <FixedHeightRow>
                                <Text color={theme.text1} fontSize={13} fontWeight={400}>
                                    Pooled {currency0.symbol}
                                </Text>
                                {token0Deposited ? (
                                    <RowFixed>
                                        <Text
                                            color={theme.text1}
                                            fontSize={13}
                                            fontWeight={400}
                                            marginLeft={"6px"}
                                        >
                                            {token0Deposited?.toSignificant(6)}
                                        </Text>
                                    </RowFixed>
                                ) : (
                                    "-"
                                )}
                            </FixedHeightRow>
                            <FixedHeightRow>
                                <Text color={theme.text1} fontSize={13} fontWeight={400}>
                                    Pooled {currency1.symbol}
                                </Text>
                                {token1Deposited ? (
                                    <RowFixed>
                                        <Text
                                            color={theme.text1}
                                            fontSize={13}
                                            fontWeight={400}
                                            marginLeft={"6px"}
                                        >
                                            {token1Deposited?.toSignificant(6)}
                                        </Text>
                                    </RowFixed>
                                ) : (
                                    "-"
                                )}
                            </FixedHeightRow>
                        </AutoColumn>
                    </AutoColumn>
                </OutlineCard>
            )}
        </>
    );
}
