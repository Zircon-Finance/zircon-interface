import {TransactionResponse} from '@ethersproject/providers'
import {Currency, currencyEquals, NATIVE_TOKEN, Percent, WDEV} from 'zircon-sdk'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {ArrowDown, Plus} from 'react-feather'
import ReactGA from 'react-ga4'
import {Flex, Text} from 'rebass'
import {useTheme} from 'styled-components'
import {ButtonAnchor, ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary} from '../../components/Button'
import {LightPinkCard, TransparentCard} from '../../components/Card'
import {AutoColumn, ColumnCenter} from '../../components/Column'
import TransactionConfirmationModal, {ConfirmationModalContent} from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import {AddRemoveTabs} from '../../components/NavigationTabs'
import {MinimalPositionPylonCard} from '../../components/PositionCard'
import Row, {RowBetween, RowFixed} from '../../components/Row'
import { MaxUint256 } from '@ethersproject/constants'

import Slider from '../../components/Slider'
import CurrencyLogo from '../../components/CurrencyLogo'
import {PYLON_ROUTER_ADDRESS} from '../../constants'
import {useActiveWeb3React} from '../../hooks'
import {useCurrency} from '../../hooks/Tokens'

import {useTransactionAdder} from '../../state/transactions/hooks'
import {StyledInternalLink} from '../../theme'
import {calculateSlippageAmount, getPylonRouterContract} from '../../utils'
//calculateGasMargin,
import {currencyId} from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import {wrappedCurrency} from '../../utils/wrappedCurrency'
import AppBodySmaller from '../AppBodySmaller'
import {WrapperWithPadding} from '../Pool/styleds'
import {ApprovalState, useApproveCallback} from '../../hooks/useApproveCallback'
import {Dots} from '../../components/swap/styleds'
import {useBurnActionHandlers, useBurnState, useDerivedPylonBurnInfo} from '../../state/burn/hooks'
import {Field} from '../../state/burn/actions'
import {useBlockNumber, useWalletModalToggle} from '../../state/application/hooks'
import {useUserDeadline, useUserSlippageTolerance} from '../../state/user/hooks'
import {BigNumber} from '@ethersproject/bignumber'
import {RouteComponentProps} from "react-router-dom";
import LearnIcon from '../../components/LearnIcon'
import {usePylonConstants} from "../../data/PylonData";
import styled from 'styled-components'
import BigNumberJs from "bignumber.js";
import CapacityIndicator from "../../components/CapacityIndicator";
import { StyledWarningIcon } from '../AddLiquidity/ConfirmAddModalBottom'
import { useBatchPrecompileContract, useTokenContract } from '../../hooks/useContract'
import { ConfirmationInput, InputContainer, PinkContainer, RadioButton, RadioContainer } from '../AddLiquidityPro'
import PlusIcon from '../../views/Farms/components/PlusIcon'
import ErrorTxContainer from '../../components/ErrorTxContainer'
import { ethers } from 'ethers'

export const PercButton = styled.button<{ width: string }>`
  padding: 0.5rem 1rem;
  background-color: ${({theme}) => theme.darkMode ? '#482537' : theme.darkerContrastPink};
  color: ${({theme}) => theme.slippageActive};
  border-radius: 17px;
  font-size: 13px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 600;
  cursor: pointer;
  outline: none;
  border: none;
  overflow: hidden;
  :hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: ${({theme}) => theme.text1};
  }
`

export default function RemoveProLiquidity({
                                             history,
                                             match: {
                                               params: { currencyIdA, currencyIdB, float }
                                             }
                                           }: RouteComponentProps<{ currencyIdA: string; currencyIdB: string, float: string }>) {
  let isFloat = float === "FLOAT";
  const [sync, setSync] = useState(true);
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId
  ])
  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pylon, parsedAmounts, error, healthFactor, burnInfo, delta } =
      useDerivedPylonBurnInfo(currencyA ?? undefined, currencyB ?? undefined, isFloat, sync, {
        float: ethers.BigNumber.from(10).pow(currencyA?.decimals || 18).toString(),
        anchor: ethers.BigNumber.from(10).pow(currencyB?.decimals || 18).toString(),
        priceMultiplier: ethers.BigNumber.from(10).pow((currencyA?.decimals + 18 - currencyB?.decimals) || 18).toString()
  })
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error
  let textError = ''
  if ((independentField === Field.CURRENCY_A && typedValue > parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)) || 
    (independentField === Field.CURRENCY_B && typedValue > parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)) ||
    (independentField === Field.LIQUIDITY && typedValue > parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)) ||
    parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) === '0') textError = 'Enter an amount' 
  else textError = ''
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const batchContract = useBatchPrecompileContract()
  const tokenContract = useTokenContract(parsedAmounts[Field.LIQUIDITY]?.token?.address)

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
        ? '0'
        : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
            ? '<1'
            : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
        independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY] ? parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) : '' ?? '',
    [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]  ? parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) : '' ?? '',
    [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B] ? parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) : '' ?? ''
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  // const pairContract: Contract | null = usePairContract(pylon?.pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(
      parsedAmounts[Field.LIQUIDITY],
      PYLON_ROUTER_ADDRESS[chainId ? chainId : '']
  )
  const pylonConstants = usePylonConstants()
  const blockNumber = useBlockNumber()

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
      (field: Field, typedValue: string) => {
        setSignatureData(null)
        return _onUserInput(field, typedValue)
      },
      [_onUserInput]
  )

  const onLiquidityInput = useCallback((typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue), [
    onUserInput
  ])
  const onCurrencyAInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue), [
    onUserInput
  ])
  const onCurrencyBInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue), [
    onUserInput
  ])

  // tx sending
  const addTransaction = useTransactionAdder()
  const [errorTx, setErrorTx] = useState<string>('')
  async function onRemove() {
    if (!chainId || !library || !account) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getPylonRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === NATIVE_TOKEN[chainId]
    const oneCurrencyIsETH = currencyA === NATIVE_TOKEN[chainId] || currencyBIsETH
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[], args: (string  | boolean | number)[]
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED || chainId === 1285 || chainId === 1287) {
      // removeLiquidityETH
      if(sync) {
        if (oneCurrencyIsETH) {
          methodNames = ['removeLiquiditySyncETH']
          args = [
            currencyBIsETH ? tokenA.address : tokenB.address,
            liquidityAmount.raw.toString(),
            amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
            !currencyBIsETH,
            !isFloat,
            account,
            deadlineFromNow
          ]
        }
        // removeLiquidity
        else {
          methodNames = ['removeLiquiditySync']
          args = [
            tokenA.address,
            tokenB.address,
            liquidityAmount.raw.toString(),
            amountsMin[Field.CURRENCY_A].toString(),
            !isFloat,
            account,
            deadlineFromNow
          ]
        }
      }
      // we have a signataure, use permit versions of remove liquidity
      else {
        if (oneCurrencyIsETH) {

          methodNames = ['removeLiquidityAsyncETH']
          args = [
            currencyBIsETH ? tokenA.address : tokenB.address,
            liquidityAmount.raw.toString(),
            amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
            amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
            !currencyBIsETH,
            !isFloat,
            account,
            deadlineFromNow
          ]
          console.log("args", args)
        }
        // removeLiquidity
        else {
          methodNames = ['removeLiquidityAsync']
          args = [
            tokenA.address,
            tokenB.address,
            liquidityAmount.raw.toString(),
            amountsMin[Field.CURRENCY_A].toString(),
            amountsMin[Field.CURRENCY_B].toString(),
            !isFloat,
            account,
            deadlineFromNow
          ]
        }
      }
    }else{
      throw new Error('Attempting to confirm without approval. Please contact support.')
    }
    /*
    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map(methodName =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch(error => {
            console.error(`estimateGas failed`, methodName, args, error)
            return undefined
          })
      )
    )
    */
    const safeGasEstimates: BigNumber[] = [BigNumber.from('1000000')]
    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
        BigNumber.isBigNumber(safeGasEstimate)
    )

    const approvalCallData = tokenContract.interface.encodeFunctionData('approve', [router.address, MaxUint256])
    const callData = router.interface.encodeFunctionData((
      sync ? oneCurrencyIsETH ? 'removeLiquiditySyncETH' : 'removeLiquiditySync' :
      oneCurrencyIsETH ? 'removeLiquidityAsyncETH' : 'removeLiquidityAsync'), args)

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)
      await ((chainId === 1285 || chainId === 1287) ?
        batchContract.batchAll(
          [tokenContract.address, router.address],
          ["000000000000000000", "000000000000000000"],
          [approvalCallData, callData],
          [1000000, 1000000, 1000000]
        )
        :
        router[methodName](...args, {
        gasLimit: safeGasEstimate
      }))
          .then((response: TransactionResponse) => {
            setAttemptingTxn(false)

            addTransaction(response, {
              summary:
                  sync ? 'Remove Sync ' : 'Remove Async ' +
                      parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                      ' ' +
                      currencyA?.symbol +
                      ' and ' +
                      parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                      ' ' +
                      currencyB?.symbol
            })

            setTxHash(response.hash)

            ReactGA.event({
              category: 'Liquidity',
              action: `Remove ${sync ? 'Sync' : 'Async'} liquidity`,
              label: [currencyA?.symbol, currencyB?.symbol].join('/')
            })
          })
          .catch((error) => {
            setAttemptingTxn(false)
            setErrorTx(error?.data?.message);
            // we only care if the error is something _other_ than the user rejected the tx
            console.error(error)
          })
    }
  }

 // logic for modal for too high fees
 const [originalValue, setOriginalValue] = useState('')
 const [confirmedString, setConfirmedString] = useState(false)
 const [hasConfirmed, setHasConfirmed] = useState(false)
 const [hasSetAsync, setHasSetAsync] = useState(false)
 const [confirmationSlippage, setConfirmationSlippage] = useState(false)
 const [chosenOption, setChosenOption] = useState(2)
 const [rememberedSlippage, setRememberedSlippage] = useState(0)

 const differencePercentage = (new BigNumberJs(formattedAmounts[Field.CURRENCY_A] || 0).times(
  new BigNumberJs(!isFloat ? pylon?.pair?.priceOf(tokenA).toSignificant(6) : pylon?.pair?.priceOf(tokenB).toSignificant(6))).plus(
    new BigNumberJs(formattedAmounts[Field.CURRENCY_B] || 0))).minus(
      new BigNumberJs(originalValue)).div(
        new BigNumberJs(originalValue).times(
          new BigNumberJs(100))).toString()
  const feeIsTooHigh = rememberedSlippage >= 5

 const setCustom = () => {
  setOriginalValue(parsedAmounts[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.toFixed(6));
  setSync(false);
}

 useEffect(() => {
  if (showConfirm && feeIsTooHigh) {
    setCustom();
  }
  else if (!showConfirm ) {
    setConfirmedString(false);
    setOriginalValue('');
    setHasConfirmed(false);
    setConfirmationSlippage(false);
    setChosenOption(2);
    setHasSetAsync(false);
    setSync(true);
  }
}, [showConfirm])

const handleChangeConfirmation = (typedValue: string) => {
  setConfirmedString(typedValue.toLowerCase() === 'confirm');
}

const backToOriginalValue = () => {
  setHasSetAsync(false);
  onLiquidityInput(originalValue)
  setSync(true);
}

useEffect(() => {
  if (hasConfirmed) {
    backToOriginalValue();
  }
}, [hasConfirmed])


const NoSlippageModalHeader = () => (
  <AutoColumn gap={'5px'} style={{ marginTop: '15px' }}>
    <RowBetween align="center">
      <Text fontSize={24} fontWeight={400}>
        {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
      </Text>
      <RowFixed gap="4px">
        <CurrencyLogo currency={currencyA} size={'24px'} chainId={chainId} />
        <Text fontSize={24} fontWeight={400} style={{ marginLeft: '10px' }}>
          {currencyA?.symbol}
        </Text>
      </RowFixed>
    </RowBetween>
    {!sync && <>
    <RowFixed>
      <Plus size="16" color={theme.text2} />
    </RowFixed>
    <RowBetween align="center">
      <Text fontSize={24} fontWeight={400}>
        {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
      </Text>
      <RowFixed gap="4px">
        <CurrencyLogo currency={currencyB} size={'24px'} chainId={chainId} />
        <Text fontSize={24} fontWeight={400} style={{ marginLeft: '10px' }}>
          {currencyB?.symbol}
        </Text>
      </RowFixed>
    </RowBetween>
    </>}

    <Text fontSize={12} textAlign="left" padding={"20px 0 0 0 "} color={theme.whiteHalf}>
      {`Output is estimated. If the price changes by more than ${allowedSlippage /
      100}% your transaction will revert.`}
    </Text>
  </AutoColumn>
)

const ConfirmationInputModal = () => (
  <Flex flexDirection={'column'}>
    <Flex justifyContent={'center'}><Text mr='5px'>{`Type`}</Text><Text mr='5px' style={{fontWeight: 500, color: theme.pinkGamma}}>{'Confirm '}</Text><Text> {' if you are sure'}</Text></Flex>
    <Flex justifyContent={'center'} mb='10px'><Text mr='5px'>{`you want`}</Text><Text mr='5px' style={{fontWeight: 500, color: theme.pinkGamma}}>
      {`to lose ${Math.abs(parseFloat(differencePercentage)).toFixed(2)}%`}
      </Text><Text>{'of your position'}</Text>
    </Flex>
    <InputContainer>
      <ConfirmationInput disabled={confirmedString} type="text" onChange={e => handleChangeConfirmation(e.target.value)} />
      <ButtonPrimary disabled={!confirmedString} onClick={() => (setHasConfirmed(true),setConfirmationSlippage(false))}
      style={{ margin: 'auto', padding: '12px', height: 'auto', borderRadius: '12px' }}>{'Proceed'}</ButtonPrimary>
    </InputContainer>
  </Flex>
)

const SlippageWarningModal = () => (
<Flex flexDirection={'column'} style={{background: theme.darkMode ? '#52273A' : 'transparent'}}>
        <Text mt='20px' style={{lineHeight: '160%'}} textAlign='center'>{'You can reduce slippage and get more'}</Text>
        <Text mb='10px' textAlign='center'>{`tokens using the Hybrid Remove method`}</Text>
        <Flex mt='20px' mb='30px' mx='auto' style={{gap: '10px', textAlign: 'center'}}>
          <Flex onClick={() => [setChosenOption(1), setConfirmationSlippage(true)]} flexDirection={'column'}
          style={{
            border: `${(chosenOption === 1) ? `2px solid ${theme.pinkGamma}` :
              theme.darkMode ? '2px solid rgba(98, 47, 69, 0.5)' : '2px solid #F5F3F4'}` ,
               borderRadius: '17px', cursor: 'pointer', marginTop: '30px'}}>
            <Text fontSize='14px' fontWeight={500} p='20px 10px' style={{borderBottom: `1px solid ${theme.darkMode ? '#5A2B3F' : '#F5F3F4'}`}}>{'CURRENT POSITION'}</Text>
            <Text my='10px'>{'You get'}</Text>
            <Text fontSize='18px' mb='20px' fontWeight={500}>{`${originalValue.length > 15 ? originalValue.slice(0, 3) + '...' + originalValue.slice(-3) : originalValue} ${!isFloat ? currencyB?.symbol : currencyA?.symbol}`}</Text>
            <RadioContainer style={{marginTop: '5px'}} active={chosenOption === 1} second={false}>
              <RadioButton active={chosenOption === 1} />
            </RadioContainer>
          </Flex>
          <Flex flexDirection={'column'}><PinkContainer><Text>{'Lower slippage'}</Text></PinkContainer>
            <Flex onClick={() => [setChosenOption(2), setConfirmationSlippage(false)]} flexDirection={'column'}
              style={{border: `${(chosenOption === 2) ? `2px solid ${theme.pinkGamma}` : '2px solid transparent'}` ,
              borderBottomLeftRadius: '17px',
              borderBottomRightRadius: '17px',
              backgroundColor: theme.darkMode ? '#622F45' : '#EEEAEC',
              cursor: 'pointer'}}
            >
              <Text fontSize='14px' fontWeight={500} p='20px 10px' style={{borderBottom: `1px solid ${theme.darkMode ? '#5A2B3F' : '#E4E0E3'}`}}>{'WITH HYBRID REMOVE'}</Text>
              <Text fontSize='14px' my='10px'>{'You get'}</Text>
              <Text fontSize='18px' fontWeight={500}>
                {`${formattedAmounts[Field.CURRENCY_A]} ${isFloat ? currencyB?.symbol : currencyA?.symbol} `}
              </Text>
              <Flex style={{width: '100%', justifyContent: 'center', alignItems:'center'}}><PlusIcon /></Flex>
              <Text fontSize='18px' pb='10px' fontWeight={500}>
                {`${formattedAmounts[Field.CURRENCY_B]} ${!isFloat ? currencyB?.symbol : currencyA?.symbol} `}
              </Text>
              <Text fontSize='14px' pb='10px' color={parseFloat(differencePercentage) >= 0 ? theme.percentageGreen : theme.percentageRed} fontWeight={500}>
                {`${parseFloat(differencePercentage) >= 0 ? '+' : ''} ${parseFloat(differencePercentage).toFixed(2)}%`}
              </Text>
              <RadioContainer style={{marginBottom: '20px'}} active={chosenOption === 2} second={true}>
                <RadioButton active={chosenOption === 2} />
              </RadioContainer>
            </Flex>
          </Flex>
        </Flex>
        {chosenOption === 0 && <Text mb='10px' textAlign='center'>{`Please select an option`}</Text>}
        {chosenOption === 2 && <ButtonPrimary onClick={() => setHasSetAsync(true)} style={{ margin: 'auto' }}>{'Remove with Hybrid Remove'}</ButtonPrimary>}
        {(confirmationSlippage && chosenOption === 1) && <ConfirmationInputModal />}
      </Flex>
)

  function modalHeader() {
    return (
      feeIsTooHigh ?
      !sync ?
      (hasSetAsync || hasConfirmed) ? (
        <NoSlippageModalHeader />
      ) : (
        <SlippageWarningModal />
      ) :
        hasConfirmed ? (
          <NoSlippageModalHeader />
        ) : (
      <SlippageWarningModal />
      )
    : (
    <NoSlippageModalHeader />
    )
  )
  }

  function modalBottom() {
    return (
        <div>
          <RowBetween mb='5px'>
            <Text color={theme.text2} fontWeight={400} fontSize={16}>
              {'ZPT ' + currencyA?.symbol + '/' + currencyB?.symbol} Burned
            </Text>
            <RowFixed>
              <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />
              <Text fontWeight={400} fontSize={16}>
                {parsedAmounts[Field.LIQUIDITY] ? parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) : ''}
              </Text>
            </RowFixed>
          </RowBetween>
          {pylon?.pair && (
              <>
                <RowBetween style={{marginBottom: '5px'}}>
                  <Text color={theme.text2} fontWeight={400} fontSize={16}>
                    Price
                  </Text>
                  <Text fontWeight={400} fontSize={16} color={theme.text1}>
                    1 {currencyA?.symbol} = {tokenA ? pylon?.pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                  </Text>
                </RowBetween>
                <RowBetween style={{marginBottom: '10px'}}>
                  <div />
                  <Text fontWeight={400} fontSize={16} color={theme.text1}>
                    1 {currencyB?.symbol} = {tokenB ? pylon?.pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                  </Text>
                </RowBetween>
              </>
          )}
          {errorTx && (
           <ErrorTxContainer errorTx={errorTx} />
          )}
          {(burnInfo.blocked || burnInfo.asyncBlocked) && (
          <RowBetween mt={10} mb={'10px'}>
            <StyledWarningIcon />
            <span style={{ color: theme.red1, width: '100%', fontSize: '13px' }}>{"Transaction is likely to fail so is currently blocked. Try in a few minutes"}</span>
          </RowBetween>
          )}
          {(burnInfo.deltaApplied) && (
          <RowBetween mt={10} mb={'10px'}>
            <StyledWarningIcon />
            <span style={{ color: theme.red1, width: '100%', fontSize: '13px' }}>{"We estimate a high fee for this transaction. Try in a few minutes"}</span>
          </RowBetween>
          )}
          <ButtonPrimary disabled={!(chainId === 1285 || chainId === 1287) && (!(approval === ApprovalState.APPROVED || signatureData !== null) || burnInfo.blocked || burnInfo.asyncBlocked || burnInfo.deltaApplied || (feeIsTooHigh && (!hasConfirmed && !hasSetAsync)))} onClick={onRemove}>
            <Text fontWeight={400} fontSize={18}>
              Confirm
            </Text>
          </ButtonPrimary>
        </div>
    )
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
      currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`

  const liquidityPercentChangeCallback = useCallback(
      (value: number) => {
        onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
      },
      [onUserInput]
  )

  const oneCurrencyIsETH = currencyA === NATIVE_TOKEN[chainId] || currencyB === NATIVE_TOKEN[chainId]
  const firstCurrencyIsETH = currencyA === NATIVE_TOKEN[chainId]
  const oneCurrencyIsWDEV = Boolean(
      chainId &&
      ((currencyA && currencyEquals(WDEV[chainId], currencyA)) ||
          (currencyB && currencyEquals(WDEV[chainId], currencyB)))
  )
  const firstCurrencyIsWDEV = Boolean(
      chainId &&
      ((currencyA && currencyEquals(WDEV[chainId], currencyA))
      )
  )

  const handleSelectCurrencyA = useCallback(
      (currency: Currency) => {
        if (currencyIdB && currencyId(currency, chainId) === currencyIdB) {
          history.push(`/remove-pro/${currencyId(currency, chainId)}/${currencyIdA}/${isFloat ? "FLOAT" : "ANCHOR"}`)
        } else {
          history.push(`/remove-pro/${currencyId(currency, chainId)}/${currencyIdB}/${isFloat ? "FLOAT" : "ANCHOR"}`)
        }
      },
      [currencyIdA, currencyIdB, history, isFloat]
  )
  const handleSelectCurrencyB = useCallback(
      (currency: Currency) => {
        if (currencyIdA && currencyId(currency, chainId) === currencyIdA) {
          history.push(`/remove-pro/${currencyIdB}/${currencyId(currency, chainId)}/${isFloat ? "FLOAT" : "ANCHOR"}`)
        } else {
          history.push(`/remove-pro/${currencyIdA}/${currencyId(currency, chainId)}/${isFloat ? "FLOAT" : "ANCHOR"}`)
        }
      },
      [currencyIdA, currencyIdB, history, isFloat]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setErrorTx('')
    setConfirmedString(false);
    setOriginalValue('');
    setHasConfirmed(false);
    setConfirmationSlippage(false);
    setChosenOption(2);
    setHasSetAsync(false);
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
      Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
      liquidityPercentChangeCallback
  )
  return (
      <>
        <AppBodySmaller>
          <AddRemoveTabs adding={false} />
          <WrapperWithPadding>
            <TransactionConfirmationModal
                width={feeIsTooHigh && '390'}
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash ? txHash : ''}
                content={() => (
                    <ConfirmationModalContent
                        title={(feeIsTooHigh && (hasConfirmed===false && hasSetAsync===false)) ? 'High slippage warning' : "You will receive"}
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={feeIsTooHigh ? (feeIsTooHigh && (hasConfirmed===false && hasSetAsync===false) ? (() => <></>) : modalBottom) : modalBottom}
                        feeTooHigh={feeIsTooHigh && (hasConfirmed===false && hasSetAsync===false)}
                    />
                )}
                pendingText={pendingText}
            />
            <AutoColumn gap="md">
              <TransparentCard style={{padding: '0px'}}>
                <AutoColumn gap="20px">
                  <Flex justifyContent={'center'}>
                    <div style={{display: 'flex', background: theme.darkMode ? '#482537' : theme.darkerContrastPink, borderRadius: '17px', justifyContent: 'center', height: '33px'}}>

                      <ButtonAnchor borderRadius={'12px'} padding={'5px 15px'}
                                    style={{backgroundColor: !showDetailed ? theme.slippageActive : 'transparent', fontWeight: 500, fontSize: '13px', color: !showDetailed ? '#fff' : theme.slippageActive}}
                                    onClick={()=> {setShowDetailed(!showDetailed)}}>
                        SIMPLE
                      </ButtonAnchor>
                      <ButtonAnchor borderRadius={'12px'} padding={'5px 15px'}
                                    style={{backgroundColor: showDetailed ? theme.slippageActive : 'transparent', fontWeight: 500, fontSize: '13px', color: showDetailed ? '#fff' : theme.slippageActive}}
                                    onClick={()=> {setShowDetailed(!showDetailed)}}>
                        DETAILED
                      </ButtonAnchor>
                    </div>

                  </Flex>
                  <Row style={{ alignItems: 'flex-end' }}>
                    <Text fontSize={30} style={{width: '100%', textAlign: 'center'}}>
                      {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                    </Text>
                  </Row>
                  {!showDetailed && (
                      <>
                        <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                        <div style={{justifyContent: 'space-between', width: '80%', display: 'flex', margin: 'auto'}}>
                          <PercButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} width="20%" >
                            25%
                          </PercButton>
                          <PercButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} width="20%" >
                            50%
                          </PercButton>
                          <PercButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')} width="20%" >
                            75%
                          </PercButton>
                          <PercButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')} width="20%">
                            MAX
                          </PercButton>
                        </div>
                      </>
                  )}
                </AutoColumn>
              </TransparentCard>
              <div style={{display: 'flex', borderRadius: '17px', justifyContent: 'space-between'}}>
                <span style={{display: 'inline', alignSelf: 'center', fontSize: '13px', marginLeft: '10px', fontWeight: 400}}>{'HYBRID BURN'}</span>
                <div style={{display: 'flex', borderRadius: '17px', padding: '5px', background: theme.liquidityBg}}>

                  <ButtonAnchor borderRadius={'12px'} padding={'10px'}
                                style={{backgroundColor: sync ? theme.badgeSmall : 'transparent',
                                  fontWeight: 400, fontSize: '13px',
                                  color: sync ? theme.text1 : theme.meatPinkBrown}}
                                onClick={()=> {setSync(true)}}>
                    OFF
                  </ButtonAnchor>
                  <ButtonAnchor borderRadius={'12px'} padding={'10px'}
                                style={{backgroundColor: !sync ? theme.badgeSmall : 'transparent',
                                  fontWeight: 400, fontSize: '13px',
                                  color: !sync ? theme.text1 : theme.meatPinkBrown}}
                                onClick={()=> {
                                  setSync(false)}}>
                    ON
                  </ButtonAnchor>
                </div>
              </div>
              {!showDetailed && (
                  <>
                    <LightPinkCard>
                      <AutoColumn gap="10px">
                        <span style={{width: '100%', fontSize: '13px'}}>{'YOU WILL RECEIVE'}</span>
                        {(!sync || isFloat) && <RowBetween>
                          <RowFixed>
                            <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} chainId={chainId} />
                            <Text fontSize={16} fontWeight={400} id="remove-liquidity-tokena-symbol">
                              {currencyA?.symbol}
                            </Text>
                          </RowFixed>
                          <Text fontSize={16} fontWeight={400}>
                            {formattedAmounts[Field.CURRENCY_A] || '-'}
                          </Text>

                        </RowBetween>}
                        {(!sync || !isFloat) && <RowBetween>
                          <RowFixed>
                            <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} chainId={chainId} />
                            <Text fontSize={16} fontWeight={400} id="remove-liquidity-tokenb-symbol">
                              {currencyB?.symbol}
                            </Text>
                          </RowFixed>
                          <Text fontSize={16} fontWeight={400}>
                            {formattedAmounts[Field.CURRENCY_B] || '-'}
                          </Text>

                        </RowBetween>}
                        {chainId && (firstCurrencyIsETH || firstCurrencyIsWDEV || ((oneCurrencyIsETH || oneCurrencyIsWDEV) && !sync )) ? (
                            <RowBetween style={{ justifyContent: 'flex-end' }}>
                              {oneCurrencyIsETH ? (
                                  <StyledInternalLink
                                      to={`/remove-pro/${currencyA === NATIVE_TOKEN[chainId] ? WDEV[chainId].address : currencyIdA}/${
                                          currencyB === NATIVE_TOKEN[chainId] ? WDEV[chainId].address : currencyIdB
                                      }/${isFloat ? "FLOAT" : "STABLE"}`}
                                  >
                                    {chainId === 1285 ? 'Receive wMOVR' : 'Receive WBNB'}
                                  </StyledInternalLink>
                              ) : oneCurrencyIsWDEV ? (
                                  <StyledInternalLink
                                      to={`/remove-pro/${
                                          currencyA && currencyEquals(currencyA, WDEV[chainId]) ? NATIVE_TOKEN[chainId].symbol : currencyIdA
                                      }/${currencyB && currencyEquals(currencyB, WDEV[chainId]) ? NATIVE_TOKEN[chainId].symbol : currencyIdB}/${isFloat ? "FLOAT" : "STABLE"}`}
                                  >
                                    {chainId === 1285 ? 'Receive MOVR' : 'Receive BNB'}
                                  </StyledInternalLink>
                              ) : null}
                            </RowBetween>
                        ) : null}
                      </AutoColumn>
                    </LightPinkCard>
                  </>
              )}

              {showDetailed && (
                  <>
                    <CurrencyInputPanel
                        value={formattedAmounts[Field.LIQUIDITY]}
                        onUserInput={onLiquidityInput}
                        onMax={() => {
                          onUserInput(Field.LIQUIDITY_PERCENT, '100')
                        }}
                        showMaxButton={!atMaxAmount}
                        disableCurrencySelect
                        currency={float ? pylon?.floatLiquidityToken : pylon?.anchorLiquidityToken}
                        pair={pylon?.pair}
                        id="liquidity-amount"
                    />
                    <ColumnCenter>
                      <ArrowDown size="16" color={theme.text2} />
                    </ColumnCenter>
                    <CurrencyInputPanel
                        hideBalance={true}
                        value={formattedAmounts[Field.CURRENCY_A]}
                        onUserInput={onCurrencyAInput}
                        onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                        showMaxButton={false}
                        disableCurrencySelect
                        currency={currencyA}
                        label={'Output'}
                        onCurrencySelect={handleSelectCurrencyA}
                        id="remove-liquidity-tokena"
                    />
                    {!sync && <><ColumnCenter>
                      <Plus size="16" color={theme.text2} />
                    </ColumnCenter>
                    <CurrencyInputPanel
                        hideBalance={true}
                        value={formattedAmounts[Field.CURRENCY_B]}
                        onUserInput={onCurrencyBInput}
                        onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                        showMaxButton={false}
                        disableCurrencySelect
                        currency={currencyB}
                        label={'Output'}
                        onCurrencySelect={handleSelectCurrencyB}
                        id="remove-liquidity-tokenb"
                    /></>}
                  </>
              )}
              {pylon?.pair && (
                  <div style={{ padding: '10px 20px' }}>
                    <RowBetween>
                      <Text fontSize={13} fontWeight={400} color={theme.whiteHalf}>Price: </Text>
                      <div>
                        <Text fontSize={13} fontWeight={400} color={theme.whiteHalf}>
                          1 {currencyA?.symbol} = {tokenA ? pylon?.pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                        </Text>
                      </div>
                    </RowBetween>
                    <RowBetween>
                      <div />
                      <div>
                        <Text fontSize={13} fontWeight={400} color={theme.whiteHalf}>
                          1 {currencyB?.symbol} = {tokenB ? pylon?.pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                        </Text>
                      </div>
                    </RowBetween>
                  </div>
              )}
              <div style={{marginBottom: 32}}>
                <CapacityIndicator
                    hoverPage='removeLiq'
                    gamma={new BigNumberJs(delta ? delta : '0').div(new BigNumberJs(10).pow(18))}
                    health={healthFactor}
                    isFloat={isFloat}
                    slashingOmega={new BigNumberJs(burnInfo?.omegaSlashingPercentage.toString()).div(new BigNumberJs(10).pow(18)) ?? new BigNumberJs(0)}
                    blocked={burnInfo?.blocked || burnInfo?.asyncBlocked}
                    feePercentage={new BigNumberJs(burnInfo?.feePercentage.toString()).div(new BigNumberJs(10).pow(18)) ?? new BigNumberJs(0)}
                    isDeltaGamma={burnInfo?.deltaApplied}
                    slippage={new BigNumberJs((burnInfo?.slippage ?? "0").toString()).div(new BigNumberJs(10).pow(18)) ?? new BigNumberJs(0)}
                    reservesPTU={new BigNumberJs((burnInfo?.amountWithSlippage ?? "0").toString()) ?? new BigNumberJs(0)}
                    tokenSymbol0={tokenA?.symbol ?? ""}
                    tokenSymbol1={(tokenB?.symbol) ?? ""}
                    currencies={[currencyA, currencyB]}
                />
              </div>
              <div style={{ position: 'relative' }}>
                {!account ? (
                    <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                ) : (
                    <RowBetween style={{paddingBottom: '10px'}}>
                      {!(chainId === 1285 || chainId === 1287) && (<ButtonConfirmed
                          onClick={() => approveCallback()}
                          confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                          disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                          mr="0.5rem"
                          fontWeight={400}
                          fontSize={16}
                      >
                        {approval === ApprovalState.PENDING ? (
                            <Dots>Approving</Dots>
                        ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                            'Approved'
                        ) : (
                            'Approve'
                        )}
                      </ButtonConfirmed>)}
                      <ButtonError
                          onClick={() => {
                            setShowConfirm(true); setRememberedSlippage(
                              parseFloat(new BigNumberJs(burnInfo?.feePercentage.toString()).div(new BigNumberJs(10).pow(18)).toString()) +
                              parseFloat(new BigNumberJs(burnInfo?.slippage.toString()).div(new BigNumberJs(10).pow(18)).toString())
                            )
                          }}
                          disabled={!(chainId === 1285 || chainId === 1287) ? (!isValid || (approval !== ApprovalState.APPROVED)) : !isValid || textError !== ''}
                          error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                      >
                        <Text fontSize={16} fontWeight={400}>
                          {error || textError || 'Remove'}
                        </Text>
                      </ButtonError>
                    </RowBetween>
                )}
              </div>
            </AutoColumn>



          </WrapperWithPadding>
        </AppBodySmaller>

        {pylon?.pair ? (
            <AutoColumn style={{ minWidth: '20rem', marginTop: '1rem' }}>
              <MinimalPositionPylonCard showUnwrapped={oneCurrencyIsWDEV} pylon={pylon} isFloat={isFloat} pylonConstants={pylonConstants} blockNumber={blockNumber} />
            </AutoColumn>
        ) : null}
        <LearnIcon />
      </>
  )
}
