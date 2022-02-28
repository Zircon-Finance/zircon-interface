import React from 'react'
import { RouteComponentProps, Redirect } from 'react-router-dom'

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/

export function RedirectOldRemoveLiquidityProPathStructure({
  match: {
    params: { tokens }
  }
}: RouteComponentProps<{ tokens: string }>) {
  if (!OLD_PATH_STRUCTURE.test(tokens)) {
    return <Redirect to="/pool" />
  }
  // const [currency0, currency1] = tokens.split('-')
  //
  // return <Redirect to={`/remove-pro/${currency0}/${currency1}`} />
  return <Redirect to="/pool" />

}
