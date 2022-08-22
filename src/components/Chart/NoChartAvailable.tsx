// import { Flex, Text } from '@pancakeswap/uikit'
import { Text } from 'rebass'
import React  from 'react'
import { useTheme } from 'styled-components'
import Lottie from "lottie-react-web";
import animation from "../../assets/lotties/QKyXCqp6Nm.json";

interface NoChartAvailableProps {
  hasLiquidity?: boolean
  hasOutputToken?: boolean
}

const NoChartAvailable: React.FC<NoChartAvailableProps> = ({ hasLiquidity, hasOutputToken }) => {
  const theme = useTheme()
  return (
        <div style={{margin: 'auto', textAlign: 'center', alignItems: 'center', display: 'flex', height: '100%', flexDirection: 'column'}}>
            <Lottie
                style={{width: "100%"}}
                options={{
                    animationData: animation
                }}
            />
          <Text color={theme.whiteHalf} style={{margin: 'auto'}}>
          {!hasOutputToken && 'Please select a token to view the chart'}
          {!hasLiquidity && 'Not enough data to display this chart!'}
          </Text>
        </div>
  )
}

export default NoChartAvailable
