import { AbstractConnector } from '@web3-react/abstract-connector'
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { SUPPORTED_WALLETS } from '../../constants'
import { injected } from '../../connectors'
import { darken } from 'polished'
import Loader from '../Loader'
import { Flex, Text } from 'rebass'

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  flex-flow: column-reverse;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const StyledLoader = styled(Loader)`
  margin-right: 1rem;
`

const LoadingMessage = styled.div<{ error?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  border-radius: 27px;
  margin-bottom: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${({ theme, error }) => (error ? theme.red1 : 'inherit')};
  border: 1px solid ${({ theme, error }) => (error ? theme.red1 : 'none')};

  & > * {
    padding: 1rem;
  }
`

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: flex-start;
`

const ErrorButton = styled.div`
  border-radius: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.anchorFloatBadge};
  margin-left: 1rem;
  padding: 0.5rem;
  font-weight: 400;
  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => darken(0.1, theme.text4)};
  }
`

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
`

export default function PendingView({
  connector,
  error = false,
  setPendingError,
  tryActivation
}: {
  connector?: AbstractConnector
  error?: boolean
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
}) {
  const isMetamask = window?.ethereum?.isMetaMask
  const theme = useTheme()

  return (
    <PendingSection>
      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <div>Error connecting.</div>
              <ErrorButton
                onClick={() => {
                  setPendingError(false)
                  connector && tryActivation(connector)
                }}
              >
                Try Again
              </ErrorButton>
            </ErrorGroup>
          ) : (
            <>
              <StyledLoader />
              Initializing...
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
      {Object.keys(SUPPORTED_WALLETS).map(key => {
        const option = SUPPORTED_WALLETS[key]
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== 'MetaMask') {
              return null
            }
            if (!isMetamask && option.name === 'MetaMask') {
              return null
            }
          }
          return (
            // <Option
            //   id={`connect-${key}`}
            //   key={key}
            //   clickable={false}
            //   color={option.color}
            //   header={option.name}
            //   subheader={option.description}
            //   icon={require('../../assets/images/' + option.iconName)}
            // />
            <Flex justifyContent={'center'} flexDirection={'column'}>
              <img style={{height: '70px', width: '70px', margin: 'auto', marginBottom: '15px'}} src={require('../../assets/images/' + option.iconName)} />
              <Text textAlign={'center'} fontWeight={500} fontSize={'18px'} color={theme.text1}>{option.name}</Text>
              <Text textAlign={'center'} color={theme.whiteHalf} mb={'20px'}>{option.description}</Text>
            </Flex>
            
          )
        }
        return null
      })}
    </PendingSection>
  )
}
