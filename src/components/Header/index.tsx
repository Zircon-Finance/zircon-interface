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
import { SwapPoolTabs } from '../../components/NavigationTabs'

// import { YellowCard } from '../Card'

import { RowBetween } from '../Row'
import Web3Status from '../Web3Status'
// import VersionSwitch from './VersionSwitch'

const HeaderFrame = styled.div`
  width: 100%;
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
    z-index: 2;
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
  :hover {
    cursor: pointer;
  }
  @media (min-width: 700px) {
    width: 250px;
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : '#25123C')};
  border-radius: 17px;
  white-space: nowrap;
  :focus {
    border: 1px solid blue;
  }
  @media (min-width: 700px) {
    width: 250px;
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

  return (
    <HeaderFrame>
      <RowBetween style={{ alignItems: 'flex-start', flexWrap: width > 700 ? 'nowrap' : 'wrap' }} padding="1rem 1rem 0 1rem">
        {width > 700 ?
        <>
        <HeaderElement>
          <Title href=".">
            <UniIcon id="z-logo">
              <img style={{ height: 50 }} src={Logo} alt="logo" />
            </UniIcon>
          </Title>
        </HeaderElement>
        <SwapPoolTabs active={location.pathname === '/swap' ? 'swap' : 'pool'} />
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
          <HeaderElementWrap>
          </HeaderElementWrap>
        </HeaderControls>
        </> :
        <>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '20px'}}>
          <HeaderElement>
            <Title href=".">
              <UniIcon id="z-logo">
                <ZirconSmall />
              </UniIcon>
            </Title>
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
          <SwapPoolTabs active={location.pathname === '/swap' ? 'swap' : 'pool'} />
        </>

        }
      </RowBetween>
    </HeaderFrame>
  )
}
