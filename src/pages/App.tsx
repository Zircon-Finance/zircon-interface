import React, { Suspense } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import AddLiquidityPro from './AddLiquidityPro'
// import MobileView from './MobileView'
import {
  RedirectDuplicateTokenIdsPro,
  RedirectOldAddLiquidityProPathStructure,
  RedirectToAddLiquidityPro
} from './AddLiquidityPro/redirects'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
} from './AddLiquidity/redirects'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import Swap from './Swap'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import {RedirectOldRemoveLiquidityProPathStructure} from "./RemoveProLiquidity/redirects";
import RemoveProLiquidity from "./RemoveProLiquidity";
import { useWindowDimensions } from '../hooks'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
`

export const MobileWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  background-color: rgba(12,12,12,0.8);
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 5;
  display: flex;
  overflow: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 110px;
  align-items: center;
  flex: 1;

  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding: 16px;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App() {
  const { width } = useWindowDimensions();
  return (
    <Suspense fallback={null}>
      <HashRouter>
        {/* {isMobile && <Redirect to="/mobile" />}
        {isMobile && <MobileWrapper><MobileView 
          icon='laptop'
          upperText='Please use your desktop to try the Zircon Beta'
          lowerText='Our app will be available on your phone soon'  />
        </MobileWrapper>} */}
        <Route component={GoogleAnalyticsReporter} />
        <Route component={DarkModeQueryParamReader} />
        <AppWrapper>
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper style={{paddingTop: width > 700 ? '110px' : '0px'}}>
            <Popups />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path="/swap" component={Swap} />
                <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                <Route exact strict path="/find" component={PoolFinder} />
                <Route exact strict path="/pool" component={Pool} />
                <Route exact strict path="/create" component={RedirectToAddLiquidityPro} />
                <Route exact path="/add" component={AddLiquidity} />
                <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact path="/add-pro" component={AddLiquidityPro} />
                <Route exact path="/add-pro/:currencyIdA" component={RedirectOldAddLiquidityProPathStructure} />
                <Route exact path="/add-pro/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIdsPro} />
                <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                <Route exact strict path="/remove-pro/:tokens" component={RedirectOldRemoveLiquidityProPathStructure} />
                <Route exact strict path="/remove-pro/:currencyIdA/:currencyIdB" component={RedirectOldRemoveLiquidityProPathStructure} />
                <Route exact strict path="/remove-pro/:currencyIdA/:currencyIdB/:float" component={RemoveProLiquidity} />
                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Web3ReactManager>
            <Marginer />
          </BodyWrapper>
        </AppWrapper>
      </HashRouter>
    </Suspense>
  )
}
