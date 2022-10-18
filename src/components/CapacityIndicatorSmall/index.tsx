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
    <ToolTip style={
      hoverPage === 'addLiq' ? {bottom: '140px', left: '260px'} :
      hoverPage === 'removeLiq' ? {bottom: '150px', left: '200px'} :
      hoverPage === 'farmRow' ? {bottom: '55px', left: '-50px'} :
      hoverPage === 'farmAction' ? {bottom: width >= 800 ? '0px' : '50px', left: width >= 800 ? '0px' : width <= 500 ? '100px' : '50%'} :
      hoverPage === 'farmActionMobile' ? {bottom: '50%', left: '20%'} :
      hoverPage === 'tableCardTop' ? {bottom:'69%', left: width >= 800 ? '20%' : '30%'} :
      hoverPage === 'tableCardBottom' ? {bottom:'125px', left: width >= 800 ? '20%' : '30%'} :
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
        {(!gamma || !health) ? <Skeleton width={60} /> : isFloat ? <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          {!noSpan && <span style={{marginRight: 8, color: theme.text1, fontSize: font && font}}>{`${gamma >= 0.7 ? 'High' : gamma <= 0.4 ? 'Negative' : 'Low'}`}</span>}

              {gamma < 0.4 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.9143 15.3768L3.76172 6.98145L2.92218 8.79671L21.0748 17.1921L21.9143 15.3768Z" fill="#D8BB2E"/>
                <path d="M19.9609 14.0698C22.1701 14.0698 23.9609 12.279 23.9609 10.0698C23.9609 7.86068 22.1701 6.06982 19.9609 6.06982C17.7518 6.06982 15.9609 7.86068 15.9609 10.0698C15.9609 12.279 17.7518 14.0698 19.9609 14.0698Z" fill="#D8BB2E"/>
                <path d="M11.9989 13L7.37891 21H16.6189L11.9989 13Z" fill="#D8BB2E"/>
                </svg>
              }

              {gamma < 0.7 && gamma >= 0.4 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11H2V13H22V11Z" fill="#449133"/>
                <path d="M18 11C20.2091 11 22 9.20914 22 7C22 4.79086 20.2091 3 18 3C15.7909 3 14 4.79086 14 7C14 9.20914 15.7909 11 18 11Z" fill="#449133"/>
                <path d="M6 11C8.20914 11 10 9.20914 10 7C10 4.79086 8.20914 3 6 3C3.79086 3 2 4.79086 2 7C2 9.20914 3.79086 11 6 11Z" fill="#449133"/>
                <path d="M11.9989 13L7.37891 21H16.6189L11.9989 13Z" fill="#449133"/>
                </svg>
              }

              {gamma >= 0.7 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.9989 13L7.37891 21H16.6189L11.9989 13Z" fill="#DE4337"/>
                <path d="M21.4972 9.28717L1.80469 12.7808L2.15405 14.75L21.8466 11.2564L21.4972 9.28717Z" fill="#DE4337"/>
                <path d="M3.82812 12.3799C5.20884 12.3799 6.32812 11.2606 6.32812 9.87988C6.32812 8.49917 5.20884 7.37988 3.82812 7.37988C2.44741 7.37988 1.32812 8.49917 1.32812 9.87988C1.32812 11.2606 2.44741 12.3799 3.82812 12.3799Z" fill="#DE4337"/>
                </svg>
              }

            </div>
            :
            <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              {!noSpan && <span style={{marginRight: 8, color: theme.text1, fontSize: font && font}}>{`${health === 'low' ? 'Low' : health === 'medium' ? 'Medium' : 'High'}`}</span>}
              {health === "high" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#449133"/>
                <path d="M9.85125 17.2098L5.03125 12.3598L6.45125 10.9498L9.84125 14.3698L17.0312 7.08984L18.4513 8.48984L9.85125 17.2098Z" fill="white"/>
                </svg>
              }
              {health === "medium" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.11 11.55L9.66 13.41L6.21 6.45996L1 9.04996L6.27 17.47L8.84 16.2L12.28 23.12L12.11 11.55Z" fill="#D8BB2E"/>
                <path d="M23.0008 10.7799L19.9708 10.2299L22.8008 2.99988L17.3708 0.879883L14.6908 10.4499L17.3608 11.4899L14.5508 18.6899L23.0008 10.7799Z" fill="#D8BB2E"/>
                </svg>
              }
              {health === "low" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.1294 3.96979C11.5094 3.29979 12.4794 3.29979 12.8594 3.96979L17.4894 11.9998L22.1194 20.0298C22.4994 20.6998 22.0194 21.5298 21.2494 21.5298H2.72943C1.95943 21.5298 1.47943 20.6998 1.85943 20.0298L6.49943 11.9998L11.1294 3.96979Z" fill="#DE4337"/>
                <path d="M12.0217 19.3901C11.6517 19.3901 11.3417 19.2801 11.1117 19.0501C10.8817 18.8201 10.7617 18.5501 10.7617 18.2201C10.7617 17.8901 10.8817 17.6101 11.1117 17.3801C11.3417 17.1501 11.6517 17.0401 12.0217 17.0401C12.3717 17.0401 12.6717 17.1501 12.9017 17.3801C13.1317 17.6101 13.2517 17.8901 13.2517 18.2201C13.2517 18.5501 13.1317 18.8201 12.9017 19.0501C12.6717 19.2801 12.3717 19.3901 12.0217 19.3901ZM11.1317 15.8401L10.9117 8.39014H13.0417L12.8117 15.8401H11.1317Z" fill="white"/>
                </svg>
              }
            </div>
         }
      </Flex>
  )
}

export default CapacityIndicatorSmall
