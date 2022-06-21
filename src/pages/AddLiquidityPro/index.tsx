import { BigNumber } from "@ethersproject/bignumber";
import { TransactionResponse } from "@ethersproject/providers";
import { Currency, currencyEquals, DEV, TokenAmount, WDEV } from "zircon-sdk";
import React, { useCallback, useState } from "react";
import ReactGA from "react-ga4";
import { RouteComponentProps } from "react-router-dom";
import { Flex, Text } from "rebass";
import styled, { css, keyframes, useTheme } from "styled-components";
import farmsConfig from "../../constants/pools";
import {
  ButtonAnchor,
  ButtonError,
  ButtonLight,
  ButtonPrimary,
} from "../../components/Button";
import { BlueCard, GreyCard, LightCard } from "../../components/Card";
import { AutoColumn, ColumnCenter } from "../../components/Column";
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from "../../components/TransactionConfirmationModal";
import CurrencyInputPanelInputOnly from "../../components/CurrencyInputPanelInputOnly";
import CurrencyInputPanelPicOnly from "../../components/CurrencyInputPanelPicOnly";
import CurrencyInputPanelBalOnly from "../../components/CurrencyInputPanelBalOnly";
import DoubleCurrencyLogo from "../../components/DoubleLogo";
import { AddRemoveTabs } from "../../components/NavigationTabs";
import { MinimalPositionPylonCard } from "../../components/PositionCard";
import { RowBetween, RowFlat } from "../../components/Row";
// import { Link } from 'react-router-dom'
// import { ArrowRight } from 'react-feather'
import { PYLON_ROUTER_ADDRESS } from "../../constants";
import { PylonState } from "../../data/PylonReserves";
import { useActiveWeb3React, useWindowDimensions } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import {
  ApprovalState,
  useApproveCallback,
} from "../../hooks/useApproveCallback";
import { useWalletModalToggle } from "../../state/application/hooks";
import { Field } from "../../state/mint/actions";
import {
  useDerivedPylonMintInfo,
  useMintActionHandlers,
  useMintState,
} from "../../state/mint/pylonHooks";

import { useTransactionAdder } from "../../state/transactions/hooks";
import {
  useIsExpertMode,
  useUserDeadline,
  useUserSlippageTolerance,
} from "../../state/user/hooks";
import { TYPE } from "../../theme";
import { calculateGasMargin, getPylonRouterContract } from "../../utils";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { wrappedCurrency } from "../../utils/wrappedCurrency";
import AppBody from "../AppBody";
import { Dots, Wrapper } from "../Pool/styleds";
import { ConfirmAddModalBottom } from "./ConfirmAddModalBottom";
import { currencyId } from "../../utils/currencyId";
import { MobileWrapper } from "../App";
import LearnIcon from "../../components/LearnIcon";
import { Toggle } from "@pancakeswap/uikit";
import CheckIcon from "../../components/CheckIcon";
import { getPoolAprAddress } from "../../utils/apr";
import { SpaceBetween } from "../../views/Farms/components/FarmTable/Actions/ActionPanel";
import RepeatIcon from "../../components/RepeatIcon";
// import { PoolPriceBar } from './PoolPriceBar'
// import { ArrowDown } from 'react-feather'

const expandAnimation = keyframes`
  from {
    height: 0%;
    opacity: 0;
  }
  to {
    height: 100%;
    opacity: 1;
  }
`

const collapseAnimation = keyframes`
  from {
    height: 100%;
    opacity: 1;
  }
  to {
    height: 0%;
    opacity: 0;
  }
`

const AdvancedContainer = styled.div<{ expanded }>`
animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 95%;
  margin: auto;
  padding: 0 10px;
  background-color: ${({ theme }) => theme.liquidityBg};
  border-radius: 17px;`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background: ${({ theme }) => theme.badgeSmall};
  width: 45px;
  height: 40px;
  align-self: center;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.bg14};
  }
`

export default function AddLiquidityPro({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, library } = useActiveWeb3React();
  const theme = useTheme();

  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);

  const oneCurrencyIsWDEV = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WDEV[chainId])) ||
        (currencyB && currencyEquals(currencyB, WDEV[chainId])))
  );

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
    liquidityMinted,
    //poolTokenPercentage,
    error,
  } = useDerivedPylonMintInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
    isFloat,
    sync
  );
  const [float, setFloat] = useState({
    currency_a: currencies[Field.CURRENCY_A],
    field_a: Field.CURRENCY_A,
    currency_b: currencies[Field.CURRENCY_B],
    field_b: Field.CURRENCY_B,
  });
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noPylon);
  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const [deadline] = useUserDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>("");

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

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[float.field_a],
    PYLON_ROUTER_ADDRESS[chainId ? chainId : ""]
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[float.field_b],
    PYLON_ROUTER_ADDRESS[chainId ? chainId : ""]
  );
  const addTransaction = useTransactionAdder();

  //pool values
  const {AddressZero} = require("@ethersproject/constants");
  const { contractAddress } = farmsConfig.filter((f) => 
    f.token1.symbol === currencyA?.symbol && 
    f.token2.symbol === currencyB?.symbol && 
    f.isAnchor === !isFloat)[0] ?? AddressZero;
  const apr = getPoolAprAddress(contractAddress) ?? '0'
  console.log('contractAddress', contractAddress)

  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [fakeAdvancedMode, setFakeAdvancedMode] = useState(false);
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
    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noPylon ? 0 : allowedSlippage)[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noPylon ? 0 : allowedSlippage)[0]
    // }
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
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  }

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

    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noPylon ? 0 : allowedSlippage)[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noPylon ? 0 : allowedSlippage)[0]
    // }

    const deadlineFromNow = Math.ceil(Date.now() / 1000) + deadline;

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number | boolean>,
      value: BigNumber | null;
    const tokenBIsETH = float.currency_b === DEV;
    console.log('args', [
      wrappedCurrency(
        tokenBIsETH ? float.currency_a : float.currency_b,
        chainId
      )?.address ?? "", // token
      DEV === currencies[Field.CURRENCY_A], // second option is anchor so it should mint anchor when float.currency a is equal to b
      account,
      stake ? contractAddress : AddressZero,
      deadlineFromNow,
    ])
    if (sync === "off") {
      if (float.currency_a === DEV) {
        estimate = router.estimateGas.addSyncLiquidityETH;
        method = router.addSyncLiquidityETH;
        args = [
          wrappedCurrency(
            tokenBIsETH ? float.currency_a : float.currency_b,
            chainId
          )?.address ?? "", // token
          DEV === currencies[Field.CURRENCY_A], // second option is anchor so it should mint anchor when float.currency a is equal to b
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = !tokenBIsETH
          ? BigNumber.from(
              (float.currency_a === currencies[Field.CURRENCY_A]
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
          (float.currency_a === currencies[Field.CURRENCY_A]
            ? parsedAmountA
            : parsedAmountB
          ).raw.toString(),
          float.currency_a === currencies[Field.CURRENCY_B],
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = null;
      }
    } else if (sync === "full") {
      if (float.currency_a === DEV) {
        estimate = router.estimateGas.addAsyncLiquidity100ETH;
        method = router.addAsyncLiquidity100ETH;
        args = [
          wrappedCurrency(
            tokenBIsETH ? float.currency_a : float.currency_b,
            chainId
          )?.address ?? "", // token
          DEV === currencies[Field.CURRENCY_A], // second option is anchor so it should mint anchor when float.currency a is equal to b
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = !tokenBIsETH
          ? BigNumber.from(
              (float.currency_a === currencies[Field.CURRENCY_A]
                ? parsedAmountA
                : parsedAmountB
              ).raw.toString()
            )
          : BigNumber.from("0");
      } else {
        estimate = router.estimateGas.addAsyncLiquidity100;
        method = router.addAsyncLiquidity100;
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? "",
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? "",
          (float.currency_a === currencies[Field.CURRENCY_A]
            ? parsedAmountA
            : parsedAmountB
          ).raw.toString(),
          float.currency_a === currencies[Field.CURRENCY_B],
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = null;
      }
    } else {
      if (float.currency_a === DEV || float.currency_b === DEV) {
        estimate = router.estimateGas.addAsyncLiquidityETH;
        method = router.addAsyncLiquidityETH;
        console.log(
          tokenBIsETH ? float.currency_a?.name : float.currency_b?.name
        );
        args = [
          wrappedCurrency(
            tokenBIsETH ? float.currency_a : float.currency_b,
            chainId
          )?.address ?? "", // token
          (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(),
          "1",
          "1",
          currencies[Field.CURRENCY_A] === DEV,
          float.currency_a === currencies[Field.CURRENCY_B], // second option is anchor so it should mint anchor when float.currency a is equal to b
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = BigNumber.from(
          (tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString()
        );
      } else {
        estimate = router.estimateGas.addAsyncLiquidity;
        method = router.addAsyncLiquidity;
        args = [
          wrappedCurrency(currencies[Field.CURRENCY_A], chainId)?.address ?? "",
          wrappedCurrency(currencies[Field.CURRENCY_B], chainId)?.address ?? "",
          (float.currency_a === currencies[Field.CURRENCY_A]
            ? parsedAmountA
            : parsedAmountB
          ).raw.toString(),
          (float.currency_a === currencies[Field.CURRENCY_A]
            ? parsedAmountB
            : parsedAmountA
          ).raw.toString(),
          "1",
          "1",
          float.currency_a === currencies[Field.CURRENCY_B],
          account,
          stake ? contractAddress : AddressZero,
          deadlineFromNow,
        ];
        value = null;
      }
    }

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
                parsedAmounts[float.field_a]?.toSignificant(3) +
                " " +
                float.currency_a?.symbol +
                " and " +
                parsedAmounts[float.field_b]?.toSignificant(3) +
                " " +
                float.currency_b?.symbol,
            });
          } else {
            addTransaction(response, {
              summary:
                (sync === "off" ? "Add sync " : "Add Async-100 ") +
                parsedAmounts[float.field_a]?.toSignificant(3) +
                " " +
                currencies[float.field_a]?.symbol,
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
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  }
  const formattedLiquidity = (liquidityMinted?.toSignificant(
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
          }}
        >
          <Text
            fontSize="45px"
            fontWeight={300}
            lineHeight="42px"
            width={"100%"}
          >
            {formattedLiquidity < 0.00000001
              ? "0.000..." + String(formattedLiquidity).slice(-4)
              : formattedLiquidity}
          </Text>
          <Text
            fontSize="16px"
            width={"100%"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            {currencies[Field.CURRENCY_A]?.symbol +
              "/" +
              currencies[Field.CURRENCY_B]?.symbol +
              (sync !== "half"
                ? float.field_a === Field.CURRENCY_A
                  ? " Float shares"
                  : " Anchor shares"
                : " Pool tokens")}
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </Text>
        </RowFlat>
        <TYPE.italic fontSize={12} textAlign="left" padding={"8px 0 0 0 "}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </TYPE.italic>
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        pylonState={pylonState}
        onAdd={() => (pylonState === PylonState.EXISTS ? onAdd() : addPylon())}
        //poolTokenPercentage={poolTokenPercentage}
        isFloat={isFloat}
        sync={sync}
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
      setFloat({
        currency_a: currencyA,
        field_a: Field.CURRENCY_A,
        currency_b: currencies[Field.CURRENCY_B],
        field_b: Field.CURRENCY_B,
      });
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/add-pro/${currencyIdB}/${currencyIdA}`);
      } else {
        history.push(`/add-pro/${newCurrencyIdA}/${currencyIdB}`);
      }
    },
    [currencyIdB, history, currencyIdA, currencies]
  );
  const handleSwapCurrencies = useCallback(() => {
        history.push(`/add-pro/${currencyIdB}/${currencyIdA}`);
      },
    [currencyIdB, history, currencyIdA]
  );

  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB);
      setFloat({
        currency_a: currencies[Field.CURRENCY_A],
        field_a: Field.CURRENCY_A,
        currency_b: currencies[Field.CURRENCY_B],
        field_b: Field.CURRENCY_B,
      });
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add-pro/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          history.push(`/add-pro/${newCurrencyIdB}`);
        }
      } else {
        history.push(
          `/add-pro/${currencyIdA ? currencyIdA : "ETH"}/${newCurrencyIdB}`
        );
      }
    },
    [currencyIdA, history, currencyIdB, currencies]
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput("");
    }
    setTxHash("");
  }, [onFieldAInput, txHash]);

  const { width } = useWindowDimensions();

  return (
    <>
      <LearnIcon />
      {pylonState === PylonState.LOADING && account && (
        <MobileWrapper
          style={{ backgroundColor: "rgba(12,12,12,0.5)", position: "fixed" }}
        ></MobileWrapper>
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
                  pylonState === PylonState.EXISTS
                    ? "You will receive"
                    : pylonState === PylonState.ONLY_PAIR
                    ? "You are creating a pylon"
                    : "You are creating a pair and a pylon"
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

            {!pylonPair && (
              <ColumnCenter>
                <BlueCard>
                  <AutoColumn
                    gap="10px"
                    style={{ fontSize: width > 700 ? "16px" : "15px" }}
                  >
                    <TYPE.link fontWeight={400} color={theme.text1}>
                      You are the first liquidity provider.
                    </TYPE.link>
                    <TYPE.link fontWeight={400} color={theme.text1}>
                      This will create the Pylon for this pair
                    </TYPE.link>
                    <TYPE.link fontWeight={400} color={theme.text1}>
                      Once you are happy with the pair click 'Create pair' to
                      review.
                    </TYPE.link>
                  </AutoColumn>
                </BlueCard>
              </ColumnCenter>
            )}

            {/* Condition that triggers pylov view */}

            <div
              style={{
                display: "flex",
                borderBottom: `1px solid ${theme.navigationBorder}`,
                paddingBottom: "5px",
                margin: "0px 10px",
              }}
            >
              <CurrencyInputPanelInputOnly
                onCurrencySelect={handleCurrencyASelect}
                currency={currencies[Field.CURRENCY_A]}
                id="add-liquidity-input-tokena"
                showCommonBases
                anchor={false}
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
              />
            </div>

            {/* Condition that triggers pylov view */}

            {currencies[Field.CURRENCY_B] !== undefined ? (
              <>
                {width <= 700 && pylonState === PylonState.EXISTS && (
                  <>
                    <Flex
                      margin={"0 10px"}
                      style={{
                        borderBottom:
                          !fakeAdvancedMode &&
                          `1px solid ${theme.navigationBorder}`,
                        paddingBottom: !fakeAdvancedMode && "10px",
                      }}
                      justifyContent={"space-between"}
                    >
                      <span style={{ alignSelf: "center" }}>
                        {"ADVANCED MODE"}
                      </span>
                      <Toggle
                        id="advancedModeToggle"
                        checked={showAdvancedMode}
                        checkedColor={"invertedContrast"}
                        defaultColor={"invertedContrast"}
                        onChange={() => {
                          showAdvancedMode && setSync("off");
                          setShowAdvancedMode(!showAdvancedMode);
                          fakeAdvancedMode
                            ? setTimeout(() => {
                                setFakeAdvancedMode(!fakeAdvancedMode);
                              }, 300)
                            : setFakeAdvancedMode(!fakeAdvancedMode);
                        }}
                        scale="sm"
                      />
                    </Flex>
                    {fakeAdvancedMode && (
                      <AdvancedContainer expanded={showAdvancedMode}>
                        <Flex
                          style={{
                            background: "transparent",
                            height: "50px",
                            borderBottom: `1px solid ${theme.navigationTabs}`,
                            width: "100%",
                          }}
                          onClick={() => setSync("full")}
                          justifyContent={"space-between"}
                        >
                          <span style={{ padding: "15px" }}>{"FAST MODE"}</span>
                          {sync === "full" && (
                            <div style={{ margin: "12px 0" }}>
                              <CheckIcon />
                            </div>
                          )}
                        </Flex>
                        <Flex
                          style={{
                            background: "transparent",
                            height: "50px",
                            width: "100%",
                          }}
                          onClick={() => setSync("half")}
                          justifyContent={"space-between"}
                        >
                          <span style={{ padding: "15px" }}>
                            {"SWAP AND ADD"}
                          </span>
                          {sync === "half" && (
                            <div style={{ margin: "12px 0" }}>
                              <CheckIcon />
                            </div>
                          )}
                        </Flex>
                      </AdvancedContainer>
                    )}
                  </>
                )}
                <Flex
                  margin={"0 10px"}
                  style={{
                    borderBottom: `1px solid ${theme.navigationBorder}`,
                  }}
                  justifyContent={"space-evenly"}
                >
                  {pylonState === PylonState.EXISTS && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        marginBottom: "10px",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          background: theme.maxButton,
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
                            backgroundColor:
                              float.currency_a === currencies[Field.CURRENCY_A]
                                ? theme.badgeSmall
                                : "transparent",
                          }}
                          onClick={() => {
                            setIsFloat(true);
                            setFloat({
                              currency_a: currencies[Field.CURRENCY_A],
                              field_a: Field.CURRENCY_A,
                              currency_b: currencies[Field.CURRENCY_B],
                              field_b: Field.CURRENCY_B,
                            });
                          }}
                        >
                          <CurrencyInputPanelPicOnly
                            currency={currencies[Field.CURRENCY_A]}
                            id="add-liquidity-input-tokena_pic"
                            showCommonBases
                          />
                          <span
                            style={{
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
                              float.currency_a === currencies[Field.CURRENCY_B]
                                ? theme.badgeSmall
                                : "transparent",
                          }}
                          onClick={() => {
                            setIsFloat(false);
                            setFloat({
                              currency_b: currencies[Field.CURRENCY_A],
                              field_b: Field.CURRENCY_A,
                              currency_a: currencies[Field.CURRENCY_B],
                              field_a: Field.CURRENCY_B,
                            });
                          }}
                        >
                          <CurrencyInputPanelPicOnly
                            currency={currencies[Field.CURRENCY_B]}
                            id="add-liquidity-input-tokenb_pic"
                            showCommonBases
                          />
                          <span
                            style={{
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

                {currencies[Field.CURRENCY_B] !== undefined &&
                  pylonState === PylonState.EXISTS && (
                    <div style={{ padding: "0 10px 0 10px" }}>
                      <div
                        style={{
                          display: "flex",
                          borderRadius: "17px",
                          justifyContent: "space-between",
                        }}
                      >
                        {width >= 700 && (
                          <>
                            <span
                              style={{
                                display: "inline",
                                alignSelf: "center",
                                fontSize: "13px",
                                margin: "auto",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {"ADVANCED MODE"}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                borderRadius: "17px",
                                padding: "5px",
                                fontSize: "13px",
                                width: width >= 700 ? "inherit" : "100%",
                                background: theme.maxButton,
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
                                      : theme.meatPink,
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
                                    sync === "full"
                                      ? theme.badgeSmall
                                      : "transparent",
                                  color:
                                    sync === "full"
                                      ? theme.text1
                                      : theme.meatPink,
                                  width: width >= 700 ? "auto" : "inherit",
                                }}
                                onClick={() => {
                                  setSync("full");
                                }}
                              >
                                FAST MODE
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
                                      : theme.meatPink,
                                  width: width >= 700 ? "auto" : "inherit",
                                }}
                                onClick={() => {
                                  setSync("half");
                                  setFloat({
                                    currency_a: currencies[Field.CURRENCY_A],
                                    field_a: Field.CURRENCY_A,
                                    currency_b: currencies[Field.CURRENCY_B],
                                    field_b: Field.CURRENCY_B,
                                  });
                                }}
                              >
                                SWAP AND ADD
                              </ButtonAnchor>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                <div
                  style={{
                    backgroundColor: theme.bg1,
                    padding: "0 10px 10px 10px",
                    borderRadius: "27px",
                  }}
                >
                  {/* Pylon condition  */}

                  <div style={{ display: "grid", gridGap: "10px" }}>
                    <CurrencyInputPanelBalOnly
                      value={formattedAmounts[float.field_a]}
                      onUserInput={
                        float.field_a === Field.CURRENCY_A
                          ? onFieldAInput
                          : onFieldBInput
                      }
                      onMax={() => {
                        float.field_a === Field.CURRENCY_A
                          ? onFieldAInput(
                              maxAmounts[float.field_a as Field]?.toExact() ??
                                ""
                            )
                          : onFieldBInput(
                              maxAmounts[float.field_a as Field]?.toExact() ??
                                ""
                            );
                      }}
                      onCurrencySelect={handleCurrencyASelect}
                      showMaxButton={!atMaxAmounts[float.field_a]}
                      currency={currencies[float.field_a]}
                      id="add-liquidity-input-tokena_bal"
                      showCommonBases
                      isFloat={float.field_a === Field.CURRENCY_A}
                      sync={sync}
                    />
                    {sync === "half" || pylonState !== PylonState.EXISTS ? (
                      <CurrencyInputPanelBalOnly
                        value={formattedAmounts[float.field_b]}
                        onUserInput={onFieldBInput}
                        onCurrencySelect={handleCurrencyBSelect}
                        onMax={() => {
                          float.field_a === Field.CURRENCY_B
                            ? onFieldAInput(
                                maxAmounts[float.field_b as Field]?.toExact() ??
                                  ""
                              )
                            : onFieldBInput(
                                maxAmounts[float.field_b as Field]?.toExact() ??
                                  ""
                              );
                        }}
                        showMaxButton={
                          !atMaxAmounts[float.field_b as Field] &&
                          sync !== "half"
                        }
                        currency={currencies[float.field_b as Field]}
                        id="add-liquidity-input-tokenb_bal"
                        showCommonBases
                        isFloat={float.field_b === Field.CURRENCY_A}
                        sync={sync}
                        exists={pylonState === PylonState.EXISTS}
                      />
                    ) : null}
                  </div>
                </div>
              </>
            ) : null}
          </AutoColumn>
          {currencies[Field.CURRENCY_A] &&
            currencies[Field.CURRENCY_B] &&
            pylonState !== PylonState.INVALID && (
              <>
                <GreyCard
                  padding="0.5rem"
                  borderRadius={"20px"}
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
                              {approvalA !== ApprovalState.APPROVED && (
                                <ButtonPrimary
                                  onClick={approveACallback}
                                  disabled={approvalA === ApprovalState.PENDING}
                                  width={
                                    approvalB !== ApprovalState.APPROVED
                                      ? sync === "half"
                                        ? "48%"
                                        : "48%"
                                      : "100%"
                                  }
                                >
                                  {approvalA === ApprovalState.PENDING ? (
                                    <Dots>
                                      Approving{" "}
                                      {currencies[float.field_a]?.symbol}
                                    </Dots>
                                  ) : (
                                    "Approve " +
                                    currencies[float.field_a]?.symbol
                                  )}
                                </ButtonPrimary>
                              )}
                              {((sync === "half" &&
                                approvalB !== ApprovalState.APPROVED) ||
                                (pylonState !== PylonState.EXISTS &&
                                  approvalB !== ApprovalState.APPROVED)) && (
                                <ButtonPrimary
                                  onClick={approveBCallback}
                                  disabled={approvalB === ApprovalState.PENDING}
                                  width={
                                    approvalA !== ApprovalState.APPROVED
                                      ? "48%"
                                      : "100%"
                                  }
                                >
                                  {approvalB === ApprovalState.PENDING ? (
                                    <Dots>
                                      Approving{" "}
                                      {currencies[float.field_b]?.symbol}
                                    </Dots>
                                  ) : (
                                    "Approve " +
                                    currencies[float.field_b]?.symbol
                                  )}
                                </ButtonPrimary>
                              )}
                            </RowBetween>
                          )}
                        <SpaceBetween>
                          <ButtonError
                            style={{ height: "65px" }}
                            width={
                              pylonState === PylonState.EXISTS ? "48%" : "100%"
                            }
                            onClick={() => {
                              expertMode ? onAdd() : setShowConfirm(true);
                            }}
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
                            <Text
                              fontSize={width > 700 ? 20 : 16}
                              fontWeight={400}
                            >
                              {error ??
                                (pylonState === PylonState.EXISTS
                                  ? "Add Liquidity"
                                  : pylonState === PylonState.ONLY_PAIR
                                  ? "Create Pylon"
                                  : "Create Pair & Pylon")}
                            </Text>
                          </ButtonError>
                          {pylonState === PylonState.EXISTS && (
                            <ButtonError
                              style={{ height: "65px" }}
                              width={"48%"}
                              onClick={() => {
                                expertMode ? onAdd(true) : onAdd(true);
                              }}
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
                                  fontSize={width > 700 ? 20 : 16}
                                  fontWeight={400}
                                >
                                  {error ??
                                    (pylonState === PylonState.EXISTS &&
                                      "Add & Farm")}
                                </Text>
                                <Text
                                  fontSize={width > 700 ? 14 : 13}
                                  fontWeight={400}
                                >
                                  {`${apr}% APR`}
                                </Text>
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
          />
        </AutoColumn>
      ) : null}
    </>
  );
}
