import { CurrencyAmount, JSBI, NATIVE_TOKEN, Token, Trade } from 'zircon-sdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga4'
import { Flex, Text } from 'rebass'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Card from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
// import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'
import Settings from '../../components/Settings'
import orderBy from 'lodash/orderBy'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { useActiveWeb3React, useWindowDimensions } from '../../hooks'
import { getTopTokens, useAllTokens, useBlocksSubgraphUrl, useCurrency, useSubgraphUrl } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSingleTokenSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useChosenTokens, useExpertModeManager, useUserDeadline, useUserSlippageTolerance } from '../../state/user/hooks'
import { LinkButtonHidden, LinkButtonLeftSide } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import Loader from '../../components/Loader'
import LearnIcon from '../../components/LearnIcon'
import PriceChartContainer from '../../components/Chart/PriceChartContainer'
import NoChartAvailable from '../../components/Chart/NoChartAvailable'
import { usePairPrices } from '../../state/mint/pylonHooks'
import { usePair } from '../../data/Reserves'
import { SelectedOptionDiv } from '../../views/Farms/Farms'
import { TableData } from '../../views/Farms/components/FarmTable/Row'
import FarmRepeatIcon from '../../components/FarmRepeatIcon'
import { Row, SkeletonTable, StarFull, TopTokensRow } from '../../components/TopTokensRow'
import FavTokensRow from '../../components/FavouriteTokensRow'
import { Separator } from '../../components/SearchModal/styleds'
import { usePools } from '../../state/pools/hooks'
import { Skeleton } from '@pancakeswap/uikit'
import { wrappedCurrency } from '../../utils/wrappedCurrency'

export default function Swap() {
  const {pools} = usePools()
  const { t } = useTranslation()
  const loadedUrlParams = useDefaultsFromURLSearch()
  const allTokens = useAllTokens()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const skeletons = 5;
  const { account, chainId } = useActiveWeb3React()
  const theme = useTheme()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [deadline] = useUserDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId}
   } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const [chosenTokens] = useChosenTokens();
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const trade = showWrap
    ? undefined
    : {
        [Version.v2]: v2Trade
      }[toggledVersion]

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    onCurrencySelection(Field.INPUT, NATIVE_TOKEN[chainId])
  }, [])

  const subgraphUrl = useSubgraphUrl()
  const blockSubgraphUrl = useBlocksSubgraphUrl()
  const [derivedETH, setDerivedETH] = useState(null)
  const [oneDayDerivedETH, setOneDayDerivedETH] = useState(null)

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted, chainId, subgraphUrl])

  useEffect(() => {
    getTopTokens(chainId, subgraphUrl, blockSubgraphUrl).then((res) => {
      setTopTokens(res.query)
      setTopTokensPrevious(res.oneDayAgoQueryData)
      setDerivedETH(res.derivedEthQueryData)
      setOneDayDerivedETH(res.oneDayAgoDerivedEthQueryData)
    }).catch((err) => {
      console.log('error fetching top tokens', err)
    })
  }, [chainId, subgraphUrl, blockSubgraphUrl])

  

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(chainId, currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    deadline,
    recipient
  )

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(chainId, trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol].join('/')
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !(chainId === 1285 || chainId === 1287) && (
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode))

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const { width } = useWindowDimensions();

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])
  const [isChartExpanded, setIsChartExpanded] = useState(false)
  const [isChartDisplayed] = useState(true)

  const singleTokenPrice = useSingleTokenSwapInfo(chainId, inputCurrencyId, inputCurrency, outputCurrencyId, outputCurrency)

  const [pairState,pair] = usePair(currencies[Field.INPUT], currencies[Field.OUTPUT])
  const prices = usePairPrices(wrappedCurrency(currencies[Field.INPUT], chainId)?.address, wrappedCurrency(currencies[Field.OUTPUT], chainId)?.address, 
  pair, pairState, chainId)

  //Top tokens
  const [topTokens, setTopTokens] = useState([])
  const [topTokensPrevious, setTopTokensPrevious] = useState([])
  const options = ['Price', 'Price change 24H', 'Volume 24H', 'TVL']
  const [sortOption, setSortOption] = useState('volume 24h')

  const sortTokens = (sortOption: string, tokensToSort: any[]) => {
    switch (sortOption) {
      case 'price':
        return orderBy(tokensToSort, (token: any) => parseFloat(token.derivedETH) * parseFloat(derivedETH) ?? 0, 'desc')
      case 'price change 24h':
          return orderBy(tokensToSort, (token: any) => {
          const previousToken = topTokensPrevious.find((t) => t.id === token.id)
          const changePercent = ((((parseFloat(token?.derivedETH) * parseFloat(derivedETH)) - (parseFloat(previousToken?.derivedETH) * parseFloat(oneDayDerivedETH))) / 
          (parseFloat(previousToken?.derivedETH) * parseFloat(oneDayDerivedETH))) * 100).toFixed(2)
          return changePercent !== 'NaN' ? parseFloat(changePercent) : parseFloat('-100')
        }, 'desc')
      case 'volume 24h':
        return orderBy(tokensToSort, (token: any) => {
          const previousToken = topTokensPrevious.find((t) => t?.id === token?.id)
          return (parseFloat(token?.tradeVolumeUSD) - parseFloat(previousToken?.tradeVolumeUSD))
        } , 'desc')
      case 'tvl':
        return orderBy(tokensToSort, (token: any) => {
          return (parseFloat(token?.totalLiquidity) * parseFloat(derivedETH) * (parseFloat(token?.derivedETH)))
        } , 'desc')
      default:
        return tokensToSort
    }
  }

  const sortedTokens = useMemo(() => sortTokens(sortOption, topTokens), [sortOption, topTokens])

  return (
    <>
    <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '20px'}}>
    { width > 1000 && (
    <div style={{
      height: '423px',
      position: 'relative',
      maxWidth: '480px',
      width: '100%',
      background: theme.bg1,
      borderRadius: '27px',
      }}>
      <AutoColumn gap={'md'} style={{backgroundColor: theme.bg1, borderRadius: '27px', padding: '0px', height: '100%', width: '100%'}}>
        <div style={{alignSelf: 'center'}}>
        { outputCurrency ? (
            <PriceChartContainer
                inputCurrencyId={inputCurrencyId === NATIVE_TOKEN[chainId].symbol ? chainId === 1285 ? '0x98878b06940ae243284ca214f92bb71a2b032b8a' : 
                 '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' : inputCurrencyId}
                inputCurrency={currencies[Field.INPUT]}
                outputCurrencyId={outputCurrencyId === NATIVE_TOKEN[chainId].symbol ? chainId === 1285 ? '0x98878b06940ae243284ca214f92bb71a2b032b8a' : 
                 '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' : outputCurrencyId}
                outputCurrency={currencies[Field.OUTPUT]}
                isChartExpanded={isChartExpanded}
                setIsChartExpanded={setIsChartExpanded}
                isChartDisplayed={isChartDisplayed}
                currentSwapPrice={singleTokenPrice}
                isMobile={false}
            />
        ) : (
          <NoChartAvailable hasOutputToken={false} hasLiquidity={true} />

        )}
        </div>
          </AutoColumn>
        </div>
        )}

      <AppBody>

      {/* <SwapPoolTabs active={'swap'} /> */}
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />

        <div>
        <div style={{display: 'flex', padding: '11px 25px', justifyContent: 'space-between'}}>
        <p>{'Swap'}</p>
        <Settings />
        </div>

        <Wrapper id="swap-page" style={{marginTop: !account && (outputCurrency === undefined ? '42px' : '52px')}}>
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            outputCurrency={outputCurrencyId}
          />


          <AutoColumn gap={'md'} style={{borderRadius: '27px', padding: '10px'}}>
            <CurrencyInputPanel
              label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
              price={ prices[0] ?? undefined }
            />
            <AutoColumn>
              <AutoRow justify={isExpertMode ? recipient === null ? 'space-between' : 'center' : 'center'} style={{ padding: '0 1rem'}}>
                { recipient === null && isExpertMode && (<LinkButtonHidden>
                    + Add a send (optional)
                  </LinkButtonHidden>)}
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="24"
                    strokeWidth={1}
                    stroke={'#FFF'}
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                    style={{alignSelf: 'center'}}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  />
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <LinkButtonLeftSide id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkButtonLeftSide>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)a' : 'To'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
              price={prices[1] ?? undefined}
            />

            {recipient !== null && !showWrap && isExpertMode && (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                    <LinkButtonHidden>
                    - Remove send
                  </LinkButtonHidden>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="24"
                    strokeWidth={1}
                    stroke={'#FFF'}
                    style={{alignSelf: 'center'}}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2} />
                  </ArrowWrapper>
                  <LinkButtonLeftSide id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkButtonLeftSide>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            )}

            {!showWrap && currencies[Field.OUTPUT] !== undefined && formattedAmounts[Field.INPUT] && formattedAmounts[Field.OUTPUT] ?  (
              <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                <AutoColumn gap="4px">
                  {Boolean(trade) && (
                    <RowBetween align="center">
                      <Text fontWeight={400} fontSize={14} color={theme.text2}>
                        {t('price')}
                      </Text>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowBetween>
                  )}
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <ClickableText fontWeight={400} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        Slippage Tolerance
                      </ClickableText>
                      <ClickableText fontWeight={400} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                        {allowedSlippage / 100}%
                      </ClickableText>
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            ) : <div style={{height: (!account && outputCurrency !== undefined) ? '46px' : '26px'}}></div>}
          </AutoColumn>
          <BottomGrouping style={{marginTop: '0'}}>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : showWrap ? (
              <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </ButtonPrimary>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <ButtonPrimary disabled>
                {t('insufficientLiquidityForThisTrade')}
              </ButtonPrimary>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      })
                    }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={
                    !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  error={isValid && priceImpactSeverity > 2}
                >
                  <Text fontSize={16} fontWeight={400}>
                    {priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <Text fontSize={18} fontWeight={400}>
                  {swapInputError
                    ? swapInputError
                    : priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact Too High`
                    : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                </Text>
              </ButtonError>
            )}
            {showApproveFlow && <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </BottomGrouping>
        </Wrapper>
        </div>
        {formattedAmounts[Field.INPUT] && formattedAmounts[Field.OUTPUT] && (<AdvancedSwapDetailsDropdown trade={trade} />)}
      </AppBody>
    </div>

    {/* // User chosen tokens */}    
    {chosenTokens?.filter((token) => Object.keys(allTokens).map((token) => token.toLowerCase()).includes(token.toLowerCase())).length > 0 && (
      <Flex style={{width: '985px', background: theme.bg1, borderRadius: '17px', marginTop: '20px', display: width > 992 ? 'flex' : 'none'}}>
        <Flex mt='auto' mb="auto" ml='20px'>
            <StarFull />
          </Flex>
        <Flex id='user-chosen-tokens' style={{width: '100%', padding: '20px', flexWrap: 'wrap', gap: '25px 5px'}}>
          {chosenTokens?.map((token, index) => {
          return(
            <FavTokensRow key={index} token={token} index={index} topTokens={topTokens} topTokensPrevious={topTokensPrevious}
            handleSwap={handleInputSelect} derivedETH={derivedETH} oneDayDerivedETH={oneDayDerivedETH} />
          )})}
        </Flex>
      </Flex>
      )}

    <Flex style={{width: '985px', background: theme.bg1, borderRadius: '17px', marginTop: '20px', display: width > 992 ? 'flex' : 'none'}}>
    <table
      style={{
        width: "100%",
        borderBottom: `1px solid ${theme.opacitySmall}`,
        padding: '5px'
      }}
    ><tr style={{display: 'flex', height: '40px'}}>
      <Flex style={{width: '35%', alignItems: 'center'}}><Text mx="10px">{'Top tokens'}</Text><FarmRepeatIcon /></Flex>
          {options.map((option) => (
            <TableData
              key={option}
              style={{
                cursor:"pointer",
                width: '15%',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                flexFlow: 'column',
              }}
              onClick={() => {
                  sortOption === option.toLowerCase()
                    ? setSortOption("hot")
                    : setSortOption(option.toLowerCase());
              }}
            ><Flex style={{marginTop: '10px'}}>
                <p
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: "13px",
                    color: !theme.darkMode ? theme.poolPinkButton : theme.meatPink,
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {option}
                </p><FarmRepeatIcon /></Flex>
              {sortOption === option.toLowerCase() ? (
                <SelectedOptionDiv style={{position: 'relative', top: '9px', width: '80%', left: '0px'}} />
              ) : null}
            </TableData>
          ))}
          <TableData style={{cursor:"pointer", width: '10%'}} />
        </tr>
        <Separator />
        {topTokens?.length === 0 ? [...Array(skeletons)].map(() => (
          <Flex style={{width: '100%', margin: 'auto'}} flexDirection='column'>
            <Row>
              <SkeletonTable style={{width: '35%', marginLeft: '30px'}}><Skeleton width={'80%'} /></SkeletonTable>
              <SkeletonTable style={{width: '15%'}}><Skeleton width={'90%'} /></SkeletonTable>
              <SkeletonTable style={{width: '15%'}}><Skeleton width={'90%'} /></SkeletonTable>
              <SkeletonTable style={{width: '15%'}}><Skeleton width={'90%'} /></SkeletonTable>
              <SkeletonTable style={{width: '15%'}}><Skeleton width={'90%'} /></SkeletonTable>
              <SkeletonTable style={{width: '10%'}}></SkeletonTable>
            </Row>
          </Flex>
        )) : topTokens !== undefined && (
        (topTokensPrevious.length > 0 && topTokens.length > 0 && sortedTokens.length > 0) && sortedTokens.map((token, index) => (
          <TopTokensRow
            key={index}
            token={token}
            previousToken={topTokensPrevious.find((t) => t.id === token.id)}
            derivedETH={derivedETH}
            oneDayDerivedETH={oneDayDerivedETH}
            index={index}
            handleInput={handleInputSelect}
            tokens={topTokens}
            pools={pools} />
        )))}
      </table>
    </Flex>
    <LearnIcon />
    </>
  )
}
