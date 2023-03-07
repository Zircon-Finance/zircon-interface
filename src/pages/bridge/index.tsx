import React, { useCallback, useEffect, useState } from 'react'
import { AutoRow } from '../../components/Row'
import { useMultichainCurrencyBalance } from '../../state/wallet/hooks'
import { ethers } from 'ethers'
import { useActiveWeb3React } from '../../hooks'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import { useTransactionAdder } from '../../state/transactions/hooks'
import Settings from '../../components/Settings'
import { Flex, Text } from 'rebass'
import { useAnyswapRouterContract } from '../../hooks/useContract'
import { ChainId, Token, TokenAmount } from 'zircon-sdk'
import { formatNumberNew } from '../../utils/formatBalance'
import AppBody from '../AppBody'
import styled, { useTheme } from 'styled-components'
import MoonriverLogo from '../../components/MoonriverLogo'
import BnbLogo from '../../components/BnbLogo'
import ArbitrumLogo from '../../components/ArbitrumLogo'
import { Input as NumericalInput } from '../../components/NumericalInput'
import { ZRG_ADDRESSES } from '../../constants'
import { MaxUint256 } from '@ethersproject/constants'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ButtonPrimary } from '../../components/Button'

type AnyswapResultChainInfo = {
  address: string
  name: string
  symbol: string
  decimals: number
  anyToken: TokenInfo
  fromAnyToken: TokenInfo & { chainId: number }
  underlying: boolean
  type: string
  router: string
  tokenid: string
  routerABI: string[]
  isLiquidity: boolean
  isApprove: boolean
  isFromLiquidity: boolean
  spender: string
  BigValueThreshold: string
  MaximumSwap: string
  MaximumSwapFee: string
  MinimumSwap: string
  MinimumSwapFee: string
  SwapFeeRatePerMillion: number
  pairid: string
  DepositAddress: string
  BaseFeePercent: string
  sortId: number
  tokenType: string
  chainId: string
}

type TokenInfo = {
  address: string
  name: string
  symbol: string
  decimals: number
}

type AvailableChainsInfo = {
  chainId: string
  address: string
  name: string
  symbol: string
  decimals: number
  price: number
  logoUrl: string[]
  tokenType: string
  destChains: AnyswapTokensMap
}

const base = {
  address: '',
  name: '',
  symbol: '',
  decimals: 0,
  BigValueThreshold: '',
  MaximumSwap: '',
  MaximumSwapFee: '',
  MinimumSwap: '',
  MinimumSwapFee: '',
  SwapFeeRatePerMillion: 0,
  DepositAddress: '',
  BaseFeePercent: '',
}

export type AnyswapTokensMap = { [chainId: number]: { [contract: string]: AnyswapResultChainInfo } }

export type AnyswapMainMap = any[]

const ChainsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 5px 10px;
  align-items: center;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.darkMode ? '#8E8E8E36' : '#F5F3F3'};
  margin-bottom: 5px;
  gap: 5px;
`

const ChainButton = styled.div<{ selected: boolean, disabled: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  gap: 5px;
  cursor: pointer;
  border-radius: 12px;
  border: ${({ selected, theme }) => (selected ? theme.darkMode ? '1px solid #F0B90B' : '1px solid #D9D2D2' : `2px solid ${theme.darkMode ? '#8E8E8E36' : '#F5F3F3'}`)};
  outline: none;
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`

const StyledBalanceContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 21px;
  align-items: center;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.darkMode ? 'rgba(8, 5, 6, 0.2)' : 'rgba(8, 5, 6, 0.2)'};
  padding: 4px 6px 4px 6px;
  gap: 10px;
`

const InputBalanceContainer = styled.div`
  width: 100%;
  height: 60px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.darkMode ? '#8E8E8E36' : '#F5F3F3'};
  text-align: center;
  margin-bottom: 10px;
  & > input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    background-color: transparent;
    text-align: center;
    font-size: 30px;
    font-weight: 400;
  }
`

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 90%;
  margin: 5px auto;
  padding-bottom: 5px;
  margin-bottom: 5px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.darkMode ? '#8E8E8E36' : '#F5F3F3'};
  color: ${({ theme }) => theme.whiteHalf};
`

export default function Bridge() 
{
  const { account, chainId } = useActiveWeb3React()

  const addTransaction = useTransactionAdder()

  const currentChainFrom = chainId 

  const [chainFrom, setChainFrom] = useState<ChainId | null>(currentChainFrom)

  const [chainTo, setChainTo] = useState<ChainId | null>(currentChainFrom === ChainId.MOONRIVER ? ChainId.BSC : ChainId.MOONRIVER)

  const [currencyAmount, setCurrencyAmount] = useState<string>('')
  const [tokenToBridge, setTokenToBridge] = useState<Token | null>(null)
  const theme = useTheme();
  const [pendingTx, setPendingTx] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const selectedCurrencyBalance = useMultichainCurrencyBalance(
    chainFrom,
    account ?? undefined,
    tokenToBridge ?? undefined
  )

  const destinationCurrencyBalance = useMultichainCurrencyBalance(
    chainTo,
    account ?? undefined,
    ZRG_ADDRESSES[chainTo] ?? undefined
  )

  useEffect(() => {
    setTokenToBridge(ZRG_ADDRESSES[chainFrom])
  }, [chainFrom])

  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(`https://bridgeapi.multichain.org/v4/tokenlistv4/${chainFrom}`);
      const data = await result.json().then((data) => {
        let result: AnyswapMainMap[] = []
        for (const key in data) {
          result.push(data[key])
        }
        return result
      });
      setData(data);
    };
    fetchData();
  }, [chainFrom]);

  const anyswapInfo: AvailableChainsInfo = data ? data.filter((item) => item.address.toLowerCase() === tokenToBridge.address.toLowerCase())[0] : null
  const apiData = anyswapInfo && Object.values(anyswapInfo?.destChains[chainTo] ?? {...base})?.[0]
  const routerAddress = anyswapInfo ? Object.values(anyswapInfo?.destChains[chainTo] ?? {...base})[0]?.router : null
  const anyswapCurrencyContract = useAnyswapRouterContract(routerAddress, true)

  const [routerApproval, routerApprovalCallback] = useApproveCallback(
    new TokenAmount(tokenToBridge ?? ZRG_ADDRESSES[chainId], MaxUint256.toString()),
    routerAddress
  );

  const handleChainFrom = useCallback(
    (chain: ChainId) => {
      let changeTo = chainTo
      if (chainTo == chain) {
        changeTo = chainFrom
      }
      if (changeTo !== ChainId.MOONRIVER && chain !== ChainId.MOONRIVER) {
        setChainTo(ChainId.MOONRIVER)
      } else {
        setChainTo(changeTo)
      }
      setChainFrom(chain)
    },
    [chainFrom, chainTo]
  )

  const handleChainTo = useCallback(
    (chain: ChainId) => {
      let changeFrom = chainFrom
      if (chainFrom == chain) {
        changeFrom = chainTo
      }
      if (changeFrom !== ChainId.MOONRIVER && chain !== ChainId.MOONRIVER) {
        setChainFrom(ChainId.ARBITRUM)
      } else {
        setChainFrom(changeFrom)
      }
      setChainTo(chain)
    },
    [chainFrom, chainTo]
  )

  const handleTypeInput = useCallback(
    (value: string) => {
      setCurrencyAmount(value)
    },
    []
  )

  const insufficientBalance = () => {
    if (currencyAmount && selectedCurrencyBalance) {
      try {
        const balance = parseFloat(selectedCurrencyBalance.toFixed(tokenToBridge.decimals))
        const amount = parseFloat(currencyAmount)
        return amount > balance
      } catch (ex) {
        return false
      }
    }
    return false
  }

  const aboveMin = () => {
    if (currencyAmount && tokenToBridge) {
      const amount = parseFloat(currencyAmount) 
      const minAmount = parseFloat(apiData?.MinimumSwap)
      return amount >= minAmount
    }
    return false
  }

  const belowMax = () => {
    if (currencyAmount && tokenToBridge) {
      const amount = parseFloat(currencyAmount)
      const maxAmount = parseFloat(apiData?.MaximumSwap)
      return amount <= maxAmount
    }
    return false
  }

  const getAmountToReceive = () => {
    if (!tokenToBridge) return 0

    let fee = parseFloat(currencyAmount) * apiData?.SwapFeeRatePerMillion
    if (fee < parseFloat(apiData?.MinimumSwapFee)) {
      fee = parseFloat(apiData?.MinimumSwapFee)
    } else if (fee > parseFloat(apiData?.MaximumSwapFee)) {
      fee = parseFloat(apiData?.MinimumSwapFee)
    }

    return (parseFloat(currencyAmount) - fee).toFixed(6)
  }

  const buttonDisabled = 
    (chainFrom && chainFrom !== chainId) ||
    !tokenToBridge ||
    !currencyAmount ||
    routerApproval === ApprovalState.PENDING ||
    currencyAmount == '' ||
    !aboveMin() ||
    !belowMax() ||
    insufficientBalance() ||
    pendingTx

  const buttonText =
    chainFrom && chainFrom !== chainId
      ? `Switch to ${chainFrom} Network`
      : !tokenToBridge
      ? `Select a Token`
      : !currencyAmount || currencyAmount == ''
      ? 'Enter an Amount'
      : !aboveMin()
      ? `Below Minimum Amount`
      : !belowMax()
      ? `Above Maximum Amount`
      : insufficientBalance()
      ? `Insufficient Balance`
      : pendingTx
      ? `Confirming Transaction`
      : routerApproval === ApprovalState.NOT_APPROVED 
      ? `Approve ${tokenToBridge?.symbol}` 
      : routerApproval === ApprovalState.PENDING 
      ? `Approving ${tokenToBridge?.symbol}`
      :`Bridge ${tokenToBridge?.symbol}`

  const bridgeToken = async () => {
    const token = apiData?.address
    const anyToken = apiData?.fromanytoken?.address
    const depositAddress = tokenToBridge.chainId == ChainId.MOONRIVER ? token : anyToken
    console.log('depositAddress', depositAddress)
    const amountToBridge = ethers.utils.parseUnits(currencyAmount, tokenToBridge.decimals)
    setPendingTx(true)
    try {
        if (tokenToBridge) {
          const tx = chainId === 56 ? await anyswapCurrencyContract?.anySwapOut(anyToken, account, amountToBridge.toString(), chainTo, {
            gasLimit: 500000,
          }) : await anyswapCurrencyContract?.anySwapOutUnderlying(anyToken, account, amountToBridge.toString(), chainTo, {
            gasLimit: 500000,
          })

          addTransaction(tx, {
            summary: `${`Bridge `} ${tokenToBridge.symbol}`,
          })
        }
    } catch (ex) {
    } finally {
      setPendingTx(false)
    }
  }

  const availableChains = [ChainId.MOONRIVER, ChainId.BSC, ChainId.ARBITRUM]

  const ChainIcon = ({chain}) => {
    return (
      chain === ChainId.MOONRIVER ? <MoonriverLogo /> : chain === ChainId.BSC ? <BnbLogo /> : chain === ChainId.ARBITRUM ? <ArbitrumLogo /> : <MoonriverLogo />
    )
  }

  const Balance = ({value, from}) => {
    return (
      <>
        <Text fontSize="13px" color={theme.whiteHalf} style={{marginLeft: 'auto', marginRight: '5px'}}>
          {'You have'}
        </Text>
        <StyledBalanceContainer style={{cursor: from === true && 'pointer'}} onClick={() => from === true && setCurrencyAmount(value?.toSignificant(4))}>
          <Text fontSize="13px">
            {value?.toSignificant(4) ?? '-'}
          </Text>
          <Text fontSize="13px">
            {'ZRG'}
          </Text>
        </StyledBalanceContainer>
      </>
    )
  }

  const activeEllipsis = (darkMode) => { return(
    <svg width="5" height="6" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="2.5" cy="3" r="2.5" fill={darkMode ? "#CA90BB" : '#9E4D86'}/>
    </svg>)
  }

  const chainName = (chain) => {
    return (
      chain === ChainId.MOONRIVER ? 'Moonriver' : chain === ChainId.BSC ? 'BSC' : chain === ChainId.ARBITRUM ? 'Arbitrum' : 'Moonriver'
    )
  }

  const InputBalance = () => {
    return (
      <InputBalanceContainer>
        <NumericalInput
          key={'input-liq'}
          id={"bridge-liq"}
          autoFocus={true}
          currency={tokenToBridge}
          value={currencyAmount}
          onUserInput={val => {
            setCurrencyAmount(val)
          }}
        />
      </InputBalanceContainer>
    )
  }

  const OutputBalance = () => {
    const calculatedFee = parseFloat(currencyAmount) * apiData?.SwapFeeRatePerMillion / 100
    const shownFee = calculatedFee < parseFloat(apiData?.MinimumSwapFee) ? parseFloat(apiData?.MinimumSwapFee) : calculatedFee > parseFloat(apiData?.MaximumSwapFee) ? parseFloat(apiData?.MaximumSwapFee) : calculatedFee
    return (
      <InputBalanceContainer>
        <NumericalInput
          key={'output-liq'}
          currency={tokenToBridge}
          value={(parseFloat(currencyAmount) - shownFee) > 0 ? (parseFloat(currencyAmount) - shownFee).toString() : '0'}
          disabled={true}
          onUserInput={val => {
            handleTypeInput(val)
          }}
        />
      </InputBalanceContainer>
    )
  }

  const SelectChain : React.FC<{from: boolean}> = ({from}) => {
    return (
      <Flex flexDirection={'column'} p={'0 10px'}>
        <ChainsContainer>
          <>
          <Text style={{color: theme.percentageGreen, marginRight: '10px'}}>
            {from === true ? 'From' : 'To'}
          </Text>
          {availableChains.map((chain) => {
            return (
              <ChainButton
                key={chain}
                selected={from === true ? chainFrom === chain : chainTo === chain}
                disabled={chain === ChainId.ARBITRUM}
                onClick={() => {
                  chain !== ChainId.ARBITRUM && (from === true ? handleChainFrom(chain) : handleChainTo(chain))
                }}
              >
                <ChainIcon chain={chain} />
                {from === true ? chainFrom === chain && <Text>{chainName(chain)}</Text> : chainTo === chain && <Text>{chainName(chain)}</Text>}
                {from === true ? chainFrom === chain && activeEllipsis(theme.darkMode) : chainTo === chain && activeEllipsis(theme.darkMode)}
              </ChainButton>
            )
          })}
          </>
          <Balance value={from === true ? selectedCurrencyBalance : destinationCurrencyBalance} from={from} />
        </ChainsContainer>
        {from === true ? InputBalance() : OutputBalance()}
      </Flex>
    )}

  return (
    <>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)}>
        <Flex style={{margin: 'auto', gap: '10px', justifyContent: 'center', padding: '10px', alignItems: 'center', flexDirection: 'column'}}>
          <Text variant="sm" className="font-medium">
            {`You are sending ${formatNumberNew(currencyAmount)} ${tokenToBridge?.symbol} from ${chainFrom === ChainId.MOONRIVER ? 'Moonriver' : chainFrom === ChainId.BSC ? 'BSC' : chainFrom === ChainId.ARBITRUM ? 'Arbitrum' : 'Moonriver'}`}
          </Text>
          <Text variant="sm" className="font-medium">
            {`You will receive ${formatNumberNew(getAmountToReceive())} ${tokenToBridge?.symbol} on ${chainTo === ChainId.MOONRIVER ? 'Moonriver' : chainTo === ChainId.BSC ? 'BSC' : chainTo === ChainId.ARBITRUM ? 'Arbitrum' : 'Moonriver'}`}
          </Text>

          <ButtonPrimary disabled={pendingTx} onClick={() => bridgeToken()}>
            <Text variant="lg">
              {pendingTx ? (
                <div className={'p-2'}>
                  <AutoRow gap="6px" justify="center">
                    {buttonText} <Loader stroke="white" />
                  </AutoRow>
                </div>
              ) : (
                `Bridge ${tokenToBridge?.symbol}`
              )}
            </Text>
          </ButtonPrimary>
        </Flex>
      </Modal>

      <AppBody>
      <div style={{display: 'flex', padding: '11px 25px', justifyContent: 'space-between'}}>
      <p>{'Bridge'}</p>
      <Settings />
      </div>
          <div style={{ zIndex: 1 }}>

            <SelectChain from={true} />

            <SelectChain from={false} />

            {tokenToBridge && (
              <div>
                {parseFloat(apiData?.MinimumSwapFee) > 0 && (
                  <StyledRow>
                    <Text>
                      Minimum Bridge Fee: 
                    </Text>
                    <Text>
                      {formatNumberNew(parseFloat(apiData?.MinimumSwapFee))}{' '}
                      {apiData?.symbol}
                    </Text>
                  </StyledRow>
                )}
                {parseFloat(apiData?.MaximumSwapFee) > 0 && (
                  <StyledRow>
                    <Text>
                      Maximum Bridge Fee: 
                    </Text>
                    <Text>
                    {formatNumberNew(parseFloat(Object.values(anyswapInfo?.destChains[chainTo])[0]?.MaximumSwapFee))}{' '}
                      {apiData?.symbol}
                    </Text>
                  </StyledRow>
                )}
                <StyledRow>
                  <Text>
                    Minimum Bridge Amount: 
                  </Text>
                  <Text>
                    {formatNumberNew(parseFloat(apiData?.MinimumSwap))}{' '}
                    {apiData?.symbol}
                  </Text>
                </StyledRow>
                <StyledRow>
                  <Text>
                    Maximum Bridge Amount: 
                  </Text>
                  <Text>
                    {formatNumberNew(parseFloat(apiData?.MaximumSwap))}{' '}
                    {apiData?.symbol}
                  </Text>
                </StyledRow>
                <StyledRow>
                  <Text>
                    Crosschain fee: 
                  </Text>
                  <Text>
                    {(apiData?.SwapFeeRatePerMillion)} %
                  </Text>
                </StyledRow>
                <StyledRow>
                  <Text fontSize={'15px'}>
                    Sending more than {formatNumberNew(parseFloat(apiData?.BigValueThreshold))}{' '}
                    {apiData?.symbol} could take up to 12 hours.
                  </Text>
                </StyledRow>
              </div>
            )}
                <ButtonPrimary
                  onClick={() => routerApproval === ApprovalState.APPROVED ? setShowConfirmation(true) : routerApprovalCallback()}
                  disabled={buttonDisabled}
                  style={{width: '96%', margin: '10px auto'}}
                >
                  {pendingTx ? (
                    <div className={'p-2'}>
                      <AutoRow gap="6px" justify="center">
                        {buttonText} <Loader stroke="white" />
                      </AutoRow>
                    </div>
                  ) : (
                    !account ? 'Connect wallet' : buttonText
                  )}
                </ButtonPrimary>
          </div>
      </AppBody>
    </>
  )
}
