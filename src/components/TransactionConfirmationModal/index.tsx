import { ChainId } from 'zircon-sdk'
import React  from 'react'
import styled, { useTheme } from 'styled-components'
import Modal from '../Modal'
import { ExternalLink } from '../../theme'
import { Text } from 'rebass'
import { CloseIcon } from '../../theme/components'
import { RowBetween, RowFixed } from '../Row'
import { AlertTriangle, ArrowUpCircle } from 'react-feather'
import { ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
// import Circle from '../../assets/images/blue-loader.svg'

import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
import Lottie from "lottie-react-web";
import animation2 from "../../assets/lotties/z9rH3jsFYe.json";
import useAddTokenToMetaMask from '../../hooks/useAddTokenToMetaMask'
import { useToken } from '../../hooks/Tokens'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 20px;
`

const BottomSection = styled(Section)`
  background-color: transparent;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

// const CustomLightSpinner = styled(Spinner)<{ size: string }>`
//   height: ${({ size }) => size};
//   width: ${({ size }) => size};
// `

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  return (
      <Wrapper>
        <Section>
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <AutoColumn gap="12px" justify={'center'}>

            <div style={{width: 90, height: 90}}>
              <Lottie
                  options={{
                    loop: true,
                    autoplay: true,
                    animationData: animation2,
                  }}/>
            </div>
            </AutoColumn>
            {/*<CustomLightSpinner src={Circle} alt="loader" size={'90px'} />*/}
          </ConfirmedIcon>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={400} fontSize={20}>
              Waiting For Confirmation
            </Text>
            <AutoColumn gap="12px" justify={'center'}>
              <Text fontWeight={400} fontSize={14} color="" textAlign="center">
                {pendingText}
              </Text>
            </AutoColumn>
            <Text fontSize={12} color="gray" textAlign="center">
              Confirm this transaction in your wallet
            </Text>
          </AutoColumn>
        </Section>
      </Wrapper>
  )
}

function TransactionSubmittedContent({
                                       onDismiss,
                                       chainId,
                                       hash,
                                       outputCurrency,
                                       smallClose
                                     }: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  outputCurrency?: string | undefined
  smallClose?: boolean
}) {
  const {library} = useActiveWeb3React()
  const token = useToken(outputCurrency)
  const { addToken, success } = useAddTokenToMetaMask(token)
  const theme = useTheme()

  return (
      <Wrapper>
        <Section>
          <RowBetween>
            <div />
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <ConfirmedIcon>
            <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.text1} />
          </ConfirmedIcon>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={400} fontSize={20}>
              Transaction Submitted
            </Text>

            {chainId && hash && (
                <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>
                  <Text fontWeight={400} fontSize={14} color={theme.meatPink}>
                    View on Moonriver explorer ↗
                  </Text>
                </ExternalLink>
            )}
            {outputCurrency && token !== undefined && library?.provider?.isMetaMask && (
            <ButtonPrimary onClick={addToken} style={{fontSize: '14px', marginTop: '15px'}}
            disabled={success}>
              {!success ? (
                <RowFixed className="mx-auto space-x-2">
                  <span>{`Add ${token?.symbol} to MetaMask`}</span>
                </RowFixed>
              ) : (
                <RowFixed>
                  {`Added ${token?.symbol}`}
                </RowFixed>
              )}
            </ButtonPrimary>
            )}
            <ButtonPrimary style={smallClose ? {background: 'transparent', color: theme.meatPink, height: 'auto', padding: '0px'} 
            : { margin: '20px 0 0 0' }} onClick={onDismiss}>
              <Text fontWeight={400} fontSize={smallClose ? 16 : 20}>
                Close
              </Text>
            </ButtonPrimary>
          </AutoColumn>
        </Section>
      </Wrapper>
  )
}

export function ConfirmationModalContent({
                                           title,
                                           bottomContent,
                                           onDismiss,
                                           topContent
                                         }: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
      <Wrapper>
        <Section style={{padding: '24px 24px 0 24px'}}>
          <RowBetween>
            <Text fontWeight={400} fontSize={16}>
              {title}
            </Text>
            <CloseIcon onClick={onDismiss} strokeWidth={1} />
          </RowBetween>
          {topContent()}
        </Section>
        <BottomSection gap="12px">{bottomContent()}</BottomSection>
      </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useTheme()
  return (
      <Wrapper>
        <Section>
          <RowBetween>
            <Text fontWeight={400} fontSize={20}>
              Error
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <Text fontWeight={400} fontSize={16} color={theme.red1} style={{ textAlign: 'center', width: '85%' }}>
              {message}
            </Text>
          </AutoColumn>
        </Section>
        <BottomSection gap="12px">
          <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
        </BottomSection>
      </Wrapper>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  outputCurrency?: string | undefined
  smallClose? : boolean
}

export default function TransactionConfirmationModal({
                                                       isOpen,
                                                       onDismiss,
                                                       attemptingTxn,
                                                       hash,
                                                       pendingText,
                                                       content,
                                                       outputCurrency,
                                                       smallClose=false
                                                     }: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
      <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
        {attemptingTxn ? (
            <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
        ) : hash ? (
            <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} outputCurrency={outputCurrency} smallClose={smallClose} />
        ) : (
            content()
        )}
      </Modal>
  )
}
