import React, { CSSProperties, useEffect, useState } from 'react'
import { Modal } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'

import { ButtonOutlined, } from '../../components/Button'
import { Text } from 'rebass'
import { Token } from 'zircon-sdk'
import { useTheme } from 'styled-components'
import Balance from '../Balance'
import {providers, ethers, BigNumber} from "ethers";
import airdrop_abi from "../../constants/abi/airdrop_abi.json";
import { proofData } from '../../constants/proofDats'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { AutoColumn } from '../Column'
import { LottieContainer } from '../../pages/App'
import animation from '../../assets/lotties/claim_lottie.json'
import Lottie from "lottie-react-web";



interface ClaimModalProps {
  onConfirm?: (amount: string, token: Token) => void
  onDismiss?: () => void
  addLiquidityUrl?: string
  token?: Token
}

const ClaimModal: React.FC<ClaimModalProps> = ({
  onConfirm,
  onDismiss,
  token,
  }) => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const theme = useTheme()

  const provider = account && new providers.Web3Provider(window.ethereum)
  const airdrop_address = '0x0dB43854E3143b383461a0Df4054d820fc4Be4D2'
  const abi = airdrop_abi

  // call contract airdrop
  const airdrop_contract = new ethers.Contract(airdrop_address, abi, provider)

  // contract signer
  const signer = account && (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
  const airdropWithSigner = airdrop_contract?.connect(signer)

  // proofData leaves
  const leaves = proofData[0].leavesWithProof;

  const [, setHash] = useState("");
  const toggleWalletModal = useWalletModalToggle()
  const [claimStatus, setClaimStatus] = useState(false);
  const [dataUser, setDataUser] = useState({
    address: "",
    amount: 0,
    index: '0',
    proof: [],
  });

  useEffect(() => {
    account && setDataUser(leaves.find(user => user?.address === account))
    airdropWithSigner?.check(
                BigNumber.from(dataUser?.index || 0) ,
                account,  
                BigNumber.from(dataUser?.amount || 0), 
                dataUser?.proof).then((res: any) => {
      setClaimStatus(false)
    }).catch(() => {
      setClaimStatus(true)
  })
  }, [dataUser, account, leaves])

  const modalStyle = {
    position: 'absolute',
    width: 'auto',
    minWidth: '400px',
  } as CSSProperties

  return (
    <Modal style={modalStyle} title={t('Claim tokens')} onDismiss={onDismiss}>
      <Balance
              fontSize="45px"
              color={theme.text1}
              decimals={2}
              value={dataUser?.amount ?? 0}
              unit={` `}
              prefix=" "
              textAlign={'center'}
      />
      <Text fontSize={'16px'} color={theme.text1} textAlign={'center'}
      style={{paddingBottom: '20px', borderBottom:`1px solid ${theme.opacitySmall}`}}>
        {t('TotalClaimable ZPT')}</Text>
        <AutoColumn gap='5px' style={{padding: '20px'}}>
          <Text fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'ZPT token is launched by Zircon Finance.'}</Text>
          <Text fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'Read more about token distribution here.'}</Text>
        </AutoColumn>
      <ButtonOutlined style={{ alignSelf: 'center', background: theme.poolPinkButton, width: '100%'}}
      disabled={(account && !dataUser?.amount) || (account && claimStatus)}
      onClick={
        () => 
        account ? 
        airdropWithSigner.claim(
                BigNumber.from(dataUser?.index),  
                BigNumber.from(dataUser?.amount), 
                dataUser?.proof).then(
                    function(transaction){
                        setClaimStatus(true)
                        setHash(transaction.hash)
                    }
                ).catch((error) => {
                        setClaimStatus(true)
                })
              : [onDismiss(),toggleWalletModal()]
              }>
        <Text style={{textDecoration: 'none', color: '#fff'}} >
          {account ? !dataUser?.amount ? 'Nothing to claim' : claimStatus ? 'Already claimed' : 'Claim tokens' : 'Connect wallet'}</Text>
      </ButtonOutlined>
      {() => airdropWithSigner?.check(
            BigNumber.from(dataUser?.index),
            account,  
            BigNumber.from(dataUser?.amount), 
            dataUser?.proof).then((res: any) => {
              return(<LottieContainer style={{background: 'transparent', top: 0, right: 0, pointerEvents: 'none'}}>
              <Lottie options={{
                loop: false,
                autoplay: true,
                animationData: animation,
              }}/>
            </LottieContainer>)
      }).catch(() => {
        setClaimStatus(true)
        return (<> </>)
      })}
    </Modal>
  )
}

export default ClaimModal
