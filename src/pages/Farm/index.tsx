import React, { useContext } from 'react'
import { FarmsPageLayout, FarmsContext } from '../../views/Farms'
import FarmCard from '../../views/Farms/components/FarmCard/FarmCard'
import { getDisplayApr } from '../../views/Farms/Farms'
import { useWeb3React } from '@web3-react/core'
import Lottie from "lottie-react-web";
import animation from "../../assets/lotties/farming_lottie.json";
import BigNumber from 'bignumber.js'

const FarmsPage = ({currentBlock}) => {
  const { account } = useWeb3React()
  const { activeFarms } = useContext(FarmsContext)
  const cakePrice = new BigNumber(1)

  return (
    <>
      {activeFarms.length > 0 ? activeFarms.map((farm) => (
        <FarmCard
          key={farm.sousId}
          farm={farm}
          displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
          cakePrice={cakePrice}
          account={account}
          removed={false}
          currentBlock={currentBlock}
        />
      )) :
          <div style={{display: 'flex', alignItems: 'center', width: '100%', flexDirection: 'column'}}>
            <Lottie
                style={{width: 100, height: 100}}
                options={{
                  animationData: animation
                }}
            />
            <p style={{width: '100%', textAlign: 'center', fontSize: '18px', fontWeight: 400}}>No farms found</p>
          </div>

      }
    </>
  )
}

FarmsPage.Layout = FarmsPageLayout

export default FarmsPage
