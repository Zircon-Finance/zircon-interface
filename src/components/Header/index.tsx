// import { ChainId } from 'zircon-sdk'
import React, { useMemo } from 'react'
// import { isMobile } from 'react-device-detect'
import { Text } from 'rebass'
import { useLocation } from 'react-router-dom';

import styled from 'styled-components'
import DarkLogo from '../../assets/images/mainlogo-dark.png'
import WhiteLogo from '../../assets/images/mainlogo-white.png'
import { useActiveWeb3React, useWindowDimensions } from '../../hooks'
//import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import {
  ChainPoolTab,
  SwapPoolTabs } from '../../components/NavigationTabs'

// import { YellowCard } from '../Card'

import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
import SunLogo from '../SunLogo';
import { useDarkModeManager } from '../../state/user/hooks';
import Portal from '@reach/portal';
import ClaimModal from '../ClaimModal';
import { NATIVE_TOKEN } from 'zircon-sdk';
// import { connectNet } from '../WalletModal';
// import VersionSwitch from './VersionSwitch'

const HeaderFrame = styled.div`
  width: 100%;
  position: relative;
  z-index: 2;
  @media (min-width: 700px) {
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    width: 100%;
    position: absolute;
    overflow-x: hidden;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding: 12px 0 0 0;
      width: calc(100%);
      position: relative;
    `};
  }
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 700px) {
    width: 100%;
    margin-top: 10px;
  }
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0.5rem;
`};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  text-decoration: none;
  text-decoration-style: unset;
  width: 290px;
  :hover {
    cursor: pointer;
  }
  @media (min-width: 1100px) {
    width: 475px;
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.poolPinkButton : theme.darkMode ? 'rgba(213, 174, 175, 0.07)' : '#ECEAEA')};
  border-radius: 17px;
  color: ${({ theme }) => theme.text1};
  height: 100%;
  white-space: nowrap;
  :focus {
    border: 1px solid blue;
  }}
  @media (max-width: 700px) {
    width: 100%;
  }
`

// const TestnetWrapper = styled.div`
//   white-space: nowrap;
//   width: fit-content;
//   margin-left: 10px;
//   pointer-events: auto;
// `

// const NetworkCard = styled(YellowCard)`
//   width: fit-content;
//   margin-right: 10px;
//   border-radius: 12px;
//   padding: 8px 12px;
// `

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: scale(105%);
  }
`

export const BadgeSmall = styled.span`
  background-color: ${({ theme }) => theme.darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(8, 5, 6, 0.05)'};
  padding: 3px 5px;
  border-radius: 5px;
  margin-left: 5px;
  font-weight: 500;
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 50px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-end;
  `};
`

const BalanceText = styled(Text)`
  display: block;
  color: ${({ theme }) => theme.text1};
  @media (max-width: 300px) {
    display: none;
  }
`

// const NETWORK_LABELS: { [chainId in ChainId]: string | null } = {
//   [ChainId.MAINNET]: null,
//   [ChainId.STANDALONE]: 'Moonbeam Development',
//   [ChainId.MOONROCK]: 'Moonrock Rococo',
//   [ChainId.MOONBASE]: 'Moonbase Alpha',
//   [ChainId.MOONSHADOW]: 'Moonshadow Westend',
// }

export default function Header() {
  const { account } = useActiveWeb3React()
  const memoizedAccounts = useMemo(() => (account ? [account] : []), [account])

  const userEthBalance = useETHBalances(memoizedAccounts)?.[account ?? '']
  //const [isDark] = useDarkModeManager()
  const location = useLocation();
  const { width } = useWindowDimensions();

  const { chainId } = useActiveWeb3React();
  const [darkMode, toggleSetDarkMode] = useDarkModeManager();
  const [showClaimTokens, setShowClaimTokens] = React.useState(false);
  // const blockedApiData = useBlockedApiData();
  const isPoolBlocked = false
  const isFarmBlocked = true

  return (
    <HeaderFrame>
      <RowBetween style={{ alignItems: 'flex-start', flexWrap: width >= 700 ? 'nowrap' : 'wrap', justifyContent: 'center'}} padding="20px 20px 0 20px">
        {showClaimTokens && (
          <Portal>
              <ClaimModal isOpen = {showClaimTokens} onDismiss={() => setShowClaimTokens(false)} />
          </Portal>
        )}
        {width >= 700 ?
        <>
        <HeaderElement>
        <Title href="." style={{width: account ? width < 1100 ? '150px' : '405px' : width > 1100 ? '420px' : '160px', height: '44px'}}>
          <UniIcon id="z-logo">
              <img style={{ height: 35, display: 'flex', margin: 'auto' }} src={!darkMode ? DarkLogo : WhiteLogo} alt="logo" />
            </UniIcon>
            {chainId === 1287 && <BadgeSmall style={{fontSize: '13px', padding: '5px 10px', background: '#56332e', color: '#FFF'}}>
              {'BETA'}
              </BadgeSmall>}
          </Title>
        </HeaderElement>
        {width > 1100 ?
        <>
        <SwapPoolTabs active={location.pathname === '/swap' ? 'swap' : location.pathname === '/farm' ? (isFarmBlocked ? 'swap' : 'farm') :
        (isPoolBlocked ? 'swap' : 'pool')} />
          <HeaderElement style={{height: '50px'}}>
            <button  style={{border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              marginRight: '10px',
              marginLeft: '10px'}}
              onClick={() => darkMode ? toggleSetDarkMode() : toggleSetDarkMode()}>
            <SunLogo  />
            </button>
            <ChainPoolTab active={chainId === 1285 ? 'moonriver' : chainId === 56 ? 'bsc' : 'arbgoerli'} />
            {/* <ButtonOutlined mr="10px" style={{border: `1px solid ${theme.navigationTabs}`, color: theme.pinkBrown, padding: '12px 20px', maxHeight: '50px'}} onClick={()=>setShowClaimTokens(true)}>{'Claim tokens'}</ButtonOutlined> */}
          </HeaderElement> </> :
          <div style={{display: 'grid', gridGap: '15px'}}>
          <HeaderElement>
            <button  style={{border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            marginRight: '10px',
            marginLeft: '10px'}}
              onClick={() => darkMode ? toggleSetDarkMode() : toggleSetDarkMode()}>
            <SunLogo  />
            </button>
            <ChainPoolTab active={chainId === 1285 ? 'moonriver' : chainId === 56 ? 'bsc' : 'arbgoerli'} />
            {/* <ButtonOutlined mr="10px" style={{border: `1px solid ${theme.navigationTabs}`, color: theme.pinkBrown, padding: '12px 20px', maxHeight: '50px'}} onClick={()=>setShowClaimTokens(true)}>{'Claim tokens'}</ButtonOutlined> */}
           </HeaderElement>
           <SwapPoolTabs active={location.pathname === '/swap' ? 'swap' : location.pathname === '/farm' ? 'farm' : 'pool'} />
          </div>}
          <HeaderControls style={{height: width <= 1100 && '44px'}}>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto', height: '44px' }}>
              {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} pl="1.25rem" pr="0.5rem" fontWeight={400}>
                  {parseFloat(userEthBalance?.toFixed(10)) <= 0.0001 ? '0.0..' : userEthBalance?.toFixed(4)} {NATIVE_TOKEN[chainId].symbol ?? 'ETH'}
                </BalanceText>
              ) : null}
              <Web3Status />
            </AccountElement>
          <HeaderElementWrap>
          </HeaderElementWrap>
        </HeaderControls>
        </> :
        <>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '10px', flexFlow: 'column'}}>
          <HeaderElement>
            <Title href=".">
              <UniIcon id="z-logo">
              <img style={{ height: 25, display: 'flex', margin: 'auto' }} src={!darkMode ? DarkLogo : WhiteLogo} alt="logo" />
              </UniIcon>
              {chainId === 1287 && <BadgeSmall style={{fontSize: '13px', padding: '5px 10px', marginRight: '5px', background: '#56332e', color: '#FFF'}}>
                {'BETA'}
                </BadgeSmall>}
            </Title>
             <>
            <button  style={{border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            marginRight: '10px',
            marginLeft: '10px'}}
              onClick={() => darkMode ? toggleSetDarkMode() : toggleSetDarkMode()}>
            <SunLogo  />
            </button>
            {/* <ButtonOutlined style={{border: `1px solid ${theme.navigationTabs}`, color: theme.pinkBrown, padding: '13.5px 20px', maxHeight: '50px'}} onClick={()=>setShowClaimTokens(true)}>{'Claim tokens'}</ButtonOutlined> */}
           <AccountElement active={!!account} style={{ pointerEvents: 'auto'}}>
                {account && userEthBalance ? (
                  <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={400}>
                    {parseFloat(userEthBalance?.toFixed(10)) <= 0.0001 ? '0.0..' : userEthBalance?.toFixed(4)} {NATIVE_TOKEN[chainId].symbol ?? 'ETH'}
                  </BalanceText>
                ) : null}
                <Web3Status />
              </AccountElement>
           </>
          </HeaderElement>
          <HeaderControls style={{marginBottom: width <= 700 ? '5px' : '0px'}}>
            <HeaderElement>
              <ChainPoolTab active={chainId === 1285 ? 'moonriver' : chainId === 56 ? 'bsc' : 'arbgoerli'} />
            </HeaderElement>
          </HeaderControls>
          </div>
          <SwapPoolTabs active={location.pathname === '/swap' ? 'swap' : location.pathname === '/farm' ? 'farm' : 'pool'} />
        </>

        }
      </RowBetween>
    </HeaderFrame>
  )
}
