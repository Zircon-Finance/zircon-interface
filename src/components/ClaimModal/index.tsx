import React, { useEffect, useState } from 'react'
import { Modal } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'
import { ButtonOutlined, } from '../../components/Button'
import { Text } from 'rebass'
import { Token } from 'diffuse-sdk'
import { useTheme } from 'styled-components'
import Balance from '../Balance'
import {providers, ethers, BigNumber} from "ethers";
import airdrop_abi from "../../constants/abi/airdrop_abi.json";
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { AutoColumn } from '../Column'
import { LottieContainer } from '../../pages/App'
import animation from '../../assets/lotties/claim_lottie.json'
import animation2 from '../../assets/lotties/z9rH3jsFYe.json'
import Lottie from "lottie-react-web";
import axios from 'axios'
import {useTransactionAdder} from "../../state/transactions/hooks";
import TransactionConfirmationModal from '../TransactionConfirmationModal'
import { RowBetween } from '../Row'
import { StyledWarningIcon } from '../../pages/AddLiquidity/ConfirmAddModalBottom'

interface ClaimModalProps {
    onConfirm?: (amount: string, token: Token) => void
    onDismiss?: () => void
    addLiquidityUrl?: string
    token?: Token
    isOpen: boolean
}

const ClaimModal: React.FC<ClaimModalProps> = ({
                                                   onConfirm,
                                                   onDismiss,
                                                   token,
                                                   isOpen,
                                               }) => {
    const { t } = useTranslation()
    const { account } = useActiveWeb3React()
    const [errorTx, setErrorTx] = useState<string>("");
    const theme = useTheme()
    const addTransaction = useTransactionAdder()
    const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string>("");


    const provider = account && new providers.Web3Provider(window.ethereum)
    const airdrop_address = '0x274b8752ca123712D9B966e53673092bb4d10311'
    const abi = airdrop_abi

    // call contract airdrop
    const airdrop_contract = new ethers.Contract(airdrop_address, abi, provider)

    // contract ppsigner
    const signer = account && (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
    const airdropWithSigner = airdrop_contract?.connect(signer)
    // proofData leaves
    const toggleWalletModal = useWalletModalToggle()
    const [dataUser, setDataUser] = useState({
        address: "",
        amount: 0,
        index: '0',
        proof: [],
        isClaimed: false,
        isClaiming: false,
    });
    const [hasJustClaimed, setHasJustClaimed] = useState(false)
    const [loading, setLoading] = useState(false)

    const check = (data) => {
        const dummyData = {
            address: data?.body?.data?.account,
            amount: data?.body?.data?.amount,
            index: data?.body?.data?.index,
            proof: data?.body?.data?.proof,
            isClaimed: false,
            isClaiming: false
        }
        airdropWithSigner?.check(
            dummyData?.index,
            dummyData?.address,
            BigNumber.from(dummyData?.amount),
            dummyData?.proof).then((res: any) => {
            setDataUser(dummyData)
        }).catch((error) => {
            console.log(error)
            setDataUser({...dummyData, isClaimed: true})
        })
    }

    const getUserData = async (address) => {
        setLoading(true)
        await axios.get(`https://edgeapi.diffuse.finance/proofs/${address}`).then((res) => {
            res?.data?.body?.data?.index && check(res?.data)
            setLoading(false)
        });
    }

    useEffect(() => {
        account && getUserData(account)
    }, [])

    const modalStyle = {
        width: 'auto',
        border: 'none',
    }

    const renderedModal = () => (
        <Modal id="claim_modal" style={modalStyle} title={t('Claim tokens')} onDismiss={onDismiss} borderBottom='none'>
            {loading ? <div style={{height: 150,  alignItems: 'center'}}>
                    <Lottie
                        options={{
                            loop: true,
                            autoplay: true,
                            animationData: animation2,
                        }}/>
                </div> :
                <Balance
                    fontSize="45px"
                    color={theme.text1}
                    decimals={2}
                    value={dataUser?.amount}
                    unit={` `}
                    prefix=" "
                    textAlign={'center'}
                />}
            <Text fontSize={'16px'} color={theme.text1} textAlign={'center'}
                  style={{paddingBottom: '20px', borderBottom:`1px solid ${theme.opacitySmall}`}}>
                {dataUser.isClaimed ? t('Total Claimed ZRG') : t('Total Claimable ZRG')}</Text>
            <AutoColumn gap='5px' style={{padding: '20px'}}>
                <Text fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'ZRG token'}</Text>
                <Text fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'This is the official airdrop for ZRG Token operating in Moonriver Network.'}</Text>
            </AutoColumn>
            <ButtonOutlined style={{ alignSelf: 'center', background: theme.poolPinkButton, width: '100%'}}
                            disabled={(account && !dataUser?.amount) || (account && dataUser.isClaimed)}
                            onClick={
                                () =>
                                    account ?
                                        (setAttemptingTxn(true),
                                        airdropWithSigner.claim(
                                            BigNumber.from(dataUser?.index),
                                            BigNumber.from(dataUser?.amount),
                                            dataUser?.proof).then(
                                            function(transaction){
                                                setDataUser({...dataUser, isClaimed: true, isClaiming: true})
                                                setHasJustClaimed(true)
                                                setTxHash(transaction.hash)
                                                setAttemptingTxn(false);
                                                addTransaction(transaction, {
                                                    summary: "Claimed ZRG " + dataUser?.amount,
                                                });
                                                // onDismiss()
                                                setTxHash(transaction.hash);

                                            }
                                        ).catch((error) => {
                                            setAttemptingTxn(false)
                                            setErrorTx('AirDrop has been temporarily paused, it will be resumed soon!')
                                            setDataUser({...dataUser, isClaimed: true})
                                        }))
                                        : [onDismiss(),toggleWalletModal()]
                            }>
                <Text style={{textDecoration: 'none', color: '#fff'}} >
                    {account ? (!dataUser?.amount && !dataUser?.isClaimed) ? 'Nothing to claim' : dataUser?.isClaimed ? dataUser?.isClaiming ? 'Claiming...' : 'Already claimed' : 'Claim tokens' : 'Connect wallet'}</Text>
            </ButtonOutlined>
            {(dataUser?.amount > 0 && hasJustClaimed) && <LottieContainer style={{background: 'transparent', top: 0, right: 0, pointerEvents: 'none'}}>
                <Lottie options={{
                    loop: false,
                    autoplay: true,
                    animationData: animation,
                }}/>
            </LottieContainer>
            }
            {errorTx && (
            <RowBetween mt={10}>
            <StyledWarningIcon />
            <span style={{ color: theme.red1, width: '100%', fontSize: '13px' }}>{errorTx}</span>
            </RowBetween>
        )}
        </Modal>
    )

    return (
        <TransactionConfirmationModal
                isOpen={isOpen}
                onDismiss={onDismiss}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                    renderedModal()
                )}
                pendingText={'Claiming tokens...'}
        />
    )
}

export default ClaimModal
