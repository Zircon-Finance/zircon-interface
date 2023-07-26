import React from 'react'
import { Flex, Text } from 'rebass'
import { useTheme } from 'styled-components'
import { ButtonPinkGamma } from '../../../../components/Button'

interface StakeAddProps {
  row: boolean
  margin?: boolean
  width? : string
  clickAction? :  any
  onClick? : () => void
  disabled? : boolean
  pink? : boolean
  height? : string
  isFinished: boolean
}

const StakeAdd : React.FC<StakeAddProps> = ({clickAction, row, margin, width, disabled, height, isFinished}) => {
  const theme = useTheme()
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        pointerEvents: disabled ? "none" : "auto",
      }}
      onClick={clickAction}
    >
      <ButtonPinkGamma
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        disabled={disabled || isFinished}
        onClick={clickAction}
        style={{
          background: theme.darkMode ? hovered ? '#BBB4D6' : '#A89FCA' : hovered ? '#363639' : '#1D1D1F',
          padding: row ? "0" : null,
          width: width || "30%",
          margin: margin ? "auto 0 auto 0" : "auto",
          height: height && height,
          borderRadius: height && '12px',
        }}
      >
        <Flex
          justifyContent={"space-between"}
          flexDirection={row ? "row" : "column"}
          alignItems={"center"}
        >
        <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 11V4H11V11H4V12H11V19H12V12H19V11H12Z" fill={theme.darkMode ? '#1D1D1F' : '#FFF'}/>
        </svg>
          <Text style={{ minWidth: "auto", color: theme.darkMode ? '#1D1D1F' : '#fff', fontSize: '16px', fontWeight: 500 }}>Stake</Text>
        </Flex>
      </ButtonPinkGamma>
    </div>
  );
}

export default StakeAdd