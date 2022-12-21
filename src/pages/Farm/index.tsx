import React, { useContext } from 'react'
import { FarmsPageLayout, FarmsContext } from '../../views/Farms'
import FarmCard from '../../views/Farms/components/FarmCard/FarmCard'
import { getDisplayApr } from '../../views/Farms/Farms'
import { useWeb3React } from '@web3-react/core'
import Lottie from "lottie-react-web";
import animation from "../../assets/lotties/farming_lottie.json";
import BigNumber from 'bignumber.js'
import { usePools } from '../../state/pools/hooks'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { Skeleton } from '@pancakeswap/uikit'

const SkeletonTable = styled.td`
  display: flex;
  align-items: center;
  height: 89px;
`

const Row = styled.tr`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
`;

const FarmsPage = ({currentBlock}) => {
  const { account } = useWeb3React()
  const { activeFarms } = useContext(FarmsContext)
  const cakePrice = new BigNumber(1)
  const {userDataLoaded, pools} = usePools()
  const skeletons = 6

  return (
    <>
      {activeFarms.length > 0 ? activeFarms.map((farm) => (
        <FarmCard
          key={farm.contractAddress}
          farm={farm}
          displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
          cakePrice={cakePrice}
          account={account}
          removed={false}
          currentBlock={currentBlock}
        />
      )) : (!userDataLoaded && pools.filter(pool=>pool.isFinished === true).length === 0) ?
      ([...Array(skeletons)].map(() => ( 
        <Flex style={{width: '100%', margin: 'auto'}} flexDirection='column'>
          <Row>
            <SkeletonTable style={{width: '20%', marginLeft: '30px'}}><Skeleton width={'90%'} /></SkeletonTable>
            <SkeletonTable style={{width: '10%'}}><Skeleton width={'70%'} /></SkeletonTable>
            <SkeletonTable style={{width: '10%'}}><Skeleton width={'70%'} /></SkeletonTable>
            <SkeletonTable style={{width: '10%'}}><Skeleton width={'70%'} /></SkeletonTable>
            <SkeletonTable style={{width: '10%'}}><Skeleton width={'90%'} /></SkeletonTable>
            <SkeletonTable style={{width: '10%'}}><Skeleton width={'70%'} /></SkeletonTable>
          </Row>
        </Flex>
      ))) :
          <div style={{display: 'flex', alignItems: 'center', width: '100%', flexDirection: 'column'}}>
            <Lottie
                style={{width: 100, height: 100}}
                options={{
                  animationData: animation
                }}
            />
            <p style={{width: '100%', textAlign: 'center', fontSize: '18px', fontWeight: 400}}>{'No farms found'}</p>
          </div>

      }
    </>
  )
}

FarmsPage.Layout = FarmsPageLayout

export default FarmsPage
