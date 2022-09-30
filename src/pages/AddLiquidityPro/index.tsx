import {BigNumber} from "@ethersproject/bignumber";
import {TransactionResponse} from "@ethersproject/providers";
import {Currency, currencyEquals, DEV, TokenAmount, WDEV} from "zircon-sdk";
import React, {useCallback, useEffect, useState} from "react";
import ReactGA from "react-ga4";
import {RouteComponentProps} from "react-router-dom";
import {Flex, Text} from "rebass";
import styled, {useTheme} from "styled-components";
import farmsConfig from "../../constants/pools";
import {ButtonAnchor, ButtonError, ButtonLight, ButtonPrimary,} from "../../components/Button";
import {BlueCard, GreyCard, LightCard} from "../../components/Card";
import {AutoColumn, ColumnCenter} from "../../components/Column";
import TransactionConfirmationModal, {ConfirmationModalContent,} from "../../components/TransactionConfirmationModal";
import BigNumberJs from 'bignumber.js';

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
import {usePool} from "../../state/pools/hooks";
import {useERC20} from "../../hooks/useContract";
import useApprovePool from "../../views/Farms/hooks/useApproveFarm";
import {fetchPoolsUserDataAsync} from "../../state/pools";
import {useDispatch} from "react-redux";
import {AddressZero} from "@ethersproject/constants";
import InfoCircle from "../../components/InfoCircle";
import {useGamma, usePylonConstants} from "../../data/PylonData";
import Lottie from "lottie-react-web";
import animation from '../../assets/lotties/0uCdcx9Hn5.json'
import CapacityIndicator from "../../components/CapacityIndicator";
import { usePair } from "../../data/Reserves";
import { Separator } from "../../components/SearchModal/styleds";

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
    svg {
      transform: rotate(90deg);
    }
  }
  svg {
    path {
      stroke: ${({ theme }) => theme.pinkGamma} !important;
    }
    transform: rotate(90deg);
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
    dispatch(fetchPoolsUserDataAsync(account))
  }, [account, dispatch])

  const toggleWalletModal = useWalletModalToggle(); // toggle wallet when disconnected

  const expertMode = useIsExpertMode();

  // mint state
  const [sync, setSync] = useState("off");

  const { independentField, typedValue, otherTypedValue } = useMintState();
  const [isFloat, setIsFloat] = useState(true);
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
    //poolTokenPercentage,
    error,
    healthFactor,
  } = useDerivedPylonMintInfo(
      currencyA ?? undefined,
      currencyB ?? undefined,
      isFloat,
      sync
  );
  // const [float, setFloat] = useState({
  //   currency_a: currencies[Field.CURRENCY_A],
  //   field_a: Field.CURRENCY_A,
  //   currency_b: currencies[Field.CURRENCY_B],
  //   field_b: Field.CURRENCY_B,
  // });
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noPylon);
  const isValid = !error;

  // handle pool button values
  const farm = farmsConfig.find(
      (f) =>
          f.token1.symbol === (currencyA?.symbol === 'wMOVR' ? 'MOVR' : currencyA?.symbol) &&
          f.token2.symbol === (currencyB?.symbol === 'wMOVR' ? 'MOVR' : currencyB?.symbol) &&
          f.isAnchor === !isFloat
  );
  const { pool } = usePool(farm ? farm?.sousId : 1);
  const addTransaction = useTransactionAdder()
  const lpContract = useERC20(pool?.stakingToken.address)
  const farmIsApproved = useCallback(
      () => account && pool.userData.allowance && pool.userData.allowance.isGreaterThan(0)
      , [account, pool])

  const {handleApprove} = useApprovePool(farm, lpContract, farm?.sousId ?? 1)


  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const [deadline] = useUserDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>("");

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
    if (side !== "float"){
      // console.log("hello")
      // console.log("side a", Field.CURRENCY_B)
      // console.log("side a", currencies[Field.CURRENCY_B])
      setIsFloat(false);
      // setFloat({
      //   currency_b: currencies[Field.CURRENCY_A],
      //   field_b: Field.CURRENCY_A,
      //   currency_a: currencies[Field.CURRENCY_B],
      //   field_a: Field.CURRENCY_B,
      // });


    }else{
      // console.log("side b", Field.CURRENCY_B)
      // console.log("side b", currencies[Field.CURRENCY_B])

      // if(float.currency_a !== currencies[Field.CURRENCY_A]) {

      setIsFloat(true);
      // setFloat({
      //   currency_a: currencies[Field.CURRENCY_A],
      //   field_a: Field.CURRENCY_A,
      //   currency_b: currencies[Field.CURRENCY_B],
      //   field_b: Field.CURRENCY_B,
      // });
    }
    // }
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
      [field]: maxAmountSpend(currencyBalances[field]),
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

    if (currencyA === DEV || currencyB === DEV) {
      const tokenBIsETH = currencyB === DEV;
      estimate = pylonRouter.estimateGas.initETH;
      method = pylonRouter.initETH;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)
            ?.address ?? "", // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        currencyA === DEV,
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

    const liquidityMin = calculateSlippageAmount(mintInfo.liquidity, noPylon ? 0 : allowedSlippage)[0]

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;

    let estimate,
        method: (...args: any) => Promise<TransactionResponse>,
        args: Array<string | string[] | number | boolean>,
        value: BigNumber | null;

    const tokenBIsETH = getCurrency(false) === DEV;

    console.log('args', [
      wrappedCurrency(
          tokenBIsETH ? getCurrency(true) : getCurrency(false),
          chainId
      )?.address ?? "", // token
      DEV === currencies[Field.CURRENCY_A], // second option is anchor so it should mint anchor when float.currency a is equal to b
      account,
      stake ? contractAddress : AddressZero,
      deadlineFromNow,
    ])
    if (sync === "off") {
      if (getCurrency(true) === DEV) {

        estimate = router.estimateGas.addSyncLiquidityETH;
        method = router.addSyncLiquidityETH;
        args = [
          wrappedCurrency(
              tokenBIsETH ? getCurrency(true) : getCurrency(false),
              chainId
          )?.address ?? "", // token
          DEV === currencies[Field.CURRENCY_A], // second option is anchor so it should mint anchor when float.currency a is equal to b
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
        estimate = router.estimateGas.addSyncLiquidity;
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
      if (getCurrency(true) === DEV || getCurrency(false) === DEV) {
        estimate = router.estimateGas.addAsyncLiquidityETH;
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
          (currencies[Field.CURRENCY_A] === DEV ? parsedAmountB : parsedAmountA).raw.toString(),
          '0',
          '0',
          currencies[Field.CURRENCY_A] === DEV,
          !isFloat, // second option is anchor so it should mint anchor when float.currency a is equal to b
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = BigNumber.from(
            (currencies[Field.CURRENCY_A] === DEV ? parsedAmountA : parsedAmountB).raw.toString()
        );
      } else {
        estimate = router.estimateGas.addAsyncLiquidity;
        method = router.addAsyncLiquidity;
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? "",
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? "",
          (parsedAmountA).raw.toString(),
          (parsedAmountB).raw.toString(),
          '0',
          '0',
          !isFloat,
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = null;
      }
    }
    console.log('args', args)
    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
        .then((estimatedGasLimit) =>
            method(...args, {
              ...(value ? { value } : {}),
              gasLimit: calculateGasMargin(estimatedGasLimit),
            }).then((response) => {
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
                action: "Add",
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
    if (currencyA === DEV || currencyB === DEV) {
      const tokenBIsETH = currencyB === DEV
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

  const formattedLiquidity = (mintInfo?.liquidity.toSignificant(
      6
  ) as unknown) as number;

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
    ) : (
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
            shouldBlock={mintInfo?.shouldBlock}
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
        const newCurrencyIdA = currencyId(currencyA);
        // setFloat({
        //   currency_a: currencyA,
        //   field_a: Field.CURRENCY_A,
        //   currency_b: currencies[Field.CURRENCY_B],
        //   field_b: Field.CURRENCY_B,
        // });
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
        const newCurrencyIdB = currencyId(currencyB);
        // setFloat({
        //   currency_a: currencies[Field.CURRENCY_A],
        //   field_a: Field.CURRENCY_A,
        //   currency_b: currencies[Field.CURRENCY_B],
        //   field_b: Field.CURRENCY_B,
        // });
        if (currencyIdA === newCurrencyIdB) {
          if (currencyIdB) {
            history.push(`/add-pro/${currencyIdB}/${newCurrencyIdB || ''}`);
          } else {
            history.push(`/add-pro/${newCurrencyIdB || ''}`);
          }
        } else {
          history.push(
              `/add-pro/${currencyIdA ? currencyIdA : "ETH"}/${newCurrencyIdB || ''}`
          );
        }
      },
      [currencyIdA, history, currencyIdB, currencies]
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
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
  const gammaBig = useGamma(pylonPair?.address)
  const gammaAdjusted = new BigNumberJs(gammaBig).div(new BigNumberJs(10).pow(18))
  const feePercentage = new BigNumberJs(mintInfo?.feePercentage.toString()).div(new BigNumberJs(10).pow(18))
  const health = healthFactor?.toLowerCase()

  const [pairState,pair] = usePair(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B])
  const prices = usePairPrices(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B], pair, pairState)

  // console.log("currencyA", float.currency_a )
  // console.log("curremciesA", currencies[Field.CURRENCY_A])
  // console.log("fee indicator", float.currency_b)
  // console.log("fee indicator", currencies[Field.CURRENCY_B])
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
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                    <ConfirmationModalContent
                        title={
                          isStaking ? '' :
                          pylonState === PylonState.EXISTS
                              ? "You will receive"
                              : pylonState === PylonState.ONLY_PAIR
                                  ? "You are creating a pylon"
                                  : "You are creating a pair"
                        }
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={modalBottom}
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
                  <ColumnCenter style={{padding: '10px'}}>
                    <BlueCard style={{background: 'transparent', border: `1px solid ${theme.anchorFloatBadge}`}}>
                      <InfoCircle />
                      <AutoColumn
                          gap="10px"
                          style={{ fontSize: width > 700 ? "16px" : "15px" }}
                      >
                        <TYPE.link fontWeight={500} fontSize={'18px'} textAlign={'center'} color={theme.text1} my={'10px'}>
                          {pylonState === PylonState.ONLY_PAIR ?  "PYLON CREATION" : (pylonState === PylonState.NOT_EXISTS ? "PAIR CREATION" : "SELECT TOKEN & PAIR")}
                        </TYPE.link>
                        <TYPE.link fontWeight={400} color={theme.whiteHalf} textAlign={'center'}>
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
                                  background: theme.liquidityBg,
                                  borderRadius: "17px",
                                  padding: "5px",
                                  width: "100%",
                                  marginTop: "10px",
                                }}
                            >
                              <ButtonAnchor
                                  borderRadius={"12px"}
                                  padding={"5px"}
                                  style={{
                                    padding: "1px",
                                    width: "50%",
                                    backgroundColor:
                                        isFloat
                                            ? theme.badgeSmall
                                            : "transparent",
                                  }}
                                  onClick={() => {
                                    setIsFloat(true);
                                    // setFloat({
                                    //   currency_a: currencies[Field.CURRENCY_A],
                                    //   field_a: Field.CURRENCY_A,
                                    //   currency_b: currencies[Field.CURRENCY_B],
                                    //   field_b: Field.CURRENCY_B,
                                    // });
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
                                      fontSize: "13px",
                                      letterSpacing: "0.05em",
                                    }}
                                >
                            {"FLOAT"}
                          </span>
                              </ButtonAnchor>

                              <ButtonAnchor
                                  borderRadius={"12px"}
                                  padding={"5px"}
                                  style={{
                                    width: "50%",
                                    padding: "1px",
                                    backgroundColor:
                                        !isFloat
                                            ? theme.badgeSmall
                                            : "transparent",
                                  }}
                                  onClick={() => {
                                    setIsFloat(false);
                                    // setFloat({
                                    //   currency_b: currencies[Field.CURRENCY_A],
                                    //   field_b: Field.CURRENCY_A,
                                    //   currency_a: currencies[Field.CURRENCY_B],
                                    //   field_a: Field.CURRENCY_B,
                                    // });
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
                                      fontSize: "13px",
                                      letterSpacing: "0.05em",
                                    }}
                                >
                            {"STABLE"}
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
                      <span style={{ alignSelf: "center" }}>
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
                          <div
                              style={{
                                display: "flex",
                                borderRadius: "17px",
                                justifyContent: "space-between",
                              }}
                          >
                            <>
                            <span
                                style={{
                                  display: "inline",
                                  alignSelf: "center",
                                  fontSize: "13px",
                                  padding: "0 0 0 10px",
                                  letterSpacing: "0.05em",
                                }}
                            >
                              {"SWAP AND ADD"}
                            </span>
                              <div
                                  style={{
                                    display: "flex",
                                    borderRadius: "17px",
                                    padding: "5px",
                                    fontSize: "13px",
                                    width: width >= 700 ? "inherit" : "100%",
                                    background: theme.liquidityBg,
                                  }}
                              >
                                <ButtonAnchor
                                    borderRadius={"12px"}
                                    padding={"10px"}
                                    style={{
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
                                    borderRadius={"12px"}
                                    padding={"10px"}
                                    style={{
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
                                      // setFloat({
                                      //   currency_a: currencies[Field.CURRENCY_A],
                                      //   field_a: Field.CURRENCY_A,
                                      //   currency_b: currencies[Field.CURRENCY_B],
                                      //   field_b: Field.CURRENCY_B,
                                      // });
                                    }}
                                >
                                  ON
                                </ButtonAnchor>
                              </div>
                            </>
                          </div>
                        </div>
                    )}

                    <div
                        style={{
                          backgroundColor: theme.bg1,
                          padding: "10px",
                          borderRadius: "27px",
                        }}
                    >
                      {/* Pylon condition  */}

                      <div style={{ display: "grid", gridGap: "5px" }}>
                        <CurrencyInputPanelBalOnly
                            value={formattedAmounts[getField(true)]}
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
                                value={formattedAmounts[getField(false)]}
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
                          <ButtonLight onClick={toggleWalletModal}>
                            Connect Wallet
                          </ButtonLight>
                      ) : (
                          <AutoColumn gap={"md"}>
                            {(approvalA === ApprovalState.NOT_APPROVED ||
                                approvalA === ApprovalState.PENDING ||
                                approvalB === ApprovalState.NOT_APPROVED ||
                                approvalB === ApprovalState.PENDING) &&
                            isValid && (
                                <RowBetween>
                                  {/* Currency A isn't approved or pylon doesn't exist and A isn't approved */}
                                  {(pylonState === PylonState.NOT_EXISTS ? (approvalAPair !== ApprovalState.APPROVED ? true : false) : (approvalA !== ApprovalState.APPROVED ? true : false))
                                  && (
                                      <ButtonPrimary
                                          onClick={(pylonState === PylonState.ONLY_PAIR || pylonState === PylonState.EXISTS) ?
                                              approveACallback
                                              : approveACallbackPair}
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
                                    expertMode ? onAdd() : setShowConfirm(true);
                                  }}
                                  error={
                                    sync === "half" &&
                                    !isValid &&
                                    !!parsedAmounts[Field.CURRENCY_A] &&
                                    !!parsedAmounts[Field.CURRENCY_B]
                                  }
                                  disabled={
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
                                  <ButtonError
                                      style={{ height: "60px" }}
                                      width={"48%"}
                                      onClick={() => 
                                        farm ? 
                                        !farmIsApproved() ? 
                                        (handleApprove()) : 
                                        (setShowConfirm(true), setIsStaking(true)) : 
                                        (setShowConfirm(true), setIsStaking(true))
                                      }
                                      disabled={
                                        !isValid ||
                                        approvalA !== ApprovalState.APPROVED ||
                                        (sync === "half" &&
                                            approvalB !== ApprovalState.APPROVED)
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
                                            (farmIsApproved() ?
                                                "Add & Farm" : "Enable farm contract")}
                                      </Text>
                                      {farmIsApproved() && pool?.apr && (
                                      <Text
                                          fontSize={width > 700 ? 14 : 13}
                                          fontWeight={400}
                                      >
                                        {`${!pool?.apr ? "" : pool?.apr?.toFixed(2)}% APR`}
                                      </Text>)}
                                    </Flex>
                                  </ButtonError>
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
