import {Currency, JSBI, NATIVE_TOKEN, TokenAmount} from 'zircon-sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { Plus } from 'react-feather'
import { Text } from 'rebass'
import { ButtonDropdownLight } from '../../components/Button'
import { LightCardNoBorder } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { FindPoolTabs } from '../../components/NavigationTabs'
import {MinimalPositionCard, MinimalPositionPylonCard} from '../../components/PositionCard'
import Row from '../../components/Row'
import CurrencySearchModal from '../../components/SearchModal/CurrencySearchModal'
import { useActiveWeb3React } from '../../hooks'
import { usePairAdder } from '../../state/user/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { StyledInternalLink } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import AppBody from '../AppBody'
import { Dots } from '../Pool/styleds'
import {PylonState, usePylon} from "../../data/PylonReserves";
import LearnIcon from '../../components/LearnIcon'
// import { usePylon } from '../../data/PylonReserves'

enum Fields {
    TOKEN0 = 0,
    TOKEN1 = 1
}

export default function PoolFinder() {
    const { account, chainId } = useActiveWeb3React()

    const [showSearch, setShowSearch] = useState<boolean>(false)
    const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

    const [currency0, setCurrency0] = useState<Currency | null>(NATIVE_TOKEN[chainId])
    const [currency1, setCurrency1] = useState<Currency | null>(null)

    // const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined)
    const [pylonState, pylon] = usePylon(currency0 ?? undefined, currency1 ?? undefined)
    // const [pylonState2, pylon2] = usePylon( currency1 ?? undefined, currency0 ?? undefined)


    const addPair = usePairAdder()
    useEffect(() => {
        if (pylon) {
            addPair(pylon.pair)
        }
    }, [pylon, addPair])

    const validPairNoLiquidity: boolean =
        pylonState === PylonState.NOT_EXISTS ||
        Boolean(
            pylonState === PylonState.EXISTS &&
            pylon &&
            JSBI.equal(pylon.pair.reserve0.raw, JSBI.BigInt(0)) &&
            JSBI.equal(pylon.pair.reserve1.raw, JSBI.BigInt(0))
        )

    const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pylon?.pair?.liquidityToken)
    const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)))

    const position0: TokenAmount | undefined = useTokenBalance(account ?? undefined, pylon?.floatLiquidityToken)
    const hasPosition0 = Boolean(position0 && JSBI.greaterThan(position0.raw, JSBI.BigInt(0)))

    const position1: TokenAmount | undefined = useTokenBalance(account ?? undefined, pylon?.anchorLiquidityToken)
    const hasPosition1 = Boolean(position1 && JSBI.greaterThan(position1.raw, JSBI.BigInt(0)))

    const handleCurrencySelect = useCallback(
        (currency: Currency) => {
            if (activeField === Fields.TOKEN0) {
                setCurrency0(currency)
            } else {
                setCurrency1(currency)
            }
        },
        [activeField]
    )

    const handleSearchDismiss = useCallback(() => {
        setShowSearch(false)
    }, [setShowSearch])


    const prerequisiteMessage = (
        <LightCardNoBorder padding="45px 10px">
            <Text textAlign="center">
                {!account ? 'Connect to a wallet to find pools' : 'Select a token to find your liquidity.'}
            </Text>
        </LightCardNoBorder>
    )

    return (
        <>
        <AppBody>
            <FindPoolTabs />
            <AutoColumn style={{padding: '10px', borderRadius: '17px', marginBottom: '10px'}} gap="md">
                <ButtonDropdownLight
                    onClick={() => {
                        setShowSearch(true)
                        setActiveField(Fields.TOKEN0)
                    }}
                >
                    {currency0 ? (
                        <Row>
                            <CurrencyLogo currency={currency0} chainId={chainId} />
                            <Text fontWeight={400} fontSize={18} marginLeft={'12px'}>
                                {currency0.symbol}
                            </Text>
                        </Row>
                    ) : (
                        <Text fontWeight={400} fontSize={18} marginLeft={'12px'}>
                            Select a Token
                        </Text>
                    )}
                </ButtonDropdownLight>

                <ColumnCenter>
                    <Plus size="32" color="#888D9B" />
                </ColumnCenter>

                <ButtonDropdownLight
                    onClick={() => {
                        setShowSearch(true)
                        setActiveField(Fields.TOKEN1)
                    }}
                >
                    {currency1 ? (
                        <Row>
                            <CurrencyLogo currency={currency1} chainId={chainId} />
                            <Text fontWeight={400} fontSize={18} marginLeft={'12px'}>
                                {currency1.symbol}
                            </Text>
                        </Row>
                    ) : (
                        <Text fontWeight={400} fontSize={18} marginLeft={'12px'}>
                            Select a Token
                        </Text>
                    )}
                </ButtonDropdownLight>

                {(hasPosition || hasPosition0 || hasPosition1) && (
                    <ColumnCenter
                        style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
                    >
                        <Text textAlign="center" fontWeight={400}>
                            Pool Found!
                        </Text>
                    </ColumnCenter>
                )}


            </AutoColumn>
            <AutoColumn gap='10px'>
            {currency0 && currency1 ? (
                pylonState === PylonState.EXISTS ? (
                    (hasPosition || hasPosition0 || hasPosition1) && pylon ? (
                        <>
                            {hasPosition && <MinimalPositionCard pair={pylon.pair} border="1px solid #CED0D9" />}

                            {hasPosition0 && <MinimalPositionPylonCard pylon={pylon} isFloat={true} border="1px solid #CED0D9" />}

                            {hasPosition1 && <MinimalPositionPylonCard pylon={pylon} isFloat={false} border="1px solid #CED0D9" />}

                        </>
                    ) : (
                        <LightCardNoBorder padding="45px 10px">
                            <AutoColumn gap="sm" justify="center">
                                <Text textAlign="center">You don’t have liquidity in this pool yet.</Text>
                                <StyledInternalLink to={`/add-pro/${currencyId(currency0, chainId)}/${currencyId(currency1, chainId)}`}>
                                    <Text textAlign="center">Add liquidity.</Text>
                                </StyledInternalLink>
                            </AutoColumn>
                        </LightCardNoBorder>
                    )
                ) : validPairNoLiquidity ? (
                    <LightCardNoBorder padding="45px 10px">
                        <AutoColumn gap="sm" justify="center">
                            <Text textAlign="center">No pool found.</Text>
                            <StyledInternalLink to={`/add-pro/${currencyId(currency0, chainId)}/${currencyId(currency1, chainId)}`}>
                                Create pool.
                            </StyledInternalLink>
                        </AutoColumn>
                    </LightCardNoBorder>
                ) : pylonState === PylonState.INVALID ? (
                    <LightCardNoBorder padding="45px 10px">
                        <AutoColumn gap="sm" justify="center">
                            <Text textAlign="center" fontWeight={400}>
                                Invalid pair.
                            </Text>
                        </AutoColumn>
                    </LightCardNoBorder>
                ) : pylonState === PylonState.LOADING ? (
                    <LightCardNoBorder padding="45px 10px">
                        <AutoColumn gap="sm" justify="center">
                            <Text textAlign="center">
                                Loading
                                <Dots />
                            </Text>
                        </AutoColumn>
                    </LightCardNoBorder>
                ) : null
            ) : (
                prerequisiteMessage
            )}
            </AutoColumn>

            <CurrencySearchModal
                chainId={chainId}
                isOpen={showSearch}
                onCurrencySelect={handleCurrencySelect}
                onDismiss={handleSearchDismiss}
                showCommonBases
                selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
            />
            
        </AppBody>
        <LearnIcon />
        </>
    )
}
