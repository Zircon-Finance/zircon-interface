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
  const provider = new providers.Web3Provider(window.ethereum)
  const airdrop_address = '0x08Ed2beD63A7a127d95F3Da455e79674553d90bD'
  const abi = airdrop_abi

  // call contract airdrop
  const airdrop_contract = new ethers.Contract(airdrop_address, abi, provider)

  // contract signer
  const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
  const airdropWithSigner = airdrop_contract?.connect(signer)

  // proofData leaves
  const leaves = proofData[0].leavesWithProof;

  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const theme = useTheme()

  const [, setHash] = useState("");
  const [claimStatus, setClaimStatus] = useState(false);
  const [dataUser, setDataUser] = useState({
    address: "",
    amount: 0,
    index: '0',
    proof: [],
  });

  useEffect(() => {
    setDataUser(leaves.find(user => user.address === account))
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
      onClick={
        () => airdropWithSigner.claim(
                BigNumber.from(dataUser?.index),  
                BigNumber.from(dataUser?.amount), 
                dataUser?.proof).then(
                    function(transaction){
                        setClaimStatus(true)
                        setHash(transaction.hash)
                    }
                ).catch((error) => {
                    if (error.reason === "Already Claimed"){
                        setClaimStatus(true)
                    } else {
                        console.log(error)
                    }
                })}>
        <Text style={{textDecoration: 'none', color: '#fff'}} >{claimStatus ? 'Already claimed' : 'Claim tokens'}</Text>
      </ButtonOutlined>
      <Flex mb="15px" alignItems="center" justifyContent="space-around">
      </Flex>
    </Modal>
  )
}

export default ClaimModal
