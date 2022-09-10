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
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { AutoColumn } from '../Column'
import { LottieContainer } from '../../pages/App'
import animation from '../../assets/lotties/claim_lottie.json'
import Lottie from "lottie-react-web";
import axios from 'axios'



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
  const airdrop_address = '0xfcb63d9D26965093fd7F87EC4Ce71D7b5949A49d'
  const abi = airdrop_abi

  // call contract airdrop
  const airdrop_contract = new ethers.Contract(airdrop_address, abi, provider)

  // contract signer
  const signer = account && (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
  const airdropWithSigner = airdrop_contract?.connect(signer)

  // proofData leaves
  const [, setHash] = useState("");
  const toggleWalletModal = useWalletModalToggle()
  const [dataUser, setDataUser] = useState({
    address: "",
    amount: 0,
    index: '0',
    proof: [],
    isClaimed: false,
  });
  const [hasJustClaimed, setHasJustClaimed] = useState(false)

  const check = (data) => {
    const dummyData = {
      address: data?.body?.data?.address,
      amount: data?.body?.data?.amount,
      index: data?.body?.data?.index,
      proof: data?.body?.data?.proof,
      isClaimed: false,
    }

    airdropWithSigner?.check(
      BigNumber.from(dummyData?.index),
      dataUser?.address,  
      BigNumber.from(dummyData?.amount), 
      dataUser?.proof).then((res: any) => {
        setDataUser(dummyData)
        }).catch(() => {
          setDataUser({...dummyData, isClaimed: true})
      })
  }

  const getUserData = async (address) => {
    await axios.get(`https://edgeapi.zircon.finance/proofs/${address}`).then((res) => {
      console.log('res', res)
    res?.data?.body?.data?.index && check(res?.data)
    });
  }
  
  useEffect(() => {
    account && getUserData(account)
  }, [])

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
              value={dataUser?.amount}
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
      disabled={(account && !dataUser?.amount) || (account && dataUser.isClaimed)}
      onClick={
        () => 
        account ? 
        airdropWithSigner.claim(
                BigNumber.from(dataUser?.index),  
                BigNumber.from(dataUser?.amount), 
                dataUser?.proof).then(
                    function(transaction){
                        setDataUser({...dataUser, isClaimed: true})
                        setHasJustClaimed(true)
                        setHash(transaction.hash)
                    }
                ).catch((error) => {
                    setDataUser({...dataUser, isClaimed: true})
                })
              : [onDismiss(),toggleWalletModal()]
              }>
        <Text style={{textDecoration: 'none', color: '#fff'}} >
          {account ? (!dataUser?.amount && !dataUser?.isClaimed) ? 'Nothing to claim' : dataUser?.isClaimed ? 'Already claimed' : 'Claim tokens' : 'Connect wallet'}</Text>
      </ButtonOutlined>
      {hasJustClaimed && <LottieContainer style={{background: 'transparent', top: 0, right: 0, pointerEvents: 'none'}}>
          <Lottie options={{
            loop: false,
            autoplay: true,
            animationData: animation,
          }}/>
        </LottieContainer>
      }
    </Modal>
  )
}

export default ClaimModal
