import React from 'react'
import { Flex } from 'rebass'

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
}

const CapacityIndicatorSmall: React.FC<Props> = ({gamma, health, isFloat, noSpan}) => {
  return (
      <Flex>
        {isFloat ? <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
           <span style={{marginRight: 8}}>{`${gamma >= 0.7 ? 'Full' : gamma < 0.4 ? 'Empty' : 'Free'}`}</span>

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
              <span style={{marginRight: 8}}>{`${health === 'low' ? 'Low' : health === 'medium' ? 'Medium' : 'High'}`}</span>
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
