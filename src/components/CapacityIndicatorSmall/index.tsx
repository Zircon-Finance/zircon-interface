import { Skeleton } from '@pancakeswap/uikit'
import React from 'react'
import { Flex, Text } from 'rebass'
import { useTheme } from 'styled-components'
import { useWindowDimensions } from '../../hooks'
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
  health?: string
  isFloat?: boolean
  noSpan?: boolean
  hoverPage?: string
  font? : string
}

const CapacityIndicatorSmall: React.FC<Props> = ({gamma, health, isFloat, noSpan, hoverPage, font}) => {
  const [hoverIndicator, setHoverIndicator] = React.useState(false);
  const theme = useTheme()
  const {width} = useWindowDimensions()
  const TooltipContentRisk: React.FC<Props> = ({gamma, health, isFloat}) => {return (
    <ToolTip style={
      hoverPage === 'addLiq' ? {bottom: '140px', left: '260px'} :
      hoverPage === 'removeLiq' ? {bottom: '150px', left: '200px'} :
      hoverPage === 'farmRow' ? {bottom: '55px', left: '-50px'} :
      hoverPage === 'farmAction' ? {bottom: width >= 800 ? '0px' : '50px', left: width >= 800 ? '0px' : width <= 500 ? '100px' : '50%'} :
      hoverPage === 'farmActionMobile' ? {bottom: '50%', left: '20%'} :
      hoverPage === 'tableCardTop' ? {bottom: '69%', left: width >= 800 ? '20%' : '30%'} :
      hoverPage === 'tableCardBottom' ? {bottom: '125px', left: width >= 800 ? '20%' : '30%'} :
      hoverPage === 'positionCard' && {display: 'none', bottom: '50px', left: width >= 450 ? '70%' : '120px'}
      } show={hoverIndicator && (gamma !== undefined || health !== undefined)}>
        <Text fontSize='13px' fontWeight={500} color={theme.text1}>
            {isFloat ? gamma < 0.4 ? 'The vault has zero or negative impermanent loss to encourage new liquidity.' :
            (gamma < 0.7 && gamma >= 0.4) ? 'The Float vault is balanced, you will have very little impermanent loss' :
            gamma >= 0.7 && 'The vault is suffering heavy impermanent loss, you will gain less than expected.' :
            health === "high" ? 'The vault is in normal operating conditions, all good.' :
            health === "medium" ? 'The vault is under stress, the risks of joining it are high.' :
            health === "low" && 'The vault is temporarily limiting withdrawal claims. Joining it is dangerous and might result in loss of funds.' 
            }
        </Text>
    </ToolTip>
)}
  return (
      <Flex onMouseEnter={() => setHoverIndicator(true)}
            onMouseLeave={() => setHoverIndicator(false)}
            style={{cursor: 'pointer'}}>
        {hoverIndicator && (gamma !== undefined || health !== undefined) && (
          <TooltipContentRisk gamma={gamma} health={health} isFloat={isFloat}/>
        )}
        {(!gamma || !health) ? <Skeleton width={60} /> : isFloat ? <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}>
          {gamma < 0.4 && <CapacityIndicatorDivergenceYellow />}
          {gamma < 0.7 && gamma >= 0.4 && <CapacityIndicatorDivergenceGreen />}
          {gamma >= 0.7 && <CapacityIndicatorDivergenceRed />}
          {!noSpan && <span style={{marginRight: 4,marginLeft: 8, color: theme.text1, fontSize: font && font}}>{`${parseFloat(gamma).toFixed(1)}`}</span>}
          </div>
            :
            <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              {!noSpan && <span style={{marginRight: 8, color: theme.text1, fontSize: font && font}}>{`${health === 'low' ? 'Low' : health === 'medium' ? 'Medium' : 'High'}`}</span>}
              {health === "high" && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="10" width="6" height="6" rx="3" fill="#449133" fillOpacity="0.9"/>
                <rect x="16" width="6" height="16" rx="3" fill="#449133" fillOpacity="0.9"/>
                <rect x="8" y="5" width="6" height="11" rx="3" fill="#449133" fillOpacity="0.9"/>
              </svg>
              }
              {health === "medium" && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="10" width="6" height="6" rx="3" fill="#DEC54E" fillOpacity="0.9"/>
                <rect x="16" width="6" height="16" rx="3" fill="#9C8F95" fillOpacity="0.25"/>
                <rect x="8" y="5" width="6" height="11" rx="3" fill="#DEC54E" fillOpacity="0.9"/>
              </svg>
              }
              {health === "low" && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
