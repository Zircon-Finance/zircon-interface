import React, { useState, useEffect } from 'react'
import ReactGA from 'react-ga4'
import styled, { useTheme } from 'styled-components'
import { isMobile } from 'react-device-detect'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import usePrevious from '../../hooks/usePrevious'
import { useWalletModalOpen, useWalletModalToggle } from '../../state/application/hooks'

import Modal from '../Modal'
import AccountDetails from '../AccountDetails'
import PendingView from './PendingView'
import Option from './Option'
import { SUPPORTED_WALLETS } from '../../constants'
import MetamaskIcon from '../../assets/images/metamask.svg'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { injected, fortmatic, portis } from '../../connectors'
import { OVERLAY_READY } from '../../connectors/Fortmatic'
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ButtonPrimary, ButtonSecondary } from '../Button'
import { Flex, Link, Text } from 'rebass'
import { useActiveWeb3React } from '../../hooks'

const CloseIcon = styled.div`
  position: absolute;
  right: 2rem;
  top: 2rem;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 2rem;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg14};
  padding: 1rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const ButtonPink = styled(ButtonSecondary)`
  color: ${({ theme }) => theme.pinkGamma};
  background-color: ${({ theme }) => theme.maxButton};
  &:hover {
    background-color: ${({ theme }) => theme.maxButtonHover};
  }
  border-radius: 17px;
`

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 400;
  }
`

const Blurb = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 15px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`

const OptionGrid = styled.div`
  display: grid;
  gap: 5px;
`

const HoverText = styled.div`
color: ${({ theme }) => theme.text1};
  :hover {
    cursor: pointer;
  }
`


const provider = window.ethereum
const moonbeamChainId = '0x504';
const moonriverChainId = '0x505';
const moonbaseAlphaChainId = '0x507';
const bscChainId = '0x38';

const supportedNetworks = {
  moonbeam: {
    chainId: moonbeamChainId,
    chainName: 'Moonbeam',
    rpcUrls: ['https://rpc.api.moonbeam.network'],
    blockExplorerUrls: ['https://moonbeam.moonscan.io/'],
    nativeCurrency: {
      name: 'Glimmer',
      symbol: 'GLMR',
      decimals: 18,
    },
  },
  moonriver: {
    chainId: moonriverChainId,
    chainName: 'Moonriver',
    rpcUrls: ['https://rpc.api.moonriver.moonbeam.network'],
    blockExplorerUrls: ['https://moonriver.moonscan.io/'],
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
  },
  moonbase: {
    chainId: moonbaseAlphaChainId,
    chainName: 'Moonbase Alpha',
    rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
    blockExplorerUrls: ['https://moonbase.moonscan.io/'],
    nativeCurrency: {
      name: 'DEV',
      symbol: 'DEV',
      decimals: 18,
    },
  },
  bsc: {
    chainId: bscChainId,
    chainName: 'Binance Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
};

export const connectNet = async (network) => {
  if (provider) {
    try {
      const targetNetwork = supportedNetworks[network];
      await (provider as any).request({ method: 'eth_requestAccounts' });
      await (provider as any).request({
        method: 'wallet_addEthereumChain',
        params: [targetNetwork],
      });
    } catch (e) {
      console.error('Error: ',e)
    }
  } else {
    window.alert('Please install Metamask first!')
  }
};

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending'
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  const { active, account, connector, activate, error } = useWeb3React()
  const {chainId} = useActiveWeb3React()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<boolean>()

  const walletModalOpen = useWalletModalOpen()
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: `Set ${name} wallet`,
      label: name
    })
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    // if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
    //   connector.walletConnectProvider = undefined
    // }

    connector &&
      activate(connector, undefined, true).catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector) // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true)
        }
      })
  }

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal()
    })
  }, [toggleWalletModal])
  const theme = useTheme()
  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key]
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null
        }

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require('../../assets/images/' + option.iconName)}
            />
          )
        }
        if (option.name === 'MetaMask') {
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              color={'#E8831D'}
              header={'Metamask'}
              subheader={null}
              onClick={() => {
                window.ethereum ? tryActivation(option.connector) :
                  window.open('https://metamask.io/', '_blank');
              }}
              link={'https://metamask.io/'}
              icon={MetamaskIcon}
            />
          )
        }
        else return null
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                onClick={() => {
                    window.open('https://metamask.io/', '_blank');
                }}
                link={'https://metamask.io/'}
                icon={MetamaskIcon}
              />
            )
          } else {
            return null //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={require('../../assets/images/' + option.iconName)}
          />
        )
      )
    })
  }

  function getModalContent() {
    if (error || !(chainId === 1285 || chainId === 56 || chainId === 1287 || chainId === 97 || chainId === 421613)) {
      return (
        <UpperSection>

          <HeaderRow style={{display: 'flex', justifyContent: 'space-between'}}>
            <Text style={{alignSelf: 'center'}}>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}</Text>
            <CloseIcon style={{position: 'inherit'}} onClick={toggleWalletModal}>
              <CloseColor />
            </CloseIcon>
          </HeaderRow>
          <ContentWrapper>
            {error instanceof UnsupportedChainIdError ? (
              <>
              <h5 style={{textAlign: 'center'}}>{'Please connect to an appropriate supported network.'}</h5>
              <Flex style={{justifyContent: 'space-between'}}>
                {connector === injected && <ButtonPrimary mt={'10px'} style={{width: '48%'}} onClick={() => connectNet('moonriver')} >{'Moonriver'}</ButtonPrimary>}
                {connector === injected && <ButtonPrimary mt={'10px'} style={{width: '48%'}} onClick={() => connectNet('bsc')} >{'BSC'}</ButtonPrimary>}
              </Flex>
              </>
            ) : (
              'Error connecting. Please make sure you are connected to an appropriate supported network.'
            )}
          </ContentWrapper>
        </UpperSection>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      )
    }

    return (
      <UpperSection>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <HoverText
              onClick={() => {
                setPendingError(false)
                setWalletView(WALLET_VIEWS.ACCOUNT)
              }}
            >
              Back
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>Connect to a wallet</HoverText>
            <CloseIcon style={{top: 'auto', stroke: theme.text1}} onClick={toggleWalletModal}>
              <CloseColor />
            </CloseIcon>
          </HeaderRow>
        )}
        <ContentWrapper style={{backgroundColor: 'transparent', width: '100%'}}>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
          <span>
            <Text style={{textAlign: 'center', fontSize: '14px', marginTop: '10px'}}>
              {'By connecting a wallet you accept'}
            </Text>
            <Text style={{textAlign: 'center', fontSize: '13px'}}>
              {` our `}
              {<Link style={{color: theme.pinkBrown, textDecoration: 'none'}} href="https://d3v8yom54t2cda.cloudfront.net/Terms+of+Service+-+Zircon+Finance.pdf">terms and conditions</Link>}
              {` and `}
              {<Link style={{color: theme.pinkBrown, textDecoration: 'none'}} href="https://d3v8yom54t2cda.cloudfront.net/Privacy+Policy+-+Zircon+Finance.pdf">privacy policy</Link>}
            </Text>
          </span>
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb style={{display: 'flex', flexFlow: 'column'}}>
              <span style={{marginBottom: '10px'}}>Haven't got a crypto wallet yet? &nbsp;</span>{' '}

            <ButtonPink
            style={{
              padding: "10px",
              fontSize: "13px",
              border: "none",
              fontWeight: 500
            }}
            onClick={() => {
              window.open('https://ethereum.org/en/wallets/', '_blank');
            }}
            >
            <Link style={{textDecoration: 'none', color: theme.pinkGamma}} href="#" >
              {'Learn how to connect'}
            </Link>
            </ButtonPink>
            </Blurb>
          )}
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
