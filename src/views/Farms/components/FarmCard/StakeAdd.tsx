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

const StakeAdd : React.FC<StakeAddProps> = ({clickAction, row, margin, width, disabled, pink=false, height, isFinished}) => {
  const theme = useTheme()
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
        disabled={disabled || isFinished}
        onClick={clickAction}
        style={{
          background: pink && theme.pinkGamma,
          padding: row ? "0" : null,
          width: width || "40%",
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
          <svg
            width="34"
            height= {height ? "30" : "34"}
            viewBox="0 0 46 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.75 9.875V36.125"
              stroke={pink ? "#fff" : theme.pinkGamma}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.625 23H35.875"
              stroke={pink ? "#fff" : theme.pinkGamma}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Text style={{ minWidth: "auto", color: pink && "#fff" }}>Stake</Text>
        </Flex>
      </ButtonPinkGamma>
    </div>
  );
}

export default StakeAdd