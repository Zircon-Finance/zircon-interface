import { Skeleton } from '@pancakeswap/uikit'
import React from 'react'
import { Flex, Text } from 'rebass'
import { useTheme } from 'styled-components'
import { useWindowDimensions } from '../../hooks'
import { ToolTip } from '../../views/Farms/components/FarmTable/Row'

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
    <ToolTip style={hoverPage === 'addLiq' ? {bottom: '140px', left: '260px'} :
      hoverPage === 'removeLiq' ? {bottom: '140px', left: '260px'} :
      hoverPage === 'farmRow' ? {bottom: '55px', left: '-50px'} :
      hoverPage === 'farmAction' ? {bottom: '0px', left: '0px'} :
      hoverPage === 'farmActionMobile' ? {bottom: '50%', left: '20%'} :
      hoverPage === 'tableCard' ? {bottom: '20%', left: '20%'} :
      hoverPage === 'positionCard' && {display: 'none', bottom: '50px', left: width >= 450 ? '70%' : '120px'}
      } show={hoverIndicator}>
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
        {hoverIndicator && (
          <TooltipContentRisk gamma={gamma} health={health} isFloat={isFloat}/>
        )}
        {(!gamma || !health) ? <Skeleton width={60} /> : isFloat ? <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          {!noSpan && <span style={{marginRight: 8, color: theme.text1, fontSize: font && font}}>{`${gamma >= 0.7 ? 'High' : gamma <= 0.4 ? 'Negative' : 'Low'}`}</span>}

              {gamma < 0.4 && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="21" height="15" rx="4.5" stroke="#DEC54E" strokeOpacity="0.9"/>
                <rect x="3" y="3" width="4" height="10" rx="2" fill="#DEC54E" fillOpacity="0.9"/>
              </svg>
              }

              {gamma < 0.7 && gamma >= 0.4 && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="21" height="15" rx="4.5" stroke="#449133" strokeOpacity="0.9"/>
              </svg>}

          {gamma >= 0.7 && <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="21" height="15" rx="4.5" stroke="#DE4337" strokeOpacity="0.9"/>
            <rect x="3" y="3" width="4" height="10" rx="2" fill="#DE4337" fillOpacity="0.9"/>
            <rect x="9" y="3" width="4" height="10" rx="2" fill="#DE4337" fillOpacity="0.9"/>
            <rect x="15" y="3" width="4" height="10" rx="2" fill="#DE4337" fillOpacity="0.9"/>
          </svg>
          }

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
