import React, { useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import {Token, Pylon, NATIVE_TOKEN} from 'zircon-sdk'
// import { Link } from 'react-router-dom'
// import { SwapPoolTabs } from '../../components/NavigationTabs'
import { useTranslation } from 'react-i18next'

// import Question from '../../components/QuestionHelper'
import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { Text } from 'rebass'
import { LightCard } from '../../components/Card'
import { AutoRow, RowBetween } from '../../components/Row'
// import { ButtonLighter } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
// import { Plus } from 'react-feather'

import { useActiveWeb3React, useWindowDimensions } from '../../hooks'
import {
  toLiquidityAnchor2Token, toLiquidityAnchorToken,
  toLiquidityFloat2Token, toLiquidityFloatToken,
  toV2LiquidityToken,
  useTrackedTokenPairs
} from '../../state/user/hooks'
import AppBody from '../AppBody'
import { Dots } from '../../components/swap/styleds'
import {usePylons} from "../../data/PylonReserves";
import {PylonPositionCard} from "../../components/PositionCard";
import TriMenu from '../../components/TriMenu'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { Link } from 'react-router-dom'
import HistoryTransactions from '../../components/HistoryTransactions'
// import LearnIcon, { SmallerQuestionmark } from '../../components/LearnIcon'
import {usePylonConstants} from "../../data/PylonData";
import {useBlockNumber} from "../../state/application/hooks";

export default function Pool() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { account, chainId } = useActiveWeb3React()
  const [filter, setFilter] = useState('ALL')

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
      () => {
        return [...trackedTokenPairs.map(tokens => {

          return ({
            liquidityToken: toV2LiquidityToken(tokens), tokens,
          });
        }), ...trackedTokenPairs.map(tokens => {
          return ({
            liquidityToken: toLiquidityFloatToken(tokens), tokens,
          })
        }), ...trackedTokenPairs.map(tokens => {
          return ({
            liquidityToken: toLiquidityAnchor2Token(tokens), tokens: [tokens[1], tokens[0]] as [Token, Token],
          })
        }),...trackedTokenPairs.map(tokens => {
          return ({
            liquidityToken: toLiquidityAnchorToken(tokens), tokens: tokens,
          })
        }),...trackedTokenPairs.map(tokens => {
          return ({
            liquidityToken: toLiquidityFloat2Token(tokens), tokens:  [tokens[1], tokens[0]] as [Token, Token],
          })
        })]},[trackedTokenPairs])

  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
      account ?? undefined,
      liquidityTokens
  )
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
      () =>
          tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
              v2PairsBalances[liquidityToken.address]?.greaterThan('0')
          ),
      [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )
  // const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))

  const pylons = usePylons(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
      fetchingV2PairBalances || pylons?.length < liquidityTokensWithBalances.length || pylons?.some(pylon => !pylon)

  const allV2PairsWithLiquidity = pylons.map(([, pylon], i) => ({
    pylon, liquidityToken: liquidityTokensWithBalances[i].liquidityToken
  })).filter((p): p is { pylon: Pylon | null; liquidityToken: Token; } => Boolean(p.pylon?.pair))

  const filterOptions = ['ALL','FLOAT','STABLE','CLASSIC']

  const { width } = useWindowDimensions();

  const pylonConstants = usePylonConstants()
  const blockNumber = useBlockNumber()

  return (
      <>
        <Text color={theme.text1} fontWeight={300} fontSize={30} style={{alignSelf: 'center', marginBottom: width >= 700 ? '40px' : '20px'}}>
          {t('yourLiquidity')}
        </Text>
        {/* <SwapPoolTabs active={'pool'} /> */}
        <AppBody>
          <AutoColumn gap='1px' justify="center" style={{display: 'flex', flexFlow: 'column'}}>
            <div style={{display: 'flex', padding: '15px 25px 0px 25px', justifyContent: 'space-between', boxShadow: `inset 1px -10px 2px -10px ${theme.anchorFloatBadge}`}}>
              <div style={{display: 'grid', gridAutoFlow: 'column', columnGap: '20px', alignItems: 'center'}}>
                {filterOptions.map(option => (
                  <Text color={filter === option ? theme.white : theme.pinkBrown}
                        fontSize={13}
                        key = {option}
                        onClick={() => setFilter(option)}
                        style={{borderBottom: `${filter === option ? ('1px solid #A19399') : 'none'}`,
                              cursor: 'pointer',
                              height: '50px',
                              display: 'flex',
                              alignItems: 'center'}}>{option}</Text>
                ))}
              </div>
              <div style={{height: '50px', display: 'flex', alignItems: 'center'}}><HistoryTransactions /></div>
              {/* <ButtonLighter id="join-pool-button" as={Link} style={{ padding: '12px', width: 'auto', borderRadius: '12px'  }} to="/add-pro/ETH">
                <Plus size="25" color='gray' style={{marginRight: '8px'}} />
                <Text fontWeight={300} fontSize={18} width={'max-content'}>
                  {t('addLiquidity')}
                </Text>
              </ButtonLighter> */}

            </div>

            <AutoColumn gap="6px" style={{ width: '100%', padding: '10px', maxHeight: '55vh', scrollbarWidth: 'none', overflowY: 'scroll' }}>
              <RowBetween padding={'0 8px'}>
                {/* <Question text="When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below." /> */}
              </RowBetween>

              {!account || !(
                chainId === 1285 || 
                chainId === 56 || 
                chainId === 1287 || 
                chainId === 97 || 
                chainId === 421613 //|| 
                //chainId === 42161
                ) ? (
                  <LightCard padding="40px" style={{border: 'none'}}>
                    <TYPE.body color={theme.text5} textAlign="center">
                      {t('connectToViewLiquidity')}
                    </TYPE.body>
                  </LightCard>
              ) : v2IsLoading ? (
                  <LightCard padding="40px" style={{border: 'none'}}>
                    <TYPE.body color={theme.text5} textAlign="center">
                      <Dots>{t('loading')}</Dots>
                    </TYPE.body>
                  </LightCard>
              ) : allV2PairsWithLiquidity?.length > 0 ? (
                  <>
                    {allV2PairsWithLiquidity.map(v2Pair => (
                       filter === 'ALL' ? (
                          v2Pair.liquidityToken.name === "CLASSIC" ? <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair.pylon!.pair} /> :
                              <PylonPositionCard blockNumber={blockNumber} pylonConstants={pylonConstants} key={v2Pair.liquidityToken.address}  pylon={v2Pair.pylon!} isFloat={v2Pair.liquidityToken.name === "FLOAT"}/>):
                          v2Pair.liquidityToken.name === filter && (
                            v2Pair.liquidityToken.name === "CLASSIC" ? <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair.pylon!.pair} /> :
                              <PylonPositionCard blockNumber={blockNumber} pylonConstants={pylonConstants} key={v2Pair.liquidityToken.address}  pylon={v2Pair.pylon!} isFloat={v2Pair.liquidityToken.name === "FLOAT"}/>)
                          )
                    )}
                  </>
              ) : (
                  <LightCard padding="40px" style={{border: 'none'}}>
                    <TYPE.body color={theme.text5} textAlign="center">
                      {t('noLiquidityFound')}
                    </TYPE.body>
                  </LightCard>
              )}

              {/* <div>
              <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                {"Don't see a pool you joined?"}{' '}
                <StyledInternalLink id="import-pool-link" to={'/find'}>
                  {'Import it.'}
                </StyledInternalLink>
              </Text>
            </div> */}
            </AutoColumn>
            <AutoRow style={{padding: '10px'}}>
              {/* {width <= 700 && (<SmallerQuestionmark />)} */}
              <div style={{width: '15%', height: '100%'}}>
                  <TriMenu />
              </div>
              <div style={{width: '85%',display: 'flex', justifyContent: 'center'}}>
                <ButtonSecondary style={{borderRadius: '17px', marginRight: '5px', padding: '0px', fontWeight: 500, fontSize: width > 992 ? '18px' : '13px', color: theme.pinkBrown}} as={Link} to={'/find'}>{'Import'}</ButtonSecondary>
                <ButtonPrimary id="add-liquidity-button" as={Link} to={`/add-pro/${
                  chainId === 1285 ? '0x4545E94974AdACb82FC56BCf136B07943e152055' :
                  chainId === 56 ? '0x808A3F2639a5CD54D64eD768192369BCd729100e' : 
                  NATIVE_TOKEN[chainId]?.symbol}`} style={{padding: '18px 0 18px 0', fontSize: width > 992 ? '18px' : '13px'}}>{'Add liquidity'}</ButtonPrimary>
              </div>
            </AutoRow>
          </AutoColumn>
          {/* {width >= 700 && <LearnIcon />} */}
        </AppBody>
      </>
  )
}
