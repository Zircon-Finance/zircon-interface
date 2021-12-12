import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import AddSingleSidedLiquidity from "./index";

export function RedirectToAddSingleSidedLiquidity() {
  return <Redirect to="/addSingleSided/" />
}
export function RedirectToSwap() {
  return <Redirect to="/swap/" />
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/
export function RedirectOldAddSingleSidedLiquidityPathStructure(props: RouteComponentProps<{ poolToken: string, currencyIdA: string }>) {
  const {
    match: {
      params: {poolToken, currencyIdA}
    }
  } = props
  if (poolToken.toLowerCase() !== "anchor" && poolToken.toLowerCase() !== "float" ) {
    return RedirectToSwap()
  }

  const match = currencyIdA.match(OLD_PATH_STRUCTURE)
  if (match?.length) {
    return <Redirect to={`/addSingleSided/${match[1]}/${match[2]}/${match[3]}`} />
  }

  return <AddSingleSidedLiquidity {...props} />
}

export function RedirectDuplicateTokenSingleSidedIds(props: RouteComponentProps<{ poolToken: string, currencyIdA: string; currencyIdB: string }>) {
  const {
    match: {
      params: { poolToken, currencyIdA, currencyIdB }
    }
  } = props
  if (poolToken.toLowerCase() !== "anchor" && poolToken.toLowerCase() !== "float" ) {
    return RedirectToSwap()
  }else if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Redirect to={`/addSingleSided/${poolToken}/${currencyIdA}`} />
  }
  return <AddSingleSidedLiquidity {...props} />
}

export function RedirectToSingleSided(props: RouteComponentProps<{ poolToken: string }>) {
  const {
    match: {
      params: { poolToken }
    }
  } = props
  if (poolToken.toLowerCase() !== "anchor" && poolToken.toLowerCase() !== "float" ) {
    return RedirectToSwap()
  }else {
    return <Redirect to={`/addSingleSided/${poolToken}/ETH`} />
  }
}
