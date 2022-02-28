import {BigNumber} from '@ethersproject/bignumber'
import {TransactionResponse} from '@ethersproject/providers'
import {Currency, currencyEquals, DEV, TokenAmount, WDEV} from 'zircon-sdk'
import React, {useCallback, useContext, useState} from 'react'
import ReactGA from 'react-ga4'
import {RouteComponentProps} from 'react-router-dom'
import {Text} from 'rebass'
import {ThemeContext} from 'styled-components'
import {ButtonAnchor, ButtonError, ButtonLight, ButtonPrimary} from '../../components/Button'
import {BlueCard, GreyCard, LightCard} from '../../components/Card'
import {AutoColumn, ColumnCenter} from '../../components/Column'
import TransactionConfirmationModal, {ConfirmationModalContent} from '../../components/TransactionConfirmationModal'
import CurrencyInputPanelInputOnly from '../../components/CurrencyInputPanelInputOnly'
import CurrencyInputPanelPicOnly from '../../components/CurrencyInputPanelPicOnly'
import CurrencyInputPanelBalOnly from '../../components/CurrencyInputPanelBalOnly'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import {AddRemoveTabs} from '../../components/NavigationTabs'
import {MinimalPositionPylonCard} from '../../components/PositionCard'
import {RowBetween, RowFlat} from '../../components/Row'
// import { Link } from 'react-router-dom'
// import { ArrowRight } from 'react-feather'
import {PYLON_ROUTER_ADDRESS} from '../../constants'
import {PylonState} from '../../data/PylonReserves'
import {useActiveWeb3React} from '../../hooks'
import {useCurrency} from '../../hooks/Tokens'
import {ApprovalState, useApproveCallback} from '../../hooks/useApproveCallback'
import {useWalletModalToggle} from '../../state/application/hooks'
import {Field} from '../../state/mint/actions'
import {useDerivedPylonMintInfo, useMintActionHandlers, useMintState} from '../../state/mint/pylonHooks'

import {useTransactionAdder} from '../../state/transactions/hooks'
import {useIsExpertMode, useUserDeadline, useUserSlippageTolerance} from '../../state/user/hooks'
import {TYPE} from '../../theme'
import {calculateGasMargin, getPylonRouterContract} from '../../utils'
import {maxAmountSpend} from '../../utils/maxAmountSpend'
import {wrappedCurrency} from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import {Dots, Wrapper} from '../Pool/styleds'
import {ConfirmAddModalBottom} from './ConfirmAddModalBottom'
import {currencyId} from '../../utils/currencyId'
// import { PoolPriceBar } from './PoolPriceBar'
// import { ArrowDown } from 'react-feather'

export default function AddLiquidityPro({
                                          match: {
                                            params: { currencyIdA, currencyIdB }
                                          },
                                          history
                                        }: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const oneCurrencyIsWDEV = Boolean(
      chainId &&
      ((currencyA && currencyEquals(currencyA, WDEV[chainId])) ||
          (currencyB && currencyEquals(currencyB, WDEV[chainId])))
  )

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const expertMode = useIsExpertMode()

  // mint state
  const [sync, setSync] = useState('off');

  const { independentField, typedValue, otherTypedValue } = useMintState()
  const [isFloat, setIsFloat] = useState(true)

  const {
    dependentField,
    currencies,
    pylonPair,
    pylonState,
    currencyBalances,
    parsedAmounts,
    price,
    noPylon,
    liquidityMinted,
    //poolTokenPercentage,
    error
  } = useDerivedPylonMintInfo(currencyA ?? undefined, currencyB ?? undefined, isFloat, sync)
  const [float, setFloat] = useState({
    currency_a: currencies[Field.CURRENCY_A],
    field_a: Field.CURRENCY_A,
    currency_b: currencies[Field.CURRENCY_B],
    field_b: Field.CURRENCY_B,
  });
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noPylon)
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const [deadline] = useUserDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noPylon ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
      (accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxAmountSpend(currencyBalances[field])
        }
      },
      {}
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
      (accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
        }
      },
      {}
  )

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
      parsedAmounts[Field.CURRENCY_A],
      PYLON_ROUTER_ADDRESS[chainId ? chainId : '']
  )
  const [approvalB, approveBCallback] = useApproveCallback(
      parsedAmounts[Field.CURRENCY_B],
      PYLON_ROUTER_ADDRESS[chainId ? chainId : '']
  )

  const addTransaction = useTransactionAdder()
  async function addPylon() {
    if (!chainId || !library || !account) return
    const pylonRouter = getPylonRouterContract(chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return
    }
    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noPylon ? 0 : allowedSlippage)[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noPylon ? 0 : allowedSlippage)[0]
    // }
    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline
    let estimate,
        method: (...args: any) => Promise<TransactionResponse>,
        args: Array<string | string[] | number | boolean>,
        value: BigNumber | null

    if (currencyA === DEV || currencyB === DEV) {
      const tokenBIsETH = currencyB === DEV
      estimate = pylonRouter.estimateGas.initETH
      method = pylonRouter.initETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        currencyA === DEV,
        account,
        deadlineFromNow
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = pylonRouter.estimateGas.init
      method = pylonRouter.init
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        account,
        deadlineFromNow
      ]
      value = null
    }

    setAttemptingTxn(true)
    await estimate(...args, value ? { value } : {})
        .then(estimatedGasLimit =>
            method(...args, {
              ...(value ? { value } : {}),
              gasLimit: calculateGasMargin(estimatedGasLimit)
            }).then(response => {
              setAttemptingTxn(false)
              addTransaction(response, {
                summary:
                    'Creating ' +
                    parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                    ' ' +
                    currencies[Field.CURRENCY_A]?.symbol +
                    ' and ' +
                    parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                    ' ' +
                    currencies[Field.CURRENCY_B]?.symbol +
                    ' pylon'
              })

              setTxHash(response.hash)

              ReactGA.event({
                category: 'Creation',
                action: 'Create Pair',
                label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/')
              })
            })
        )
        .catch(error => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error)
          }
        })
  }

  async function onAdd() {
    if (!chainId || !library || !account) return
    const router = getPylonRouterContract(chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return
    }

    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noPylon ? 0 : allowedSlippage)[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noPylon ? 0 : allowedSlippage)[0]
    // }

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    let estimate,
        method: (...args: any) => Promise<TransactionResponse>,
        args: Array<string | string[] | number | boolean>,
        value: BigNumber | null
    const tokenBIsETH = float.currency_b === DEV
    if (sync === "off") {
      if (float.currency_a === DEV) {
        estimate = router.estimateGas.addSyncLiquidityETH
        method = router.addSyncLiquidityETH
        args = [
          wrappedCurrency(tokenBIsETH ? float.currency_a : float.currency_b, chainId)?.address ?? '', // token
          DEV === currencies[Field.CURRENCY_A],// second option is anchor so it should mint anchor when float.currency a is equal to b
          float.currency_a === currencies[Field.CURRENCY_B],
          account,
          deadlineFromNow
        ]
        value = !tokenBIsETH ? BigNumber.from(( float.currency_a === currencies[Field.CURRENCY_A] ? parsedAmountA : parsedAmountB).raw.toString()) : BigNumber.from("0")
      } else {
        estimate = router.estimateGas.addSyncLiquidity
        method = router.addSyncLiquidity
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? '',
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? '',
          (float.currency_a === currencies[Field.CURRENCY_A] ? parsedAmountA : parsedAmountB).raw.toString(),
          float.currency_a === currencies[Field.CURRENCY_B],
          account,
          deadlineFromNow
        ]
        value = null
      }
    }else if (sync === "full") {
      if (float.currency_a === DEV) {
        estimate = router.estimateGas.addAsyncLiquidity100ETH
        method = router.addAsyncLiquidity100ETH
        args = [
          wrappedCurrency(tokenBIsETH ? float.currency_a : float.currency_b, chainId)?.address ?? '', // token
          DEV === currencies[Field.CURRENCY_A],// second option is anchor so it should mint anchor when float.currency a is equal to b
          float.currency_a === currencies[Field.CURRENCY_B],// second option is anchor so it should mint anchor when float.currency a is equal to b
          account,
          deadlineFromNow
        ]
        value = !tokenBIsETH ? BigNumber.from(( float.currency_a === currencies[Field.CURRENCY_A] ? parsedAmountA : parsedAmountB).raw.toString()) : BigNumber.from("0")
      } else {
        estimate = router.estimateGas.addAsyncLiquidity100
        method = router.addAsyncLiquidity100
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? '',
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? '',
          (float.currency_a === currencies[Field.CURRENCY_A] ? parsedAmountA : parsedAmountB).raw.toString(),
          float.currency_a === currencies[Field.CURRENCY_B],
          account,
          deadlineFromNow
        ]
        value = null
      }
    }else {
      if (float.currency_a === DEV || float.currency_b === DEV) {
        estimate = router.estimateGas.addAsyncLiquidityETH
        method = router.addAsyncLiquidityETH
        console.log(tokenBIsETH ? float.currency_a?.name : float.currency_b?.name)
        args = [
          wrappedCurrency(tokenBIsETH ? float.currency_a : float.currency_b, chainId)?.address ?? '', // token
          (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(),
          '1',
          '1',
          currencies[Field.CURRENCY_A] === DEV,
          float.currency_a === currencies[Field.CURRENCY_B],// second option is anchor so it should mint anchor when float.currency a is equal to b
          account,
          deadlineFromNow
        ]
        value = BigNumber.from(( tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
      } else {
        estimate = router.estimateGas.addAsyncLiquidity
        method = router.addAsyncLiquidity
        console.log("one", currencies[Field.CURRENCY_A]?.name)
        console.log("two", currencies[Field.CURRENCY_B]?.name)
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? '',
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? '',
          (float.currency_a === currencies[Field.CURRENCY_A] ? parsedAmountA : parsedAmountB).raw.toString(),
          (float.currency_a === currencies[Field.CURRENCY_A] ? parsedAmountB : parsedAmountA).raw.toString(),
          '1',
          '1',
          float.currency_a === currencies[Field.CURRENCY_B],
          account,
          deadlineFromNow
        ]
        value = null
      }
    }


    setAttemptingTxn(true)
    await estimate(...args, value ? { value } : {})
        .then(estimatedGasLimit =>
            method(...args, {
              ...(value ? { value } : {}),
              gasLimit: calculateGasMargin(estimatedGasLimit)
            }).then(response => {
              setAttemptingTxn(false)
              if (sync === "half") {
                addTransaction(response, {
                  summary:
                      'Add ' +
                      parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                      ' ' +
                      currencies[Field.CURRENCY_A]?.symbol +
                      ' and ' +
                      parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                      ' ' +
                      currencies[Field.CURRENCY_B]?.symbol

                })
              }else{
                addTransaction(response, {
                  summary:
                      sync === "off" ? 'Add sync ' : 'Add Async-100' +
                      isFloat ? (parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                          ' ' +
                          currencies[Field.CURRENCY_A]?.symbol)  : (
                          parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                          ' ' +
                          currencies[Field.CURRENCY_B]?.symbol)


                })
              }


              setTxHash(response.hash)

              ReactGA.event({
                category: 'Liquidity',
                action: 'Add',
                label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/')
              })
            })
        )
        .catch(error => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error)
          }
        })
  }

  const modalHeader = () => {
    return noPylon ? (
        <AutoColumn gap="20px">
          <LightCard mt="20px" borderRadius="27px" style={{backgroundColor: theme.bg14}}>
            <RowFlat style={{flexFlow: 'column', alignItems: 'center'}}>
              <Text fontSize="48px" fontWeight={300} lineHeight="42px" marginRight={10}>
                {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
              </Text>
              <div style={{margin: '20px auto auto auto'}}>
                <DoubleCurrencyLogo
                    currency0={currencies[Field.CURRENCY_A]}
                    currency1={currencies[Field.CURRENCY_B]}
                    size={30}
                />
              </div>

            </RowFlat>
          </LightCard>
        </AutoColumn>
    ) : (
        <AutoColumn gap="20px">
          <RowFlat style={{ marginTop: '20px', display: 'flex', flexFlow: 'column', backgroundColor: theme.bg14, borderRadius: '20px', padding: '20px 10px' }}>
            <Text fontSize="45px" fontWeight={300} lineHeight="42px" width={'100%'}>
              {liquidityMinted?.toSignificant(6)}
            </Text>
            <Text fontSize="16px" width={'100%'} marginTop={15} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
              <DoubleCurrencyLogo
                  currency0={currencies[Field.CURRENCY_A]}
                  currency1={currencies[Field.CURRENCY_B]}
                  size={30}
              />
            </Text>
          </RowFlat>
          <TYPE.italic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
            {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
          </TYPE.italic>
        </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
        <ConfirmAddModalBottom
            price={price}
            currencies={currencies}
            parsedAmounts={parsedAmounts}
            pylonState={pylonState}
            onAdd={() => pylonState === PylonState.EXISTS ? onAdd() : addPylon()}
            //poolTokenPercentage={poolTokenPercentage}
            isFloat={isFloat}
            sync={sync}
        />
    )
  }

  function pendingText() : string {
    if (sync === "half" || pylonState !== PylonState.EXISTS) {
      return `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
          currencies[Field.CURRENCY_A]?.symbol
      } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`
    } else {
      return `Supplying ${parsedAmounts[ isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.toSignificant(6)} ${
          currencies[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.symbol
      }`
    }
  }

  const handleCurrencyASelect = useCallback(
      (currencyA: Currency) => {
        const newCurrencyIdA = currencyId(currencyA)
        if (newCurrencyIdA === currencyIdB) {
          history.push(`/add-pro/${currencyIdB}/${currencyIdA}`)
        } else {
          history.push(`/add-pro/${newCurrencyIdA}/${currencyIdB}`)
        }
      },
      [currencyIdB, history, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
      (currencyB: Currency) => {
        const newCurrencyIdB = currencyId(currencyB)
        if (currencyIdA === newCurrencyIdB) {
          if (currencyIdB) {
            history.push(`/add-pro/${currencyIdB}/${newCurrencyIdB}`)
          } else {
            history.push(`/add-pro/${newCurrencyIdB}`)
          }
        } else {
          history.push(`/add-pro/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
        }
      },
      [currencyIdA, history, currencyIdB]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])



  return (
      <>
        <AppBody>
          <AddRemoveTabs adding={true} />
          <Wrapper>
            <TransactionConfirmationModal
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                    <ConfirmationModalContent
                        title={pylonState === PylonState.EXISTS ? 'You will receive' : pylonState === PylonState.ONLY_PAIR ? 'You are creating a pylon' : 'You are creating a pair and a pylon'}
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={modalBottom}
                    />
                )}
                pendingText={pendingText()}
            />
            <AutoColumn gap="20px" style={{backgroundColor: theme.bg1, padding: '10px', borderRadius: '20px'}}>

              {/* Pylon condition, previously noPylon && */}

              {!pylonPair && (
                  <ColumnCenter>
                    <BlueCard>
                      <AutoColumn gap="10px">
                        <TYPE.link fontWeight={500} color={'primaryText1'}>
                          You are the first liquidity provider.
                        </TYPE.link>
                        <TYPE.link fontWeight={400} color={'primaryText1'}>
                          This will create the Pylon for this pair
                        </TYPE.link>
                        <TYPE.link fontWeight={400} color={'primaryText1'}>
                          Once you are happy with the pair click 'Create pair' to review.
                        </TYPE.link>
                      </AutoColumn>
                    </BlueCard>
                  </ColumnCenter>
              )}

              {/* Condition that triggers pylov view */}

              <div style={{display: 'flex', border: '1px solid #402D58', borderRadius: '17px'}}>
                <CurrencyInputPanelInputOnly
                    onCurrencySelect={handleCurrencyASelect}
                    currency={currencies[Field.CURRENCY_A]} id="add-liquidity-input-tokena" showCommonBases
                    anchor={false} />
                <CurrencyInputPanelInputOnly
                    onCurrencySelect={handleCurrencyBSelect}
                    currency={currencies[Field.CURRENCY_B]} id="add-liquidity-input-tokenb_bal" showCommonBases
                    anchor={true} />
              </div>

              {/* Condition that triggers pylov view */}

              {currencies[Field.CURRENCY_B] !== undefined ? (
                  <div style={{backgroundColor: theme.bg10, padding: '10px', borderRadius: '27px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-evenly', marginBottom: '10px'}}>
                <span style={{display: 'inline', alignSelf: 'center', fontSize: '16px'}}>

                  {/* Pylon condition */}
                  {pylonState === PylonState.EXISTS ? 'Token used for investment' : pylonState === PylonState.ONLY_PAIR ? 'Create Pylon' :'Create Pair & Pylon'}

                </span>
                      {pylonState === PylonState.EXISTS && <div style={{display: 'flex', border: `1px solid ${theme.bg11}`, borderRadius: '17px', padding: '5px'}}>
                        <ButtonAnchor borderRadius={'12px'} padding={'5px 8px 5px 8px'}
                                      style={{backgroundColor: float.currency_a === currencies[Field.CURRENCY_A] ? theme.bg11 : 'transparent'}}
                                      onClick={()=> {
                                        setIsFloat(true)
                                        setFloat({
                                          currency_a: currencies[Field.CURRENCY_A],field_a: Field.CURRENCY_A,
                                          currency_b: currencies[Field.CURRENCY_B],field_b: Field.CURRENCY_B
                                        })}}>
                          <CurrencyInputPanelPicOnly
                              currency={currencies[Field.CURRENCY_A]} id="add-liquidity-input-tokena_pic" showCommonBases />
                          <span style={{marginLeft: '5px'}}>{'FLOAT'}</span>
                        </ButtonAnchor>

                        <ButtonAnchor borderRadius={'12px'} padding={'5px 8px 5px 8px'}
                                      style={{backgroundColor: float.currency_a === currencies[Field.CURRENCY_B] ? theme.bg11 : 'transparent'}}
                                      onClick={()=> {
                                        setIsFloat(false)
                                        setFloat({
                                          currency_b: currencies[Field.CURRENCY_A],field_b: Field.CURRENCY_A,
                                          currency_a: currencies[Field.CURRENCY_B],field_a: Field.CURRENCY_B
                                        })}}>
                          <CurrencyInputPanelPicOnly
                              currency={currencies[Field.CURRENCY_B]} id="add-liquidity-input-tokenb_pic" showCommonBases />
                          <span style={{marginLeft: '5px'}}>{'ANCHOR'}</span>
                        </ButtonAnchor>
                      </div>}
                    </div>

                    {/* Pylon condition  */}

                    <div style={{display: 'grid', gridGap: '10px'}}>
                      <CurrencyInputPanelBalOnly
                          value={ formattedAmounts[float.field_a] }
                          onUserInput={float.field_a === Field.CURRENCY_A ? onFieldAInput : onFieldBInput}
                          onMax={() => {
                            onFieldAInput(maxAmounts[float.field_a]?.toExact() ?? '')
                          }}
                          onCurrencySelect={handleCurrencyASelect}
                          showMaxButton={!atMaxAmounts[float.field_a]}
                          currency={currencies[float.field_a]}
                          id="add-liquidity-input-tokena_bal"
                          showCommonBases
                          isFloat={false}
                          sync={sync}
                      />
                      {sync === 'half' || pylonState !== PylonState.EXISTS ? (
                          <CurrencyInputPanelBalOnly
                              value={ formattedAmounts[float.field_b] }
                              onUserInput={onFieldBInput}
                              onCurrencySelect={handleCurrencyBSelect}
                              onMax={() => {
                                onFieldBInput(maxAmounts[float.field_b as Field]?.toExact() ?? '')
                              }}
                              showMaxButton={!atMaxAmounts[float.field_b as Field]}
                              currency={currencies[float.field_b as Field]}
                              id="add-liquidity-input-tokenb_bal"
                              showCommonBases
                              isFloat={true}
                              sync={sync}
                              exists={(pylonState === PylonState.EXISTS)}
                          />) : null}
                    </div>
                  </div>
              ) : null}

              {/* Pylon condition */}

              {currencies[Field.CURRENCY_B] !== undefined && pylonState === PylonState.EXISTS && (
                  <div style={{display: 'flex', border: '1px solid #402D58', borderRadius: '17px', justifyContent: 'space-between'}}>
                    <span style={{display: 'inline', alignSelf: 'center', fontSize: '16px', margin: 'auto'}}>{'ADVANCED MODE'}</span>
                    <div style={{display: 'flex', borderLeft: `1px solid ${theme.bg9}`, borderRadius: '17px', padding: '5px'}}>

                      <ButtonAnchor borderRadius={'12px'} padding={'10px'}
                                    style={{backgroundColor: sync === 'off' ? theme.bg9 : 'transparent'}}
                                    onClick={()=> {setSync('off')}}>
                        OFF
                      </ButtonAnchor>
                      <ButtonAnchor borderRadius={'12px'} padding={'10px'}
                                    style={{backgroundColor: sync === 'full' ? theme.bg9 : 'transparent'}}
                                    onClick={()=> {setSync('full')}}>
                        100% Async
                      </ButtonAnchor>
                      <ButtonAnchor borderRadius={'12px'} padding={'10px'}
                                    style={{backgroundColor: sync === 'half' ? theme.bg9 : 'transparent'}}
                                    onClick={()=> {
                                      setSync('half')
                                      setFloat({
                                        currency_a: currencies[Field.CURRENCY_A],field_a: Field.CURRENCY_A,
                                        currency_b: currencies[Field.CURRENCY_B],field_b: Field.CURRENCY_B
                                      })
                                    }}>
                        50/50 Async
                      </ButtonAnchor>
                    </div>
                  </div>)}

            </AutoColumn>
            {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pylonState !== PylonState.INVALID && (
                <>
                  <GreyCard padding="0.5rem" borderRadius={'20px'} style={{backgroundColor: 'transparent'}}>
                    {/* <RowBetween padding="1rem">
                    <TYPE.subHeader fontWeight={500} fontSize={14}>
                      {noPylon ? 'Initial prices' : 'Prices'} and pool share
                    </TYPE.subHeader>
                  </RowBetween>{' '} */}
                    <LightCard padding="0" borderRadius={'20px'} style={{marginTop: '10px', border: 'none'}} >
                      {/* <div style={{padding: '1rem'}}>
                      <PoolPriceBar
                        currencies={currencies}
                        poolTokenPercentage={poolTokenPercentage}
                        noLiquidity={noPylon}
                        price={price}
                      />
                    </div> */}

                      {!account ? (
                          <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                      ) : (
                          <AutoColumn gap={'md'}>
                            {(approvalA === ApprovalState.NOT_APPROVED ||
                                approvalA === ApprovalState.PENDING ||
                                approvalB === ApprovalState.NOT_APPROVED ||
                                approvalB === ApprovalState.PENDING) &&
                            isValid && (
                                <RowBetween>
                                  {approvalA !== ApprovalState.APPROVED && (
                                      <ButtonPrimary
                                          onClick={approveACallback}
                                          disabled={approvalA === ApprovalState.PENDING}
                                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                                      >
                                        {approvalA === ApprovalState.PENDING ? (
                                            <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                                        ) : (
                                            'Approve ' + currencies[Field.CURRENCY_A]?.symbol
                                        )}
                                      </ButtonPrimary>
                                  )}
                                  {approvalB !== ApprovalState.APPROVED && (
                                      <ButtonPrimary
                                          onClick={approveBCallback}
                                          disabled={approvalB === ApprovalState.PENDING}
                                          width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                                      >
                                        {approvalB === ApprovalState.PENDING ? (
                                            <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                                        ) : (
                                            'Approve ' + currencies[Field.CURRENCY_B]?.symbol
                                        )}
                                      </ButtonPrimary>
                                  )}
                                </RowBetween>
                            )}
                            <ButtonError
                                onClick={() => {
                                  expertMode ? onAdd() : setShowConfirm(true)
                                }}
                                disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                                error={ sync === 'half' && (!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]) }
                            >
                              <Text fontSize={20} fontWeight={500}>
                                {error ?? (pylonState === PylonState.EXISTS ? "Add Liquidity" :pylonState === PylonState.ONLY_PAIR ? 'Create Pylon' :'Create Pair & Pylon')}
                              </Text>
                            </ButtonError>
                          </AutoColumn>
                      )}
                    </LightCard>
                  </GreyCard>
                </>
            )}
            {/* {currencies[Field.CURRENCY_B] !== undefined && (
              <ColumnCenter style={{width: '60%', margin: 'auto'}}>
                <div style={{margin: '20px 0', textAlign: 'center'}}>
                  <Text>{"There's no Pylon for this pair yet."}</Text>
                  <Text>{"Click the button below to create it"}</Text>
                </div>
                <ArrowDown strokeWidth={1} size={30} />
                <ButtonPrimary width={'80%'} padding={'20px'} style={{margin: '25px 0'}} as={Link}
                  to={`/add_pylon/${currencyIdA}/${currencyIdB}`} > {'Create a Pylon'} </ButtonPrimary>
              </ColumnCenter>
            )} */}



          </Wrapper>
        </AppBody>
        {/* <ButtonPrimary
        style={{backgroundColor: theme.bg1,
        color: theme.primaryText1,
        width: '470px',
        border: `1px solid ${theme.bg7}`,
        marginTop: '10px',
        height: '40px',
        borderRadius: '17px',
        padding: '12px 0 12px 0',
        }}
        as={Link}
        to="/add/ETH"
        >
        Classic Liquidity <ArrowRight strokeWidth={1} style={{marginLeft:'10px'}} />
      </ButtonPrimary> */}
        {pylonPair && !noPylon && pylonState !== PylonState.INVALID ? (
            <AutoColumn style={{ minWidth: '20rem', marginTop: '1rem' }}>
              <MinimalPositionPylonCard showUnwrapped={oneCurrencyIsWDEV} pylon={pylonPair} isFloat={isFloat} />
            </AutoColumn>
        ) : null}
      </>
  )
}
