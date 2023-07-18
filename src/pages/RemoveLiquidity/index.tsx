// import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, NATIVE_TOKEN, Percent, WDEV } from 'zircon-sdk'
import React, { useCallback, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
// import ReactGA from 'react-ga4'
import { RouteComponentProps } from 'react-router'
import { Flex, Text } from 'rebass'
import { useTheme } from 'styled-components'
import { ButtonPrimary, ButtonLight, ButtonError, ButtonConfirmed, ButtonAnchor } from '../../components/Button'
import { LightPinkCard, TransparentCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import { MaxUint256 } from '@ethersproject/constants'

import Slider from '../../components/Slider'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
// import { useTransactionAdder } from '../../state/transactions/hooks'
import { StyledInternalLink } from '../../theme'
// import {calculateSlippageAmount, getRouterContract} from '../../utils'
//calculateGasMargin,
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBodySmaller from '../AppBodySmaller'
import { WrapperWithPadding } from '../Pool/styleds'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { Dots } from '../../components/swap/styleds'
import { useBurnActionHandlers } from '../../state/burn/hooks'
import { useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'
import { Field } from '../../state/burn/actions'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'
import { BigNumber } from '@ethersproject/bignumber'
// import LearnIcon from '../../components/LearnIcon'
import { PercButton } from '../RemoveProLiquidity'
import {useTransactionAdder} from "../../state/transactions/hooks";
import {calculateSlippageAmount, getRouterContract} from "../../utils";
import {TransactionResponse} from "@ethersproject/providers";
import ReactGA from "react-ga4";
import { useBatchPrecompileContract, useTokenContract } from '../../hooks/useContract'
import ErrorTxContainer from '../../components/ErrorTxContainer'

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
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
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false);

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)

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
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ''
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))
  const [errorTx, setErrorTx] = useState<string>('')

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(
    parsedAmounts[Field.LIQUIDITY],
    ROUTER_ADDRESS[chainId ? chainId : '']
  )
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
  async function onRemove() {
    if (!chainId || !library || !account) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

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

    let methodNames: string[], args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED || chainId === 1285 || chainId === 1287) {
      // removeLiquidityETH
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadlineFromNow
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadlineFromNow
        ]
      }
    }

    const approvalCallData = tokenContract.interface.encodeFunctionData('approve', [router.address, MaxUint256])
    const callData = router.interface.encodeFunctionData((oneCurrencyIsETH ? 'removeLiquidityETH' : 'removeLiquidity'), args)
    const safeGasEstimates: BigNumber[] = [BigNumber.from('1000000')]
    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

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
              'Remove ' +
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
            action: 'Remove',
            label: [currencyA?.symbol, currencyB?.symbol].join('/')
          })
        })
        .catch((error: Error) => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error)
        })
    }
  }

  function modalHeader() {
    return (
      <AutoColumn gap={'5px'} style={{ marginTop: '15px' }}>
        <RowBetween align="flex-end">
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
        <RowFixed>
          <Plus size="16" color={theme.text2} />
        </RowFixed>
        <RowBetween align="flex-end">
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

        <Text fontSize={12} textAlign="left" padding={"20px 0 0 0 "} color={theme.whiteHalf}>
            {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
          </Text>
      </AutoColumn>
    )
  }

  function modalBottom() {
    return (
      <div>
        <RowBetween>
          <Text color={theme.text2} fontWeight={400} fontSize={16} mb='15px'>
            {'ZPT ' + currencyA?.symbol + '/' + currencyB?.symbol} Burned
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />
            <Text fontWeight={400} fontSize={16}>
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
            <RowBetween style={{marginBottom: '5px'}}>
              <Text color={theme.text2} fontWeight={400} fontSize={16}>
                Price
              </Text>
              <Text fontWeight={400} fontSize={16} color={theme.text1}>
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text fontWeight={400} fontSize={16} color={theme.text1}>
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
            </RowBetween>
          </>
        )}
        {errorTx && (
          <ErrorTxContainer errorTx={errorTx} />
        )}
        <ButtonPrimary disabled={!(chainId === 1285 || chainId === 1287) && (!(approval === ApprovalState.APPROVED || signatureData !== null))} onClick={ ()=> onRemove()}>
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
  const oneCurrencyIsWDEV = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WDEV[chainId], currencyA)) ||
        (currencyB && currencyEquals(WDEV[chainId], currencyB)))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency, chainId) === currencyIdB) {
        history.push(`/remove/${currencyId(currency, chainId)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency, chainId)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency, chainId) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency, chainId)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency, chainId)}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setErrorTx('')
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
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContent
                title={'You will receive'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="md">
            <TransparentCard style={{padding: '0px'}}>
              <AutoColumn gap="20px">
              <Flex justifyContent={'center'} marginBottom={15}>
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
                    <div style={{justifyContent: 'space-between', width: '90%', display: 'flex', margin: 'auto'}}>
                      <PercButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} width="20%">
                        25%
                      </PercButton>
                      <PercButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} width="20%">
                        50%
                      </PercButton>
                      <PercButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')} width="20%">
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
            {!showDetailed && (
              <>
                <LightPinkCard>
                  <AutoColumn gap="10px">
                  <span style={{width: '100%', fontSize: '13px'}}>{'YOU WILL RECEIVE'}</span>
                    <RowBetween>
                      <RowFixed>
                        <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} chainId={chainId} />
                        <Text fontSize={16} fontWeight={400} id="remove-liquidity-tokena-symbol">
                          {currencyA?.symbol}
                        </Text>
                      </RowFixed>
                      <Text fontSize={16} fontWeight={400}>
                        {formattedAmounts[Field.CURRENCY_A] || '-'}
                      </Text>

                    </RowBetween>
                    <RowBetween>
                      <RowFixed>
                        <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} chainId={chainId} />
                        <Text fontSize={16} fontWeight={400} id="remove-liquidity-tokenb-symbol">
                          {currencyB?.symbol}
                        </Text>
                      </RowFixed>
                      <Text fontSize={16} fontWeight={400}>
                        {formattedAmounts[Field.CURRENCY_B] || '-'}
                      </Text>

                    </RowBetween>
                    {chainId && (oneCurrencyIsWDEV || oneCurrencyIsETH) ? (
                      <RowBetween style={{ justifyContent: 'flex-end' }}>
                        {oneCurrencyIsETH ? (
                          <StyledInternalLink
                            to={`/remove/${currencyA === NATIVE_TOKEN[chainId] ? WDEV[chainId].address : currencyIdA}/${
                              currencyB === NATIVE_TOKEN[chainId] ? WDEV[chainId].address : currencyIdB
                            }`}
                          >
                            {chainId === 1285 ? 'Receive wMOVR' : 'Receive WBNB'}
                          </StyledInternalLink>
                        ) : oneCurrencyIsWDEV ? (
                          <StyledInternalLink
                            to={`/remove/${
                              currencyA && currencyEquals(currencyA, WDEV[chainId]) ? NATIVE_TOKEN[chainId].symbol : currencyIdA
                            }/${currencyB && currencyEquals(currencyB, WDEV[chainId]) ? NATIVE_TOKEN[chainId].symbol : currencyIdB}`}
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
                  currency={pair?.liquidityToken}
                  pair={pair}
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
                <ColumnCenter>
                  <Plus size="16" color={theme.text2} />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onCurrencyBInput}
                  disableCurrencySelect
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={false}
                  currency={currencyB}
                  label={'Output'}
                  onCurrencySelect={handleSelectCurrencyB}
                  id="remove-liquidity-tokenb"
                />
              </>
            )}
            {pair && (
              <div style={{ padding: '10px 20px' }}>
                <RowBetween>
                  <Text fontSize={13} fontWeight={400} color={theme.whiteHalf}>Price: </Text>
                  <div>
                    <Text fontSize={13} fontWeight={400} color={theme.whiteHalf}>
                      1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                    </Text>
                  </div>
                </RowBetween>
                <RowBetween>
                  <div />
                  <div>
                    <Text fontSize={13} fontWeight={400} color={theme.whiteHalf}>
                       1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                    </Text>
                  </div>
                </RowBetween>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              {!account ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : (
                <RowBetween style={{paddingBottom: '10px'}}>
                  {!(chainId === 1285 || chainId === 1287) && (<ButtonConfirmed
                    onClick={() => approveCallback()}
                    confirmed={approval === ApprovalState.APPROVED }
                    disabled={approval !== ApprovalState.NOT_APPROVED }
                    mr="0.5rem"
                    fontWeight={400}
                    fontSize={16}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <Dots>Approving</Dots>
                    ) : approval === ApprovalState.APPROVED? (
                      'Approved'
                    ) : (
                      'Approve'
                    )}
                  </ButtonConfirmed>)}
                  <ButtonError
                    onClick={() => {
                      setShowConfirm(true)
                    }}
                    disabled={!(chainId === 1285 || chainId === 1287) ? (!isValid || (approval !== ApprovalState.APPROVED)) : !isValid}
                    error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                  >
                    <Text fontSize={16} fontWeight={400}>
                      {error || 'Remove'}
                    </Text>
                  </ButtonError>
                </RowBetween>
              )}
            </div>
          </AutoColumn>
        </WrapperWithPadding>
      </AppBodySmaller>

      {pair ? (
        <AutoColumn style={{ minWidth: '20rem', marginTop: '1rem' }}>
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWDEV} pair={pair} />
        </AutoColumn>
      ) : null}
      {/* <LearnIcon /> */}
    </>
  )
}
