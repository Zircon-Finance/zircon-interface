// import { ChainId } from 'zircon-sdk'
import React from 'react'
// import { isMobile } from 'react-device-detect'
import { Text } from 'rebass'
import { useLocation } from 'react-router-dom';

import styled from 'styled-components'

import Logo from '../../assets/images/mainlogo.png'
import ZirconSmall from '../ZirconSmall';
import { useActiveWeb3React, useWindowDimensions } from '../../hooks'
//import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { ChainPoolTab, SwapPoolTabs } from '../../components/NavigationTabs'

// import { YellowCard } from '../Card'

import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
import SunLogo from '../SunLogo';
import { useDarkModeManager } from '../../state/user/hooks';
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
    top: 0;
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
    margin-top: 20px;
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
  width: 250px;
  :hover {
    cursor: pointer;
  }
  @media (min-width: 1100px) {
    width: 442px;
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.walletActive)};
  border-radius: 17px;
  white-space: nowrap;
  :focus {
    border: 1px solid blue;
  }
  @media (min-width: 700px) {
    width: 250px;
    height: 60px;
  }
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
  background-color: ${({ theme }) => theme.bg9};
  padding: 3px 5px;
  border-radius: 5px;
  color: ${({ theme }) => theme.whiteHalf};
  margin-left: 5px;
  font-size: 10px;
  @media (min-width: 500px) {
    font-size: 16px;
  }
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-end;
  `};
`

const BalanceText = styled(Text)`
  display: block;
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

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  //const [isDark] = useDarkModeManager()
  const location = useLocation();
  const { width } = useWindowDimensions();

  const { chainId } = useActiveWeb3React();
  const [darkMode, toggleSetDarkMode] = useDarkModeManager();
  // const theme = useTheme();

  return (
    <HeaderFrame>
      {/* {width < 1100 &&
        <div style={{display: 'flex', paddingLeft: '15px', justifyContent: 'space-between', boxShadow: `inset 1px -10px 2px -10px ${theme.bg14}`,
                    alignSelf: 'start'}}>
              <div style={{display: 'grid', gridAutoFlow: 'column', columnGap: '20px', alignItems: 'center'}}>
                  <Text color={chainId === 1287 ? theme.white : theme.text2}
                        fontSize={13}
                        onClick={() => connectNet('moonbase')}
                        style={{borderBottom: `${chainId === 1287 ? ('1px solid'+theme.bg5) : 'none'}`,
                              cursor: 'pointer',
                              height: '50px',
                              display: 'flex',
                              alignItems: 'center'}}>{'NORMAL'}</Text>
                  <Text color={chainId === 1287 ? theme.white : theme.text2}
                        fontSize={13}
                        onClick={() => connectNet('moonriver')}
                        style={{borderBottom: `${chainId === 1287 ? ('1px solid'+theme.bg5) : 'none'}`,
                              cursor: 'pointer',
                              height: '50px',
                              display: 'flex',
                              alignItems: 'center'}}>{'GAMMA'}</Text>
            </div>
          </div>
      } */}
      <RowBetween style={{ alignItems: 'flex-start', flexWrap: width > 700 ? 'nowrap' : 'wrap', justifyContent: 'center'}} padding="1rem 1rem 0 1rem">
        {width > 700 ?
        <>
        <HeaderElement>
          <Title href=".">
            <UniIcon id="z-logo">
              <img style={{ height: 50 }} src={Logo} alt="logo" />
            </UniIcon>
            {chainId === 1287 && <BadgeSmall>{'GAMMA'}</BadgeSmall>}
          </Title>
        </HeaderElement>
        {width > 1100 ? 
        <>
        <SwapPoolTabs active={location.pathname === '/swap' ? 'swap' : location.pathname === '/farm' ? 'farm' : 'pool'} />
          <HeaderElement>
            <button  style={{border: 'none', 
              outline: 'none', 
              backgroundColor: 'transparent', 
              cursor: 'pointer',
            marginRight: '20px'}} 
              onClick={() => darkMode ? toggleSetDarkMode() : toggleSetDarkMode()}>
            <SunLogo  />
            </button>
           <ChainPoolTab active={chainId === 1287 ? 'moonbeam' : 'moonriver'} />
          </HeaderElement> </> :
          <div style={{display: 'grid', gridGap: '15px'}}>
          <HeaderElement>
            <button  style={{border: 'none', 
              outline: 'none', 
              backgroundColor: 'transparent', 
              cursor: 'pointer',
            marginRight: '20px'}} 
              onClick={() => darkMode ? toggleSetDarkMode() : toggleSetDarkMode()}>
            <SunLogo  />
            </button>
           <ChainPoolTab active={chainId === 1287 ? 'moonbeam' : 'moonriver'} />
           </HeaderElement>
           <SwapPoolTabs active={location.pathname === '/swap' ? 'swap' : location.pathname === '/farm' ? 'farm' : 'pool'} />
          </div>}
          <HeaderControls>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={400}>
                  {userEthBalance?.toSignificant(4)} DEV
                </BalanceText>
              ) : null}
              <Web3Status />
            </AccountElement>
          <HeaderElementWrap>
          </HeaderElementWrap>
        </HeaderControls>
        </> :
        <>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '20px', flexFlow: 'column'}}>
          <HeaderElement>
            <Title href=".">
              <UniIcon id="z-logo">
                <ZirconSmall />
              </UniIcon>
              {chainId === 1287 && <BadgeSmall>{'GAMMA'}</BadgeSmall>}
            </Title>
             <>
            <button  style={{border: 'none', 
              outline: 'none', 
              backgroundColor: 'transparent', 
              cursor: 'pointer',
            marginRight: '20px'}} 
              onClick={() => darkMode ? toggleSetDarkMode() : toggleSetDarkMode()}>
            <SunLogo  />
            </button>
          
           <ChainPoolTab active={chainId === 1287 ? 'moonbeam' : 'moonriver'} /> </>
          </HeaderElement>
          <HeaderControls>
            <HeaderElement>
              <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
                {account && userEthBalance ? (
                  <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={400}>
                    {userEthBalance?.toSignificant(4)} DEV
                  </BalanceText>
                ) : null}
                <Web3Status />
              </AccountElement>
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
