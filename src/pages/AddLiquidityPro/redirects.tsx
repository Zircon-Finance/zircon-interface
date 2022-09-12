import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import AddLiquidityPro from './index'

export function RedirectToAddLiquidityPro() {
  return <Redirect to="/add-pro/" />
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/
export function RedirectOldAddLiquidityProPathStructure(props: RouteComponentProps<{ currencyIdA: string }>) {
  const {
    match: {
      params: { currencyIdA }
    }
  } = props
  const match = currencyIdA.match(OLD_PATH_STRUCTURE)
  if (match?.length) {
    return <Redirect to={`/add-pro/${match[1]}/${match[2]}`} />
  }

  return <AddLiquidityPro {...props} />
}

export function RedirectDuplicateTokenIdsPro(props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const {
    match: {
      params: { currencyIdA, currencyIdB }
    }
  } = props
  if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Redirect to={`/add-pro/${currencyIdA}`} />
  }
  return <AddLiquidityPro {...props} />
}
export function RedirectDuplicateTokenIdsProAnchor(props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string; side: string }>) {
  const {
    match: {
      params: { currencyIdA, currencyIdB }
    }
  } = props
  if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Redirect to={`/add-pro/${currencyIdA}`} />
  }
  return <AddLiquidityPro {...props} />
}
