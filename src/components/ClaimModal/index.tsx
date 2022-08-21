import React, { useEffect, useState } from 'react'
import { Flex, Modal } from '@pancakeswap/uikit'
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
  }, [dataUser, account, leaves])

  console.log('dataUser', dataUser)
  return (
    <Modal style={{position: 'absolute', width: 'auto', maxWidth: '360px'}} title={t('Claim tokens')} onDismiss={onDismiss}>
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
      style={{paddingBottom: '20px', borderBottom:`1px solid ${theme.whiteHalf}`}}>
        {t('TotalClaimable ZPT')}</Text>
        <Text my={'20px'} fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'ZPT token is launched by Zircon Finance.'}</Text>
        <Text mb={'20px'} fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'Read more about token distribution here.'}</Text>
      <ButtonOutlined style={{ alignSelf: 'center', background: theme.poolPinkButton, width: '100%', marginTop: '20px' }}
      disabled={(account && !dataUser?.amount) || claimStatus}
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
          {account ? claimStatus ? 'Already claimed' : 'Claim tokens' : 'Connect wallet'}</Text>
      </ButtonOutlined>
      <Flex mb="15px" alignItems="center" justifyContent="space-around">
      </Flex>
    </Modal>
  )
}

export default ClaimModal
