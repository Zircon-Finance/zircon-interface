import React, { useContext, useMemo, useState } from 'react'
import { ThemeContext } from 'styled-components'
import {Token, Pylon} from 'zircon-sdk'
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
import { ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { Link } from 'react-router-dom'
import HistoryTransactions from '../../components/HistoryTransactions'
import LearnIcon, { SmallerQuestionmark } from '../../components/LearnIcon'

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
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

  const filterOptions = ['ALL','FLOAT','ANCHOR','CLASSIC']

  const { width } = useWindowDimensions();

  return (
      <>
        <Text color={theme.text1} fontWeight={300} fontSize={30} style={{alignSelf: 'center', marginBottom: width > 700 ? '40px' : '20px'}}>
          {t('yourLiquidity')}
        </Text>
        {/* <SwapPoolTabs active={'pool'} /> */}
        <AppBody>
          <AutoColumn gap='1px' justify="center" style={{display: 'flex', flexFlow: 'column'}}>
            <div style={{display: 'flex', padding: '15px 15px 0px 15px', justifyContent: 'space-between', boxShadow: `inset 1px -10px 2px -10px ${theme.bg14}`}}>
              <div style={{display: 'grid', gridAutoFlow: 'column', columnGap: '20px', alignItems: 'center'}}>
                {filterOptions.map(option => (
                  <Text color={filter === option ? theme.white : theme.text2} 
                        fontSize={13}
                        key = {option} 
                        onClick={() => setFilter(option)}
                        style={{borderBottom: `${filter === option ? ('1px solid'+theme.bg5) : 'none'}`, 
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
                {/* <Question text="When you add liquidity, you are given pool tokens that represent your share. If you don???t see a pool you joined in this list, try importing a pool below." /> */}
              </RowBetween>

              {!account ? (
                  <LightCard padding="40px">
                    <TYPE.body color={theme.text3} textAlign="center">
                      {t('connectToViewLiquidity')}
                    </TYPE.body>
                  </LightCard>
              ) : v2IsLoading ? (
                  <LightCard padding="40px">
                    <TYPE.body color={theme.text3} textAlign="center">
                      <Dots>{t('loading')}</Dots>
                    </TYPE.body>
                  </LightCard>
              ) : allV2PairsWithLiquidity?.length > 0 ? (
                  <>
                    {allV2PairsWithLiquidity.map(v2Pair => (
                       filter === 'ALL' ? (
                          v2Pair.liquidityToken.name === "CLASSIC" ? <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair.pylon!.pair} /> :
                              <PylonPositionCard key={v2Pair.liquidityToken.address}  pylon={v2Pair.pylon!} isFloat={v2Pair.liquidityToken.name === "FLOAT"}/>):
                          v2Pair.liquidityToken.name === filter && (
                            v2Pair.liquidityToken.name === "CLASSIC" ? <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair.pylon!.pair} /> :
                              <PylonPositionCard key={v2Pair.liquidityToken.address}  pylon={v2Pair.pylon!} isFloat={v2Pair.liquidityToken.name === "FLOAT"}/>)
                          )
                    )}
                  </>
              ) : (
                  <LightCard padding="40px">
                    <TYPE.body color={theme.text3} textAlign="center">
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
              {width < 700 && (<SmallerQuestionmark />)}
              <div style={{width: '15%', height: '100%'}}>
                <TriMenu />
              </div>
              <div style={{width: '85%',display: 'flex', justifyContent: 'center'}}>
                <ButtonOutlined style={{marginRight: '5px', padding: '0px'}} as={Link} to={'/find'}>{'Import'}</ButtonOutlined>
                <ButtonPrimary id="add-liquidity-button" as={Link} to={'/add-pro/ETH'} style={{padding: '18px 0 18px 0'}}>{'Add liquidity'}</ButtonPrimary>
              </div>
            </AutoRow>
          </AutoColumn>
          {width > 700 && <LearnIcon />}
        </AppBody>
      </>
  )
}
