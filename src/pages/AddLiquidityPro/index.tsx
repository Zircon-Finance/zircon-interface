import {BigNumber} from "@ethersproject/bignumber";
import {TransactionResponse} from "@ethersproject/providers";
import {Currency, currencyEquals, NATIVE_TOKEN, TokenAmount, WDEV} from "zircon-sdk";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import ReactGA from "react-ga4";
import {RouteComponentProps} from "react-router-dom";
import {Flex, Text} from "rebass";
import styled, {useTheme} from "styled-components";
import {ButtonAnchor, ButtonError, ButtonErrorSecondary, ButtonLight, ButtonPrimary,} from "../../components/Button";
import {BlueCard, GreyCard, LightCard} from "../../components/Card";
import {AutoColumn, ColumnCenter} from "../../components/Column";
import TransactionConfirmationModal, {ConfirmationModalContent,} from "../../components/TransactionConfirmationModal";
import BigNumberJs from 'bignumber.js';
import { MaxUint256 } from '@ethersproject/constants'
import { ReactComponent as SmartAddImage } from '../../assets/images/smart_add.svg'
import CurrencyInputPanelInputOnly from "../../components/CurrencyInputPanelInputOnly";
import CurrencyInputPanelPicOnly from "../../components/CurrencyInputPanelPicOnly";
import CurrencyInputPanelBalOnly from "../../components/CurrencyInputPanelBalOnly";
import DoubleCurrencyLogo from "../../components/DoubleLogo";
import {AddRemoveTabs} from "../../components/NavigationTabs";
import {MinimalPositionPylonCard} from "../../components/PositionCard";
import {RowBetween, RowFlat} from "../../components/Row";
// import { Link } from 'react-router-dom'
// import { ArrowRight } from 'react-feather'
import {PYLON_ROUTER_ADDRESS, ROUTER_ADDRESS} from "../../constants";
import {PylonState} from "../../data/PylonReserves";
import {useActiveWeb3React, useWindowDimensions} from "../../hooks";
import {useCurrency} from "../../hooks/Tokens";
import {ApprovalState, useApproveCallback,} from "../../hooks/useApproveCallback";
import {useBlockNumber, useWalletModalToggle} from "../../state/application/hooks";
import {Field} from "../../state/mint/actions";
import {useDerivedPylonMintInfo, useMintActionHandlers, useMintState, usePairPrices,} from "../../state/mint/pylonHooks";

import {useTransactionAdder} from "../../state/transactions/hooks";
import {useIsExpertMode, useUserDeadline, useUserSlippageTolerance,} from "../../state/user/hooks";
import {TYPE} from "../../theme";
import {calculateGasMargin, calculateSlippageAmount, getPylonRouterContract, getRouterContract} from "../../utils";
import {maxAmountSpend} from "../../utils/maxAmountSpend";
import {wrappedCurrency} from "../../utils/wrappedCurrency";
import AppBody from "../AppBody";
import {Dots, Wrapper} from "../Pool/styleds";
import {ConfirmAddModalBottom} from "./ConfirmAddModalBottom";
import {currencyId} from "../../utils/currencyId";
import {LottieContainer} from "../App";
import LearnIcon from "../../components/LearnIcon";
import {Toggle} from "@pancakeswap/uikit";
// import {getPoolAprAddress} from "../../utils/apr";
import {SpaceBetween} from "../../views/Farms/components/FarmTable/Actions/ActionPanel";
import RepeatIcon from "../../components/RepeatIcon";
import {usePool, usePools} from "../../state/pools/hooks";
import {useERC20, useSousChef} from "../../hooks/useContract";
import useApprovePool from "../../views/Farms/hooks/useApproveFarm";
import {fetchPoolsPublicDataAsync} from "../../state/pools";
import {useDispatch} from "react-redux";
import {AddressZero} from "@ethersproject/constants";
import InfoCircle from "../../components/InfoCircle";
import {usePylonConstants} from "../../data/PylonData";
import Lottie from "lottie-react-web";
import animation from '../../assets/lotties/0uCdcx9Hn5.json'
import CapacityIndicator from "../../components/CapacityIndicator";
import { usePair } from "../../data/Reserves";
import { Separator } from "../../components/SearchModal/styleds";
import { useBatchPrecompileContract } from '../../hooks/useContract'
import { basePool } from "../../state/pools/selectors";
import PlusIcon from "../../views/Farms/components/PlusIcon";
import { ethers } from "ethers";

export const RadioContainer = styled.div<{ active: boolean, second: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  width: 30px;
  border: ${({ theme, second }) => second ? 'none' : `1px solid ${theme.darkMode ? '#733751' : '#EEEAEC'}`};
  height: 30px;
  background: ${({ theme, second }) => second ? theme.darkMode ? '#52273A' : '#FCFBFC' : 'none'};
  align-self: center;
  cursor: pointer;
`

export const RadioButton = styled.div<{ active: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 100%;
  background: ${({ active }) => (active ? '#B05D98' : 'none' )};
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  &:hover {
    background: ${({ theme }) => theme.maxButtonHover};
  }
`

export const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px;
  height: 60px;
  border-radius: 17px;
  background: #EFEAEC;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background: ${({ theme }) => theme.maxButton};
  width: 45px;
  height: 40px;
  align-self: center;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.maxButtonHover};
  }
  svg {
    path {
      stroke: ${({ theme }) => theme.pinkGamma} !important;
    }
  }
`

export const PinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 17px;
  border-top-right-radius: 17px;
  background: ${({ theme }) => theme.pinkGamma};
  width: 100%;
  height: 30px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`

export const ConfirmationInput = styled.input`
  border: none;
  background: #efeaec;
  height: 30px;
  font-size: 14px;
  &:focus {
    outline: none;
  }
`

export default function AddLiquidityPro({
                                          match: {
                                            params: { currencyIdA, currencyIdB, side =  "float" },
                                          },
                                          history,
                                        }: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string; side?: string }>) {


  const { account, chainId, library } = useActiveWeb3React();
  const theme = useTheme();
  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);

  const [errorTx, setErrorTx] = useState<string>("");

  const oneCurrencyIsWDEV = Boolean(
      chainId &&
      ((currencyA && currencyEquals(currencyA, WDEV[chainId])) ||
          (currencyB && currencyEquals(currencyB, WDEV[chainId])))
  );
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchPoolsPublicDataAsync(chainId))
  }, [account, dispatch])

  const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected

  const expertMode = useIsExpertMode();

  // mint state
  const [sync, setSync] = useState("off");

  const { independentField, typedValue, otherTypedValue } = useMintState();
  const [isFloat, setIsFloat] = useState(true);
  const decimals = {
    float: ethers.BigNumber.from(10).pow(currencyA && currencyB ? (isFloat ? currencyA?.decimals : currencyB?.decimals) : 18).toString(),
    anchor: ethers.BigNumber.from(10).pow(currencyA && currencyB ? (isFloat ? currencyB?.decimals : currencyA?.decimals) : 18 ).toString(),
  }
  const {
    dependentField,
    currencies,
    pylonPair,
    pylonState,
    currencyBalances,
    parsedAmounts,
    price,
    noPylon,
    mintInfo,
    gamma,
    error,
    healthFactor,
  } = useDerivedPylonMintInfo(
      currencyA ?? undefined,
      currencyB ?? undefined,
      isFloat,
      sync,
      decimals
  );

  console.log("FF:: mintInfo", mintInfo);
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noPylon);
  const isValid = !error;

  // handle pool button values
  const {pools} = usePools();
  const farm = pools.find(
      (f) =>
          f.token1.symbol === (currencyA?.symbol === 'wMOVR' ? 'MOVR' : currencyA?.symbol) &&
          f.token2.symbol === (currencyB?.symbol === 'wMOVR' ? 'MOVR' : currencyB?.symbol) &&
          f.isAnchor === !isFloat &&
          f.apr !== 0 && f.isFinished === false
  );
  const { pool } = usePool(useMemo(() => farm ? farm?.contractAddress : '0x0f2eacd08e26932d1a74dbcf094d097d827aca3b', [farm]));
  const addTransaction = useTransactionAdder()
  const lpContract = useERC20(pool?.stakingToken.address)
  const farmIsApproved = useCallback(
      () => account && pool.userData.allowance && pool.userData.allowance.isGreaterThan(0)
      , [account, pool])

  const [pendingTx, setPendingTx] = useState(false)
  const {handleApprove} = useApprovePool(farm ?? basePool, lpContract, farm?.contractAddress ?? 1)
  const sousChefContract = useSousChef(farm?.contractAddress ?? AddressZero)
  const approveFarm = useCallback(async () => {
    setPendingTx(true)
    try {
      await handleApprove()
      setPendingTx(false)
    } catch (e) {
      setPendingTx(false)
      console.log(e)
    }
  }, [handleApprove])

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const [deadline] = useUserDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>("");

  const batchContract = useBatchPrecompileContract()
  const aCurrency = currencyA !== null ? wrappedCurrency(currencyA, chainId)?.address : chainId === 1285 ?
    '0x4545e94974adacb82fc56bcf136b07943e152055' : chainId === 56 ? '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' : '0x680Faf7f226324F8ECdA0c5ba17c9bee2E8534C7'
  const bCurrency = currencyB !== null ? wrappedCurrency(currencyB, chainId)?.address : chainId === 1285 ?
  '0x4545e94974adacb82fc56bcf136b07943e152055' : chainId === 56 ? '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' : '0x680Faf7f226324F8ECdA0c5ba17c9bee2E8534C7'
  const token0Contract = useERC20(aCurrency ?? '0x0000000000000000000000000000000000000000', true) ?? undefined
  const token1Contract = useERC20(bCurrency ?? aCurrency ?? '0x0000000000000000000000000000000000000000', true) ?? undefined

  const getField = (shouldSendFloat) => {
    if (isFloat) {
      return shouldSendFloat ? Field.CURRENCY_A : Field.CURRENCY_B;
    }else{
      return shouldSendFloat ? Field.CURRENCY_B: Field.CURRENCY_A;
    }
  }
  const getCurrency = (shouldSendFloat) => {
    return currencies[getField(shouldSendFloat)]
  }


  useEffect(() => {
    setIsFloat(side === "float");
  }, [side])

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noPylon
        ? otherTypedValue
        : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(chainId, currencyBalances[field]),
    };
  }, {});

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [
    Field.CURRENCY_A,
    Field.CURRENCY_B,
  ].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? "0"),
    };
  }, {});

  // check whether the user has approved the router on the tokens (Pylon)
  const [approvalA, approveACallback] = useApproveCallback(
      parsedAmounts[getField(true)],
      PYLON_ROUTER_ADDRESS[chainId ? chainId : ""]
  );
  console.log('approvalA: ', approvalA)
  const [approvalB, approveBCallback] = useApproveCallback(
      parsedAmounts[getField(false)],
      PYLON_ROUTER_ADDRESS[chainId ? chainId : ""]
  );
  // check whether the user has approved the router on the tokens (Pair)
  const [approvalAPair, approveACallbackPair] = useApproveCallback(
      parsedAmounts[getField(true)],
      ROUTER_ADDRESS[chainId ? chainId : ""]
  );
  const [approvalBPair, approveBCallbackPair] = useApproveCallback(
      parsedAmounts[getField(false)],
      ROUTER_ADDRESS[chainId ? chainId : ""]
  );

  //pool values
  const contractAddress = farm ? farm.contractAddress : AddressZero;
  // const apr = getPoolAprAddress(contractAddress) ?? '0'

  // const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  // const [fakeAdvancedMode, setFakeAdvancedMode] = useState(false);
  async function addPylon() {
    if (!chainId || !library || !account) return;
    const pylonRouter = getPylonRouterContract(chainId, library, account);

    const {
      [Field.CURRENCY_A]: parsedAmountA,
      [Field.CURRENCY_B]: parsedAmountB,
    } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return;
    }

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;
    let estimate,
        method: (...args: any) => Promise<TransactionResponse>,
        args: Array<string | string[] | number | boolean>,
        value: BigNumber | null;

    if (currencyA === NATIVE_TOKEN[chainId] || currencyB === NATIVE_TOKEN[chainId]) {
      const tokenBIsETH = currencyB === NATIVE_TOKEN[chainId];
      estimate = pylonRouter.estimateGas.initETH;
      method = pylonRouter.initETH;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)
            ?.address ?? "", // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        currencyA === NATIVE_TOKEN[chainId],
        account,
        deadlineFromNow,
      ];
      value = BigNumber.from(
          (tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString()
      );
    } else {
      estimate = pylonRouter.estimateGas.init;
      method = pylonRouter.init;
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? "",
        wrappedCurrency(currencyB, chainId)?.address ?? "",
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        account,
        deadlineFromNow,
      ];
      value = null;
    }
    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
        .then((estimatedGasLimit) =>
            method(...args, {
              ...(value ? { value } : {}),
              gasLimit: calculateGasMargin(estimatedGasLimit),
            }).then((response) => {
              setAttemptingTxn(false);
              addTransaction(response, {
                summary:
                    "Creating " +
                    parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                    " " +
                    currencies[Field.CURRENCY_A]?.symbol +
                    " and " +
                    parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                    " " +
                    currencies[Field.CURRENCY_B]?.symbol +
                    " pylon",
              });

              setTxHash(response.hash);

              ReactGA.event({
                category: "Creation",
                action: "Create Pair",
                label: [
                  currencies[Field.CURRENCY_A]?.symbol,
                  currencies[Field.CURRENCY_B]?.symbol,
                ].join("/"),
              });
            })
        )
        .catch((error) => {
          setAttemptingTxn(false);
          setErrorTx(error?.data?.message);
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error);
          }
        });
  }

  // Function to create Pylon / Add liquidity to Pylon
  async function onAdd(stake?: boolean) {
    if (!chainId || !library || !account) return;
    const router = getPylonRouterContract(chainId, library, account);

    const {
      [Field.CURRENCY_A]: parsedAmountA,
      [Field.CURRENCY_B]: parsedAmountB,
    } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return;
    }

    // TODO: check amount Min Value
    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, 0)[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, 0)[0]
    // }
    console.log('mintInfo', mintInfo)
    const liquidityMin = calculateSlippageAmount(mintInfo.amountOut, noPylon ? 0 : allowedSlippage)[0]

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;

    let method: (...args: any) => Promise<TransactionResponse>,
        args: Array<string | string[] | number | boolean>,
        value: BigNumber | null;


    const tokenBIsETH = getCurrency(false) === NATIVE_TOKEN[chainId];

    console.log('args', [
      wrappedCurrency(
          tokenBIsETH ? getCurrency(true) : getCurrency(false),
          chainId
      )?.address ?? "", // token
      NATIVE_TOKEN[chainId] === currencies[Field.CURRENCY_A], // second option is anchor so it should mint anchor when float.currency a is equal to b
      account,
      stake ? contractAddress : AddressZero,
      deadlineFromNow,
    ])
    if (sync === "off") {
      if (getCurrency(true) === NATIVE_TOKEN[chainId]) {
        method = router.addSyncLiquidityETH;
        args = [
          wrappedCurrency(
              tokenBIsETH ? getCurrency(true) : getCurrency(false),
              chainId
          )?.address ?? "", // token
          NATIVE_TOKEN[chainId] === currencies[Field.CURRENCY_A], // second option is anchor so it should mint anchor when float.currency a is equal to b
          liquidityMin.toString(),
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = !tokenBIsETH
            ? BigNumber.from(
                (isFloat
                        ? parsedAmountA
                        : parsedAmountB
                ).raw.toString()
            )
            : BigNumber.from("0");
      } else {
        method = router.addSyncLiquidity;
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? "",
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? "",
          (isFloat
                  ? parsedAmountA
                  : parsedAmountB
          ).raw.toString(),
          liquidityMin.toString(),
          !isFloat,
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];

        value = null;
      }
    } else {
      if (getCurrency(true) === NATIVE_TOKEN[chainId] || getCurrency(false) === NATIVE_TOKEN[chainId]) {
        method = router.addAsyncLiquidityETH;
        console.error([
            tokenBIsETH ? getCurrency(true)?.name : getCurrency(false)?.name,
            `tokens are (true) and (false) ${getCurrency(true)?.name} and ${getCurrency(false)?.name}`,
            `first token: ${tokenBIsETH ? getCurrency(true).name : getCurrency(false).name}`,
            `first token amount: ${(tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString()}`
        ]);
        args = [
          wrappedCurrency(
              tokenBIsETH ? getCurrency(true) : getCurrency(false),
              chainId
          )?.address ?? "", // token
          (currencies[Field.CURRENCY_A] === NATIVE_TOKEN[chainId] ? parsedAmountB : parsedAmountA).raw.toString(),
          liquidityMin.toString(),
          currencies[Field.CURRENCY_A] === NATIVE_TOKEN[chainId],
          !isFloat, // second option is anchor so it should mint anchor when float.currency a is equal to b
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = BigNumber.from(
            (currencies[Field.CURRENCY_A] === NATIVE_TOKEN[chainId] ? parsedAmountA : parsedAmountB).raw.toString()
        );
      } else {
        method = router.addAsyncLiquidity;
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? "",
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? "",
          (parsedAmountA).raw.toString(),
          (parsedAmountB).raw.toString(),
          liquidityMin.toString(),
          !isFloat,
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = null;
      }
    }

    const approvalCallData0 = token0Contract.interface.encodeFunctionData('approve', [router.address, parsedAmounts[Field.CURRENCY_A].raw.toString()])
    const approvalCallData1 = token1Contract.interface.encodeFunctionData('approve', [router.address, parsedAmounts[Field.CURRENCY_B].raw.toString()])
    const farmApprovalCallData = lpContract.interface.encodeFunctionData('approve', [sousChefContract.address, MaxUint256])

    console.log('dat::1', token1Contract.address, parsedAmounts[Field.CURRENCY_B].raw.toString())
    const callData = router.interface.encodeFunctionData(((sync === "off" ?
    ((getCurrency(true) === NATIVE_TOKEN[chainId]) ? 'addSyncLiquidityETH' : 'addSyncLiquidity') :
    ((getCurrency(true) === NATIVE_TOKEN[chainId] || getCurrency(false) === NATIVE_TOKEN[chainId]) ?
    'addAsyncLiquidityETH' : 'addAsyncLiquidity'))), args)

    console.log('args', args)
    setAttemptingTxn(true);
    await (
      (chainId === 1285 || chainId === 1287) ?
            batchContract.batchAll(
              [lpContract.address, token0Contract.address, token1Contract.address,  router.address],
              ["000000000000000000", "000000000000000000", "000000000000000000", (value !== undefined && value !== null) ? value : "000000000000000000"],
              [farmApprovalCallData, approvalCallData0, approvalCallData1, callData],
              []
            )
            :
            method(...args, {
              ...(value ? { value } : {})
            })).then((response) => {
              setAttemptingTxn(false);
              if (sync === "half") {
                addTransaction(response, {
                  summary:
                      "Add " +
                      parsedAmounts[getField(true)]?.toSignificant(3) +
                      " " +
                      getCurrency(true)?.symbol +
                      " and " +
                      parsedAmounts[getField(false)]?.toSignificant(3) +
                      " " +
                      getCurrency(false)?.symbol,
                });
              } else {
                addTransaction(response, {
                  summary:
                      (sync === "off" ? !stake ? "Add sync " : "Add and stake sync " :  stake ? "Add and stake Async-100 " : "Add Async-100 ") +
                      parsedAmounts[getField(true)]?.toSignificant(3) +
                      " " +
                      currencies[getField(true)]?.symbol,
                });
              }

              setTxHash(response.hash);

              ReactGA.event({
                category: "Liquidity",
                action: `Add ${sync === "off" ? "sync" : "async"} liquidity`,
                label: [
                  currencies[Field.CURRENCY_A]?.symbol,
                  currencies[Field.CURRENCY_B]?.symbol,
                ].join("/"),
              });
            })
        .catch((error) => {
          setAttemptingTxn(false);
          setErrorTx(error?.data?.message);
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error);
          }
        });
  }

  // Function to create only pair before Pylon
  async function onAddPairOnly() {
    if (!chainId || !library || !account) return
    const router = getRouterContract(chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, 0)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, 0)[0]
    }

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline

    let estimate,
        method: (...args: any) => Promise<TransactionResponse>,
        args: Array<string | string[] | number>,
        value: BigNumber | null
    if (currencyA === NATIVE_TOKEN[chainId] || currencyB === NATIVE_TOKEN[chainId]) {
      const tokenBIsETH = currencyB === NATIVE_TOKEN[chainId]
      estimate = router.estimateGas.addLiquidityETH
      method = router.addLiquidityETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // DEV min
        account,
        deadlineFromNow
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
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
                    'Add ' +
                    parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                    ' ' +
                    currencies[Field.CURRENCY_A]?.symbol +
                    ' and ' +
                    parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                    ' ' +
                    currencies[Field.CURRENCY_B]?.symbol
              })

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
          setErrorTx(error?.data?.message);
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error)
          }
        })
  }

  const formattedLiquidity = (mintInfo?.amountOut.toSignificant(
      6
  ) as unknown) as number;

  const NoSlippageModalHeader = () => (
    <AutoColumn gap="20px">
          <RowFlat
              style={{
                marginTop: "20px",
                display: "flex",
                flexFlow: "column",
                backgroundColor: theme.bg14,
                borderRadius: "20px",
                padding: "20px 10px",
                overflow: "hidden",
              }}
          >
            {isStaking &&
              <Text fontSize="16px" fontWeight={400} style={{ margin: "auto" }}>
                {'You will stake'}
              </Text>
            }
            <Text
                fontSize="45px"
                fontWeight={300}
                lineHeight="42px"
                width={"100%"}
                textAlign={isStaking ? 'center' : 'left'}
                style={{margin: isStaking && '20px 0'}}
            >
              {(formattedLiquidity && formattedLiquidity.toString().length > 8 && formattedLiquidity < 0.001)
                  ? "0.00..." + String(formattedLiquidity).slice(Math.ceil(formattedLiquidity.toString().length-5))
                  : formattedLiquidity > 0 ? formattedLiquidity : ""}
            </Text>
            <Text
                fontSize="16px"
                width={"100%"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={isStaking ? 'center' : "space-between"}
            >
              {currencies[Field.CURRENCY_A]?.symbol +
              "/" +
              currencies[Field.CURRENCY_B]?.symbol +
              (sync !== "half"
                  ? isFloat
                      ? " Float shares"
                      : " Anchor shares"
                  : " Pool tokens")}
              {! isStaking && <DoubleCurrencyLogo
                  currency0={currencies[Field.CURRENCY_A]}
                  currency1={currencies[Field.CURRENCY_B]}
                  size={30}
              />}
            </Text>
          </RowFlat>
          <Text fontSize={12} textAlign="left" padding={"8px 0 0 0 "} color={theme.whiteHalf} style={{marginBottom: '-10px'}}>
            {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
          </Text>
          <Separator />
        </AutoColumn>
  )

  // logic for the blocked modal for high fees
  const [rememberedSlippage, setRememberedSlippage] = useState(0)
  const [originalValue, setOriginalValue] = useState('')
  const [customValue1, setCustomValue1] = useState('')
  const [customValue2, setCustomValue2] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [hasSetAsync, setHasSetAsync] = useState(false)
  const [confirmationSlippage, setConfirmationSlippage] = useState(false)
  const [confirmedString, setConfirmedString] = useState(false)
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [chosenOption, setChosenOption] = useState(2)

  const selectedBoxShadow = theme.darkMode ? 
   '0px 1px 2px rgba(13, 6, 9, 0.15), inset 0px -1px 1px rgba(13, 6, 9, 0.15), inset 0px 1px 1px rgba(237, 223, 229, 0.1)' : 
   '0px 1px 2px rgba(0, 0, 0, 0.15)';

  const feeIsTooHigh = rememberedSlippage >= 5
  const floatTokenHalf = parseFloat(parsedAmounts[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.toSignificant(6)) / 2
  const anchorTokenMultiplied = parseFloat(parsedAmounts[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.toSignificant(6)) / 2 * 
  parseFloat(
    !isFloat ? price?.invert().toSignificant(4) : price?.toSignificant(4)
  )
  const percentageDifference = parseFloat((new BigNumberJs(mintInfo?.amountOut.toSignificant(6)).minus(
    new BigNumberJs(amountOut))).div(
      new BigNumberJs(amountOut)).times(
        new BigNumberJs(100)).toFixed(2).toString())
      
  const setAsyncCustom = () => {
    setOriginalValue(parsedAmounts[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.toSignificant(6));
    setCustomValue1(floatTokenHalf.toString());
    setCustomValue2(anchorTokenMultiplied.toString());
    setSync('half');
    (isFloat 
      ? onFieldAInput(isFloat ? floatTokenHalf.toString() : anchorTokenMultiplied.toString())
      : onFieldBInput(!isFloat ? floatTokenHalf.toString() : anchorTokenMultiplied.toString())
    )
  }

  const handleChangeConfirmation = (typedValue: string) => {
    setConfirmedString(typedValue.toLowerCase() === 'confirm');
  }

  const backToOriginalValue = () => {
    setHasSetAsync(false);
    (isFloat 
      ? onFieldAInput(originalValue)
      : onFieldBInput(originalValue)
    )
    setSync('off');
  }

  useEffect(() => {
    if (hasConfirmed) {
      backToOriginalValue();
    }
  }, [hasConfirmed])

  useEffect(() => {
    if (showConfirm && feeIsTooHigh) {
      setAmountOut(mintInfo?.amountOut.toSignificant(6));
      setAsyncCustom();
    }
    else if (!showConfirm ) {
      onFieldBInput('')
      onFieldAInput('')
      setChosenOption(2);
      setHasSetAsync(false);
      setHasConfirmed(false);
      setAmountOut('');
      setCustomValue1('');
      setCustomValue2('');
      setSync('off');
      setConfirmationSlippage(false);
      setConfirmedString(false);
      setOriginalValue('');
    }
  }, [showConfirm])

  const SlippageWarningModal = () => (
    <Flex flexDirection={'column'} style={{background: theme.darkMode ? '#52273A' : 'transparent'}}>
        <Text mt='20px' style={{lineHeight: '160%'}} textAlign='center'>{'You can reduce slippage and get more'}</Text>
        <Text mb='10px' textAlign='center'>{`LP tokens using the Smart Add method`}</Text>
        <Flex mt='20px' mb='30px' mx='auto' style={{gap: '10px', textAlign: 'center'}}>
          <Flex onClick={() => [setChosenOption(1), setConfirmationSlippage(true)]} flexDirection={'column'} 
          style={{
            border: `${(chosenOption === 1) ? `2px solid ${theme.pinkGamma}` :
              theme.darkMode ? '2px solid rgba(98, 47, 69, 0.5)' : '2px solid #F5F3F4'}` ,
               borderRadius: '17px', cursor: 'pointer', marginTop: '30px'}}>
            <Text fontSize='14px' fontWeight={500} p='20px 10px' style={{borderBottom: `1px solid ${theme.darkMode ? '#5A2B3F' : '#F5F3F4'}`}}>{'CURRENT POSITION'}</Text>
            <Text my='10px'>{'You add'}</Text>
            <Text fontSize='18px' pb='54px' fontWeight={500} style={{borderBottom: `1px solid ${theme.darkMode ? '#5A2B3F' : '#F5F3F4'}`}}>
              {`${originalValue} ${currencies[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.symbol} `}
            </Text>
            <Text fontSize='14px' mt='10px'>{'You get'}</Text>
            <Text fontSize='18px' mb='20px' fontWeight={500}>{`${amountOut} LP`}</Text>
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
              <Text fontSize='14px' fontWeight={500} p='20px 10px' style={{borderBottom: `1px solid ${theme.darkMode ? '#5A2B3F' : '#E4E0E3'}`}}>{'WITH SMART ADD'}</Text>
              <Text fontSize='14px' my='10px'>{'You add'}</Text>
              <Text fontSize='18px' fontWeight={500}>
                {`${customValue1} ${currencies[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.symbol} `}
              </Text>
              <Flex style={{width: '100%', justifyContent: 'center', alignItems:'center'}}><PlusIcon /></Flex>
              <Text fontSize='18px' pb='10px' style={{borderBottom: `1px solid ${theme.darkMode ? '#5A2B3F' : '#E4E0E3'}`}} fontWeight={500}>
                {`${customValue2} ${currencies[isFloat ? Field.CURRENCY_B : Field.CURRENCY_A]?.symbol} `}
              </Text>
              <Text fontSize='14px' mt='10px'>{'You get'}</Text>
              <Text fontSize='18px' fontWeight={500}>{`${mintInfo?.amountOut.toSignificant(6)} LP`}</Text>
              <Text fontSize='14px' pb='10px' color={percentageDifference >= 0 ? theme.percentageGreen : theme.percentageRed} fontWeight={500}>
                {`${percentageDifference >= 0 ? '+' : ''} ${percentageDifference}%`}
              </Text>
              <RadioContainer style={{marginBottom: '20px'}} active={chosenOption === 2} second={true}>
                <RadioButton active={chosenOption === 2} />
              </RadioContainer>
            </Flex>
          </Flex>
        </Flex>
        {chosenOption === 0 && <Text mb='10px' textAlign='center'>{`Please select an option`}</Text>}
        {chosenOption === 2 && <ButtonPrimary onClick={() => setHasSetAsync(true)} style={{ margin: 'auto' }}>{'Add liquidity with Smart Add'}</ButtonPrimary>}
        {(confirmationSlippage && chosenOption === 1) && <ConfirmationInputModal />}
      </Flex>
  )

  const ConfirmationInputModal = () => (
    <Flex flexDirection={'column'}>
      <Flex justifyContent={'center'}><Text mr='5px'>{`Type`}</Text><Text mr='5px' style={{fontWeight: 500, color: theme.pinkGamma}}>{'Confirm '}</Text><Text> {' if you are sure'}</Text></Flex>
      <Flex justifyContent={'center'} mb='10px'><Text mr='5px'>{`you want`}</Text><Text mr='5px' style={{fontWeight: 500, color: theme.pinkGamma}}>
        {`to lose ${Math.abs(percentageDifference)}`}
        </Text><Text>{'of your position'}</Text>
      </Flex>
      <InputContainer>
        <ConfirmationInput disabled={confirmedString} type="text" onChange={e => handleChangeConfirmation(e.target.value)} />
        <ButtonPrimary disabled={!confirmedString} onClick={() => (setHasConfirmed(true),setConfirmationSlippage(false))} 
        style={{ margin: 'auto', padding: '12px', height: 'auto', borderRadius: '12px' }}>{'Proceed'}</ButtonPrimary>
      </InputContainer>
    </Flex>
  )

  const modalHeader = () => {
    return noPylon ? (
        <AutoColumn gap="20px">
          <LightCard
              mt="20px"
              borderRadius="27px"
              style={{ backgroundColor: theme.bg14 }}
          >
            <RowFlat style={{ flexFlow: "column", alignItems: "center" }}>
              <Text
                  fontSize="36px"
                  fontWeight={300}
                  lineHeight="42px"
                  style={{ margin: "auto" }}
              >
                {currencies[Field.CURRENCY_A]?.symbol +
                "/" +
                currencies[Field.CURRENCY_B]?.symbol}
              </Text>
              <div style={{ margin: "20px auto auto auto" }}>
                <DoubleCurrencyLogo
                    currency0={currencies[Field.CURRENCY_A]}
                    currency1={currencies[Field.CURRENCY_B]}
                    size={30}
                />
              </div>
            </RowFlat>
          </LightCard>
        </AutoColumn>        
        ) : feeIsTooHigh ? 
          sync === 'half' ? 
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
    );
  };

  const modalBottom = () => {
    return (
        <ConfirmAddModalBottom
            price={price}
            isStaking={isStaking}
            formattedLiquidity={formattedLiquidity}
            currencies={currencies}
            parsedAmounts={parsedAmounts}
            pylonState={pylonState}
            onAdd={() => isStaking ? onAdd(true) : pylonState === PylonState.EXISTS ? onAdd() :
                (pylonState === PylonState.ONLY_PAIR ? addPylon() : onAddPairOnly())}
            //poolTokenPercentage={poolTokenPercentage}
            isFloat={isFloat}
            sync={sync}
            errorTx={errorTx}
            blocked={mintInfo?.blocked}
            shouldBlock={mintInfo?.shouldBlock || mintInfo?.deltaApplied || mintInfo?.blocked}
            asyncBlock={(isFloat && sync !== "off")}
            disabledConfirmation={feeIsTooHigh && (!hasConfirmed && !hasSetAsync)}
        />
    );
  };

  function pendingText(): string {
    if (sync === "half" || pylonState !== PylonState.EXISTS) {
      return `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
          currencies[Field.CURRENCY_A]?.symbol
      } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${
          currencies[Field.CURRENCY_B]?.symbol
      }`;
    } else {
      return `Supplying ${parsedAmounts[
          isFloat ? Field.CURRENCY_A : Field.CURRENCY_B
          ]?.toSignificant(6)} ${
          currencies[isFloat ? Field.CURRENCY_A : Field.CURRENCY_B]?.symbol
      }`;
    }
  }

  const handleCurrencyASelect = useCallback(
      (currencyA: Currency) => {
        const newCurrencyIdA = currencyId(currencyA, chainId);

        if (newCurrencyIdA === currencyIdB) {
          history.push(`/add-pro/${currencyIdB || ''}/${currencyIdA || ''}`);
        } else {
          history.push(`/add-pro/${newCurrencyIdA || ''}/${currencyIdB || ''}`);
        }
      },
      [currencyIdB, history, currencyIdA, currencies]
  );
  const handleSwapCurrencies = useCallback(() => {
        (currencyIdB !== undefined && currencyIdA !== undefined) && history.push(`/add-pro/${currencyIdB}/${currencyIdA}`);
      },
      [currencyIdB, history, currencyIdA]
  );

  const handleCurrencyBSelect = useCallback(
      (currencyB: Currency) => {
        const newCurrencyIdB = currencyId(currencyB, chainId);

        if (currencyIdA === newCurrencyIdB) {
          if (currencyIdB) {
            history.push(`/add-pro/${currencyIdB}/${newCurrencyIdB || ''}`);
          } else {
            history.push(`/add-pro/${newCurrencyIdB || ''}`);
          }
        } else {
          history.push(
              `/add-pro/${currencyIdA ? currencyIdA : NATIVE_TOKEN[chainId].symbol}/${newCurrencyIdB || ''}`
          );
        }
      },
      [currencyIdA, history, currencyIdB, currencies]
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setOriginalValue(undefined);
    setCustomValue1("");
    setCustomValue2("");
    setHasConfirmed(false);
    setHasSetAsync(false);
    setIsStaking(false);
    setErrorTx('')
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput("");
    }
    setTxHash("");
  }, [onFieldAInput, txHash]);

  const { width } = useWindowDimensions();
  const pylonConstants = usePylonConstants()
  const blockNumber = useBlockNumber()
  // const gammaBig = useGamma(pylonPair?.address)
  const gammaAdjusted = new BigNumberJs(gamma? gamma?.toString() : "0").div(new BigNumberJs(10).pow(18))
  const feePercentage = new BigNumberJs(mintInfo?.feePercentage.toString()).div(new BigNumberJs(10).pow(18))
  const health = healthFactor?.toLowerCase()

  const [pairState,pair] = usePair(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B])
  const prices = usePairPrices(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B], pair, pairState)

  const showApproveCondition = (approvalA === ApprovalState.NOT_APPROVED ||
    approvalA === ApprovalState.PENDING ||
    approvalB === ApprovalState.NOT_APPROVED ||
    approvalB === ApprovalState.PENDING) &&
    isValid

  const showApproveACondition = pylonState === PylonState.NOT_EXISTS ? 
    (approvalAPair !== ApprovalState.APPROVED ? true : false) : 
    (approvalA !== ApprovalState.APPROVED ? true : false)

  const callbacoToCall = pylonState === PylonState.EXISTS ? (approveACallback) : (pylonState === PylonState.ONLY_PAIR ? approveACallback : approveACallbackPair)
  return (
      <>
        {(pylonState === PylonState.LOADING || account === '0' || currencyA === null || currencyB === null) &&  (
            <LottieContainer style={{top: 0}}><Lottie
                style={{width: "100px"}}
                options={{
                  animationData: animation
                }}
            /></LottieContainer>
        )}
        <AppBody>
          <AddRemoveTabs adding={true} />
          <Wrapper>
            <TransactionConfirmationModal
                width={feeIsTooHigh && '360'}
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                    <ConfirmationModalContent
                        title={
                          isStaking ? '' :
                          pylonState === PylonState.EXISTS
                              ? (feeIsTooHigh && (hasConfirmed===false && hasSetAsync===false)) ? 'High slippage warning' : "You will receive"
                              : pylonState === PylonState.ONLY_PAIR
                                  ? "You are creating a pylon"
                                  : "You are creating a pair"
                        }
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={feeIsTooHigh ? (feeIsTooHigh && (hasConfirmed===false && hasSetAsync===false) ? (() => <></>) : modalBottom) : modalBottom}
                        feeTooHigh={feeIsTooHigh && (hasConfirmed===false && hasSetAsync===false)}
                    />
                )}
                pendingText={pendingText()}
            />
            <AutoColumn
                gap="10px"
                style={{ backgroundColor: theme.bg1, borderRadius: "20px" }}
            >
              {/* Pylon condition, previously noPylon && */}

              {(pylonState !== PylonState.LOADING) && (
                  <ColumnCenter style={{padding: '0 10px'}}>
                    <BlueCard style={{borderRadius: '17px', background: 'transparent', border: `1px solid ${theme.anchorFloatBadge}`, padding: '20px 40px'}}>
                      <InfoCircle />
                      <AutoColumn
                          style={{ fontSize: width > 700 ? "16px" : "15px" }}
                      >
                        <TYPE.link fontWeight={500} fontSize={'18px'} textAlign={'center'} color={theme.text1} my={'10px'}>
                          {pylonState === PylonState.ONLY_PAIR ?  "PYLON CREATION" : (pylonState === PylonState.NOT_EXISTS ? "Pair creation" : "Select token & pair")}
                        </TYPE.link>
                        <TYPE.link fontWeight={400} color={theme.darkMode ? '#9C8F95' : '#6A6768'} textAlign={'center'}>
                          {pylonState === PylonState.ONLY_PAIR ?  "This Pylon has not been created yet, be the first liquidity provider to initialize it" :
                              pylonState !== PylonState.NOT_EXISTS ? "Stable is designed for stablecoins and L1 network tokens. Float is for all others, and it's always the more volatile in the pair." :
                                  "This pair has not been created yet, be the first liquidity provider to initialize it"}<br/>
                        </TYPE.link>
                      </AutoColumn>
                    </BlueCard>
                  </ColumnCenter>
              )}

              {/* Condition that triggers pylon view */}
              <div
                  style={{
                    display: "flex",
                    margin: "0px 5px",
                    paddingBottom: currencies[Field.CURRENCY_B] !== undefined ? '0' : '10px',
                  }}
              >
                <CurrencyInputPanelInputOnly
                    onCurrencySelect={handleCurrencyASelect}
                    currency={currencies[Field.CURRENCY_A]}
                    id="add-liquidity-input-tokena"
                    showCommonBases
                    anchor={false}
                    price={prices[0]}
                />
                <IconContainer
                    onClick={handleSwapCurrencies}
                >
                  <RepeatIcon />
                </IconContainer>

                <CurrencyInputPanelInputOnly
                    onCurrencySelect={handleCurrencyBSelect}
                    currency={currencies[Field.CURRENCY_B]}
                    id="add-liquidity-input-tokenb_bal"
                    showCommonBases
                    anchor={true}
                    price={prices[1]}
                />
              </div>

              {/* Condition that triggers pylov view */}

              {currencies[Field.CURRENCY_B] !== undefined ? (
                  <>
                    <Flex
                        margin={"0 10px"}
                        justifyContent={"space-evenly"}
                    >
                      {pylonState === PylonState.EXISTS && (
                          <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                                width: "100%",
                              }}
                          >
                            <div
                                style={{
                                  display: "flex",
                                  background: theme.darkMode ? theme.liquidityBg : '#F5F3F3',
                                  borderRadius: "17px",
                                  padding: "5px",
                                  width: "100%",
                                }}
                            >
                              <ButtonAnchor
                                  borderRadius={"12px"}
                                  padding={"5px"}
                                  style={{
                                    padding: "1px",
                                    width: "50%",
                                    boxShadow: isFloat && selectedBoxShadow,
                                    backgroundColor:
                                        isFloat
                                            ? theme.badgeSmall
                                            : "transparent",
                                  }}
                                  onClick={() => {
                                    setIsFloat(true);
                                  }}
                              >
                                <CurrencyInputPanelPicOnly
                                    currency={currencies[Field.CURRENCY_A]}
                                    id="add-liquidity-input-tokena_pic"
                                    showCommonBases
                                    isFloat={true}
                                />
                                <span
                                    style={{
                                      color: isFloat ? theme.text1 : theme.tabsText,
                                      marginLeft: "5px",
                                      fontSize: "16px",
                                      letterSpacing: "0.05em",
                                      fontWeight: 500,
                                    }}
                                >
                            {"Float"}
                          </span>
                              </ButtonAnchor>

                              <ButtonAnchor
                                  borderRadius={"12px"}
                                  padding={"5px"}
                                  style={{
                                    width: "50%",
                                    padding: "1px",
                                    boxShadow: !isFloat && selectedBoxShadow,
                                    backgroundColor:
                                        !isFloat
                                            ? theme.badgeSmall
                                            : "transparent",
                                  }}
                                  onClick={() => {
                                    setIsFloat(false);
                                  }}
                              >
                                <CurrencyInputPanelPicOnly
                                    currency={currencies[Field.CURRENCY_B]}
                                    id="add-liquidity-input-tokenb_pic"
                                    showCommonBases
                                    isFloat={false}
                                />
                                <span
                                    style={{
                                      color: !isFloat ? theme.text1 : theme.tabsText,
                                      marginLeft: "5px",
                                      fontSize: "16px",
                                      letterSpacing: "0.05em",
                                      fontWeight: 500,
                                    }}
                                >
                            {"Stable"}
                          </span>
                              </ButtonAnchor>
                            </div>
                          </div>
                      )}
                    </Flex>
                    {width <= 700 && pylonState === PylonState.EXISTS && (
                        <>
                          <Flex
                              margin={"0 10px 0 20px"}
                              justifyContent={"space-between"}
                          >
                      <span id='swap-and-add' style={{ alignSelf: "center" }}>
                        {"SWAP AND ADD"}
                      </span>
                            <Toggle
                                id="advancedModeToggle"
                                checked={sync === "half"}
                                checkedColor={'dropdownDeep'}
                                defaultColor={'invertedContrast'}
                                onChange={() => {
                                  setSync(sync !== "off" ? "off" : "half");
                                }}
                                scale="sm"
                            />
                          </Flex>
                        </>
                    )}
                    {currencies[Field.CURRENCY_B] !== undefined &&
                    pylonState === PylonState.EXISTS && width >= 700 && (
                        <div style={{ padding: "0 10px 0 10px" }}>
                          <Flex
                              style={{
                                borderRadius: "17px",
                                justifyContent: "space-between",
                                background: theme.liquidityBg,
                                flexDirection: 'column',
                                padding: '5px',
                              }}
                          >
                            <Flex justifyContent={'space-between'}>
                              <Flex alignItems={'center'}>
                              <span
                              id='swap-and-add'
                                style={{
                                  display: "flex",
                                  gap: '10px',
                                  alignSelf: "center",
                                  fontSize: "16px",
                                  padding: "0 0 0 10px",
                                  fontWeight: 500,
                                }}
                            >
                              <SmartAddImage />
                              {"Smart add"}
                            </span>
                              </Flex>
                            
                              <div
                                  style={{
                                    display: "flex",
                                    border: `1px solid ${theme.anchorFloatBadge}`,
                                    borderRadius: "12px",
                                    padding: "5px",
                                    fontSize: "13px",
                                    width: width >= 700 ? "inherit" : "100%",
                                    background: theme.darkMode ? theme.liquidityBg : '#F5F3F3',
                                  }}
                              >
                                <ButtonAnchor
                                    borderRadius={"7px"}
                                    padding={"5px 8px 4px 8px"}
                                    style={{
                                      boxShadow: sync === 'off' && selectedBoxShadow,
                                      backgroundColor:
                                          sync === "off"
                                              ? theme.badgeSmall
                                              : "transparent",
                                      color:
                                          sync === "off"
                                              ? theme.text1
                                              : theme.tabsText,
                                      width: width >= 700 ? "auto" : "inherit",
                                    }}
                                    onClick={() => {
                                      setSync("off");
                                    }}
                                >
                                  OFF
                                </ButtonAnchor>

                                <ButtonAnchor
                                    borderRadius={"7px"}
                                    padding={"4px 8px"}
                                    style={{
                                      boxShadow: sync === 'half' && selectedBoxShadow,
                                      backgroundColor:
                                          sync === "half"
                                              ? theme.badgeSmall
                                              : "transparent",
                                      color:
                                          sync === "half"
                                              ? theme.text1
                                              : theme.tabsText,
                                      width: width >= 700 ? "auto" : "inherit",
                                    }}
                                    onClick={() => {
                                      setSync("half");
                                    }}
                                >
                                  ON
                                </ButtonAnchor>
                              </div>
                            </Flex>
                            <span style={{color: theme.darkMode ? '#9C8F95' : '#6A6768', fontSize: '13px', paddingLeft: '41px', paddingBottom: '10px'}}>
                              {'Reduce slippage with a virtual swap for high amounts'}
                            </span>
                          </Flex>
                        </div>
                    )}

                    <div
                        style={{
                          backgroundColor: theme.bg1,
                          padding: "0 10px 10px",
                          borderRadius: "27px",
                        }}
                    >
                      {/* Pylon condition  */}

                      <div style={{ display: "grid", gridGap: "5px" }}>
                        <CurrencyInputPanelBalOnly
                            value={customValue1 !== '' ? customValue1 : formattedAmounts[getField(true)]}
                            onUserInput={
                              isFloat
                                  ? onFieldAInput
                                  : onFieldBInput
                            }
                            onMax={() => {
                              isFloat
                                  ? onFieldAInput(
                                      maxAmounts[getField(true) as Field]?.toExact() ??
                                      ""
                                  )
                                  : onFieldBInput(
                                      maxAmounts[getField(true) as Field]?.toExact() ??
                                      ""
                                  );
                            }}
                            onCurrencySelect={handleCurrencyASelect}
                            showMaxButton={!atMaxAmounts[getField(true)]}
                            currency={currencies[getField(true)]}
                            id="add-liquidity-input-tokena_bal"
                            showCommonBases
                            isFloat={isFloat}
                            sync={sync}
                            price={isFloat ? prices[0] : prices[1]}
                        />
                        {sync === "half" || pylonState !== PylonState.EXISTS ? (
                            <CurrencyInputPanelBalOnly
                                value={customValue2 !== '' ? customValue2 : formattedAmounts[getField(false)]}
                                onUserInput={onFieldBInput}
                                onCurrencySelect={handleCurrencyBSelect}
                                onMax={() => {
                                  !isFloat
                                  // float.field_a === Field.CURRENCY_B
                                      ? onFieldAInput(
                                          maxAmounts[getField(false) as Field]?.toExact() ??
                                          ""
                                      )
                                      : onFieldBInput(
                                          maxAmounts[getField(false) as Field]?.toExact() ??
                                          ""
                                      );
                                }}
                                showMaxButton={
                                  !atMaxAmounts[getField(false) as Field] &&
                                  sync !== "half"
                                }
                                currency={currencies[getField(false) as Field]}
                                id="add-liquidity-input-tokenb_bal"
                                showCommonBases
                                isFloat={!isFloat}
                                sync={sync}
                                exists={pylonState === PylonState.EXISTS}
                                price={isFloat ? prices[1] : prices[0]}
                            />
                        ) : null}
                      </div>
                    </div>
                  </>
              ) : null}

            </AutoColumn>

            {(currencyA && currencyB && pylonState === PylonState.EXISTS) &&
            <CapacityIndicator
                gamma={gammaAdjusted}
                health={health}
                isFloat={isFloat}
                blocked={mintInfo?.blocked}
                feePercentage={feePercentage}
                extraFee={new BigNumberJs(mintInfo?.extraSlippagePercentage.toString()).div(new BigNumberJs(10).pow(18))}
                extraFeeTreshold={new BigNumberJs(mintInfo?.extraFeeTreshold.toString()).div(new BigNumberJs(10).pow(18))}
                isDeltaGamma={mintInfo?.deltaApplied}
                hoverPage={'addLiq'}
            />}

            {currencies[Field.CURRENCY_A] &&
            currencies[Field.CURRENCY_B] &&
            pylonState !== PylonState.INVALID && (
                <>
                  <GreyCard
                      padding="10px"
                      borderRadius={"17px"}
                      style={{ backgroundColor: "transparent" }}
                  >
                    {/* <RowBetween padding="1rem">
                    <TYPE.subHeader fontWeight={400} fontSize={14}>
                      {noPylon ? 'Initial prices' : 'Prices'} and pool share
                    </TYPE.subHeader>
                  </RowBetween>{' '} */}
                    <LightCard
                        padding="0"
                        borderRadius={"20px"}
                        style={{ border: "none" }}
                    >
                      {/* <div style={{padding: '1rem'}}>
                      <PoolPriceBar
                        currencies={currencies}
                        poolTokenPercentage={poolTokenPercentage}
                        noLiquidity={noPylon}
                        price={price}
                      />
                    </div> */}

                      {!account ? (
                          <ButtonLight style={{fontWeight: 500}} onClick={toggleWalletModal}>
                            Connect Wallet
                          </ButtonLight>
                      ) : (
                          <AutoColumn gap={"md"}>
                            {(!(chainId === 1285 || chainId === 1287) || ((chainId === 1285 || chainId === 1287) && pylonState !== PylonState.EXISTS)) && showApproveCondition && (
                                <RowBetween>
                                  {/* Currency A isn't approved or pylon doesn't exist and A isn't approved */}
                                  {showApproveACondition && (
                                      <ButtonPrimary
                                          onClick={()=>{callbacoToCall()}}
                                          disabled={approvalA === ApprovalState.PENDING
                                          || approvalAPair === ApprovalState.PENDING}
                                          style={{margin: 'auto', maxWidth: '48%'}}
                                      >
                                        {(approvalA === ApprovalState.PENDING
                                            || approvalAPair === ApprovalState.PENDING) ? (
                                            <Dots>
                                              Approving{" "}
                                              {currencies[getField(true)]?.symbol}
                                            </Dots>
                                        ) : (
                                            "Approve " +
                                            currencies[getField(true)]?.symbol
                                        )}
                                      </ButtonPrimary>
                                  )}
                                  {(pylonState === PylonState.EXISTS ? ((sync === 'half' && approvalB !== ApprovalState.APPROVED) ? true : false) : (pylonState === PylonState.ONLY_PAIR ? (approvalB !== ApprovalState.APPROVED ? true : false) : (approvalBPair !== ApprovalState.APPROVED ? true : false))) &&
                                  (<ButtonPrimary
                                      onClick={pylonState === (PylonState.NOT_EXISTS) ?
                                          approveBCallbackPair : approveBCallback}
                                      disabled={(approvalB === ApprovalState.PENDING ||
                                      approvalBPair === ApprovalState.PENDING ? true : false)}
                                      style={{margin: 'auto', maxWidth: '48%'}}
                                  >
                                    {(approvalBPair === ApprovalState.PENDING || approvalB === ApprovalState.PENDING) ? (
                                        <Dots>
                                          Approving{" "}
                                          {currencies[getField(false)]?.symbol}
                                        </Dots>
                                    ) : (
                                        "Approve " +
                                        currencies[getField(false)]?.symbol
                                    )}
                                  </ButtonPrimary>)
                                  }
                                </RowBetween>
                            )}
                            <SpaceBetween>
                              <ButtonError
                                  style={{ height: "60px" }}
                                  width={
                                    pylonState === PylonState.EXISTS ? farm ? "48%" : '100%' : "100%"
                                  }
                                  onClick={() => {
                                    expertMode ? onAdd() : setShowConfirm(true); setRememberedSlippage(
                                      (parseFloat(new BigNumberJs(mintInfo?.feePercentage.toString()).div(new BigNumberJs(10).pow(18)).toString()) +
                                      parseFloat(new BigNumberJs(mintInfo?.extraSlippagePercentage.toString()).div(new BigNumberJs(10).pow(18)).toString()))
                                    );
                                  }}
                                  error={
                                    sync === "half" &&
                                    !isValid &&
                                    !!parsedAmounts[Field.CURRENCY_A] &&
                                    !!parsedAmounts[Field.CURRENCY_B]
                                  }
                                  disabled={(chainId === 1285 || chainId === 1287) ? (error !== undefined ? true :
                                    !isValid) :
                                    error !== undefined ? true :
                                    !isValid ||
                                    pylonState === PylonState.EXISTS ?
                                        (approvalA !== ApprovalState.APPROVED ||
                                            (sync === "half" &&
                                                approvalB !== ApprovalState.APPROVED)) :
                                        pylonState === PylonState.ONLY_PAIR ?
                                            (approvalB !== ApprovalState.APPROVED ||
                                                approvalA !== ApprovalState.APPROVED) :
                                            (approvalAPair !== ApprovalState.APPROVED ||
                                                approvalBPair !== ApprovalState.APPROVED)
                                  }
                              >
                                <Text
                                    fontSize={width > 700 ? 18 : 16}
                                    fontWeight={400}
                                >
                                  {error ??
                                  (pylonState === PylonState.EXISTS
                                      ? "Add Liquidity"
                                      : pylonState === PylonState.ONLY_PAIR
                                          ? "Create Pylon"
                                          : "Create Pair")}
                                </Text>
                              </ButtonError>
                              {pylonState === PylonState.EXISTS && farm && (
                                  <ButtonErrorSecondary
                                      style={{ height: "60px", color: theme.pinkBrown, borderRadius: '17px' }}
                                      width={"48%"}
                                      onClick={() =>
                                        farm ?
                                        (!farmIsApproved() && !(chainId === 1285 || chainId === 1287)) ?
                                        (approveFarm()) :
                                        (setShowConfirm(true), setIsStaking(true)) :
                                        (setShowConfirm(true), setIsStaking(true))
                                      }
                                      disabled={
                                        pendingTx ||
                                        !isValid || (!(chainId === 1285 || chainId === 1287) && (
                                        approvalA !== ApprovalState.APPROVED ||
                                        (sync === "half" &&
                                            approvalB !== ApprovalState.APPROVED)))
                                      }
                                      error={
                                        sync === "half" &&
                                        !isValid &&
                                        !!parsedAmounts[Field.CURRENCY_A] &&
                                        !!parsedAmounts[Field.CURRENCY_B]
                                      }
                                  >
                                    <Flex flexDirection={"column"}>
                                      <Text
                                          fontSize={width > 700 ? 18 : 16}
                                          fontWeight={400}
                                      >
                                        {error ? 'Add & Farm' :
                                            (farmIsApproved() || (chainId === 1285 || chainId === 1287) ?
                                                "Add & Farm" : "Enable farm contract")}
                                      </Text>
                                      {(farmIsApproved() || ((chainId === 1285 || chainId === 1287) && pool?.apr)) && (
                                      <Text
                                          fontSize={width > 700 ? 14 : 13}
                                          fontWeight={400}
                                      >
                                        {`${!pool?.apr ? "" : pool?.apr?.toFixed(2)}% APR`}
                                      </Text>)}
                                    </Flex>
                                  </ButtonErrorSecondary>
                              )}
                            </SpaceBetween>
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
            <AutoColumn style={{ minWidth: "20rem", marginTop: "1rem" }}>
              <MinimalPositionPylonCard
                  showUnwrapped={oneCurrencyIsWDEV}
                  pylon={pylonPair}
                  isFloat={isFloat}
                  pylonConstants={pylonConstants}
                  blockNumber={blockNumber}
              />
            </AutoColumn>
        ) : null}
        <LearnIcon />
      </>
  );
}
