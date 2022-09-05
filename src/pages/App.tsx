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
import Farms from '../views/Farms/Farms'
import Lottie from "lottie-react-web";
import animation from '../assets/lotties/0uCdcx9Hn5.json'

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
  @media (min-width: 1100px) {
    padding-top: 110px;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding: 16px;
  `};
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const LottieContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 100;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`

export default function App() {
  const { width } = useWindowDimensions();
  const [opacityDiv, setOpacityDiv] = React.useState(1)
  const countDown = (opacity) => {
    opacityDiv !== 0 && setTimeout(() => setOpacityDiv(parseFloat((opacity - 0.1).toFixed(1))), 50)
  }
  opacityDiv !== 0 && countDown(opacityDiv)
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
          {opacityDiv !== 0 && <LottieContainer style={{opacity: opacityDiv}}><Lottie
                style={{width: "100px"}}
                options={{
                    animationData: animation
                }}
          /></LottieContainer>}
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper style={{paddingTop: width >= 700 ? width >= 1100 ? '110px' : '170px' : '0px'}}>
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
                <Route exact path="/farm" component={Farms} />
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
