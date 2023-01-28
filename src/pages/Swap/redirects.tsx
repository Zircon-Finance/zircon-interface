import React from 'react'
import { Redirect, RouteComponentProps, useParams } from 'react-router-dom'
import { connectNet } from '../../components/WalletModal'
import { useActiveWeb3React } from '../../hooks'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly({ location }: RouteComponentProps) {
  return <Redirect to={{ ...location, pathname: '/swap' }} />
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToSwap(props: RouteComponentProps<{ outputCurrency: string }>) {
  const {
    location: { search },
    match: {
      params: { outputCurrency }
    }
  } = props
  console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAA')

  return (
    <Redirect
      to={{
        ...props.location,
        pathname: '/swap',
        search:
          search && search.length > 1
            ? `${search}&outputCurrency=${outputCurrency}`
            : `?outputCurrency=${outputCurrency}`
      }}
    />
  )
}

// function that checks if the url contains a property named network and returns the value
export function GetNetworkFromUrl() {
  const {account, chainId} = useActiveWeb3React()
  //eslint-disable-next-line
  const { network } = useParams();
  account && network === 'movr' && chainId !== 1285 ? connectNet('moonriver') : 
    network === 'bsc' && chainId !== 56 ? connectNet('bsc') :
    console.log('no network')
  return <Redirect to={{ pathname: '/swap' }} />
}
