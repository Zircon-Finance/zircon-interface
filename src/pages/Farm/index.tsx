import React, { useContext } from 'react'
import { FarmsPageLayout, FarmsContext } from '../../views/Farms'
import FarmCard from '../../views/Farms/components/FarmCard/FarmCard'
import { getDisplayApr } from '../../views/Farms/Farms'
import { usePriceCakeBusd } from '../../state/farms/hooks'
import { useWeb3React } from '@web3-react/core'

const FarmsPage = () => {
  const { account } = useWeb3React()
  const { activeFarms } = useContext(FarmsContext)
  const cakePrice = usePriceCakeBusd()

  return (
    <>
      {activeFarms.map((farm) => (
        <FarmCard
          key={farm.sousId}
          farm={farm}
          displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
          cakePrice={cakePrice}
          account={account}
          removed={false}
        />
      ))}
    </>
  )
}

FarmsPage.Layout = FarmsPageLayout

export default FarmsPage
