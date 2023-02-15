import { Skeleton } from '@pancakeswap/uikit'
import React from 'react'
import { Flex, Text } from 'rebass'
import { useTheme } from 'styled-components'
import { useWindowDimensions } from '../../hooks'
import { HealthFactorParams } from '../../state/mint/pylonHooks'
import { ToolTip } from '../../views/Farms/components/FarmTable/Row'
import CapacityIndicatorDivergenceGreen from '../CapacityIndicatorDivergenceGreen'
import CapacityIndicatorDivergenceRed from '../CapacityIndicatorDivergenceRed'
import CapacityIndicatorDivergenceYellow from '../CapacityIndicatorDivergenceYellow'

// const Battery = styled.div`
//   height: 15px;
//   width: 20px;
//   border-radius: 5px;
//   margin-left: 5px;
//   margin-top: 2px;
//   align-self: center;
// `

interface Props {
  gamma?: any
  health?: HealthFactorParams
  isFloat?: boolean
  noSpan?: boolean
  hoverPage?: string
  font? : string
  showHover?: boolean
  currencies: any[]
}

const CapacityIndicatorSmall: React.FC<Props> = ({gamma, health, isFloat, noSpan, hoverPage, font, showHover=true, currencies}) => {
  const [hoverIndicator, setHoverIndicator] = React.useState(false);
  const theme = useTheme()
  const {width} = useWindowDimensions()

  const TooltipContentRisk: React.FC<Props> = ({gamma, health, isFloat}) => {
    console.log('Anchor decimals: ', currencies)
    return (
    <ToolTip style={
      hoverPage === 'addLiq' ? {bottom: '140px', left: '260px'} :
      hoverPage === 'removeLiq' ? {bottom: '150px', left: '200px'} :
      hoverPage === 'farmRow' ? {bottom: '55px', left: '-50px'} :
      hoverPage === 'farmAction' ? {bottom: width >= 800 ? '0px' : '50px', left: width >= 800 ? '700px' : width <= 500 ? '100px' : '50%'} :
      hoverPage === 'farmActionMobile' ? {bottom: '50%', left: '20%'} :
      hoverPage === 'tableCardTop' ? {bottom: '69%', left: width >= 800 ? '20%' : '30%'} :
      hoverPage === 'tableCardBottom' ? {bottom: '125px', left: width >= 800 ? '20%' : '30%'} :
      hoverPage === 'positionCard' && {display: 'none', bottom: '50px', left: width >= 450 ? '70%' : '120px'}
      } show={hoverIndicator && showHover && (gamma !== undefined || health !== undefined)}>
        <Text fontSize='13px' fontWeight={500} color={theme.text1}>
            {isFloat ? gamma >= 110 ? 'The vault has zero or negative impermanent loss to encourage new liquidity.' :
            (gamma > 90 && gamma < 110) ? 'The Float vault is balanced, you will have very little impermanent loss' :
            gamma <= 90 && 'The vault is suffering heavy impermanent loss, you will gain less than expected.' :
            `${health?.healthFactor?.toString()?.toLowerCase() === "high" ?  'The vault is in normal operating conditions, all good.' :
            health?.healthFactor?.toString()?.toLowerCase() === "medium" ? 'The vault is under stress, the risks of joining it are high.' :
            health?.healthFactor?.toString()?.toLowerCase() === "low" && 'The vault is in critical condition, joining it is dangerous and might result in loss of funds.'}
            `}
        </Text>
        {!isFloat && 
        <Flex flexDirection={'column'} style={{background: theme.darkMode ? '#653047' : '#EAE7E8', borderRadius: '17px', borderTopLeftRadius: '0px', borderTopRightRadius: '0px', gap: '5px',
        margin: '5px -10px -10px -10px', padding: '0 10px 10px 10px'}}>
          <Flex justifyContent={'space-between'}>
            <Text style={{width: '60%'}} mt={'10px'} fontSize='13px' fontWeight={500} color={theme.text1}>
              {`Omega (reduction factor for this pool):`}
            </Text>
            <Text mt={'10px'} fontSize='13px' fontWeight={500} color={theme.text1}>
                {`${((1-(parseFloat(health?.omega?.toString()) / Math.pow(10, 18)))*100).toFixed(0)} %`}
            </Text>
          </Flex>
          <Flex justifyContent={'space-between'}>
            <Text style={{width: '60%'}} mt={'10px'} fontSize='13px' fontWeight={500} color={theme.text1}>
                {`Max withdrawal without suffering any Omega:`}
            </Text>
            <Text mt={'10px'} fontSize='13px' fontWeight={500} color={theme.text1} textAlign={'right'}>
                {`${(parseFloat(health?.maxNoOmega?.toString()) / Math.pow(10, currencies[1]?.decimals)).toFixed(3)} (${(parseFloat(health?.maxOfVab?.toString()) / Math.pow(10, 18)).toFixed(2)}%)`}
            </Text>
          </Flex>
        </Flex>}
    </ToolTip>
)}
  return (
      <Flex onMouseEnter={() => setHoverIndicator(true)}
            onMouseLeave={() => setHoverIndicator(false)}
            style={{cursor: 'pointer'}}>
        {hoverIndicator && showHover && (gamma !== undefined || health !== undefined) && (
          <TooltipContentRisk gamma={gamma} health={health} isFloat={isFloat} currencies={currencies} />
        )}
        {(!gamma || !health) ? <Skeleton width={60} /> : isFloat ? <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}>
          {gamma >= 110 && <CapacityIndicatorDivergenceYellow hover={hoverIndicator}/>}
          {gamma > 90 && gamma < 110 && <CapacityIndicatorDivergenceGreen hover={hoverIndicator}/>}
          {gamma <= 90 && <CapacityIndicatorDivergenceRed hover={hoverIndicator}/>}
          {!noSpan && <span style={{marginRight: 4,marginLeft: 8, color: theme.text1, fontSize: font && font}}>{`${(100-parseFloat(gamma)).toFixed(0)}%`}</span>}
          </div>
            :
            <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              {!noSpan && <span style={{marginRight: 8, color: theme.text1, fontSize: font && font}}>
                {`${health?.healthFactor?.toString()?.toLowerCase() === 'low' ? 'Low' : health?.healthFactor?.toString()?.toLowerCase() === 'medium' ? 'Medium' : 'High'}`}</span>}
              {health?.healthFactor?.toString()?.toLowerCase() === "high" && <svg  width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="10" width="6" height="6" rx="3" fill="#449133" fillOpacity="0.9"/>
                <rect x="16" width="6" height="16" rx="3" fill="#449133" fillOpacity="0.9"/>
                <rect x="8" y="5" width="6" height="11" rx="3" fill="#449133" fillOpacity="0.9"/>
              </svg>
              }
              {health?.healthFactor?.toString()?.toLowerCase() === "medium" && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="10" width="6" height="6" rx="3" fill="#DEC54E" fillOpacity="0.9"/>
                <rect x="16" width="6" height="16" rx="3" fill="#9C8F95" fillOpacity="0.25"/>
                <rect x="8" y="5" width="6" height="11" rx="3" fill="#DEC54E" fillOpacity="0.9"/>
              </svg>
              }
              {health?.healthFactor?.toString()?.toLowerCase() === "low" && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="10" width="6" height="6" rx="3" fill="#DE4337" fillOpacity="0.9"/>
                <rect x="16" width="6" height="16" rx="3" fill="#9C8F95" fillOpacity="0.25"/>
                <rect x="8" y="5" width="6" height="11" rx="3" fill="#9C8F95" fillOpacity="0.25"/>
              </svg>
              }
            </div>
         }
      </Flex>
  )
}

export default CapacityIndicatorSmall
