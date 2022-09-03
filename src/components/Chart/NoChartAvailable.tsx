// import { Flex, Text } from '@pancakeswap/uikit'
import { Text } from 'rebass'
import React  from 'react'
import { useTheme } from 'styled-components'
import Lottie from "lottie-react-web";
import animation from "../../assets/lotties/7uOcp6IXze.json";

interface NoChartAvailableProps {
  hasLiquidity?: boolean
  hasOutputToken?: boolean
}

const NoChartAvailable: React.FC<NoChartAvailableProps> = ({ hasLiquidity, hasOutputToken }) => {
  const theme = useTheme()
    // const [isShown, setIsShown] = useState(false);

    return (
        <div
            style={{margin: 'auto', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', height: '100%', flexDirection: 'column'}}>
            <Lottie
                direction={-1}
                style={{width: "100%", borderWidth: 2}}
                options={{
                    animationData: animation,
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
