import { FlattenSimpleInterpolation, ThemedCssFunction } from 'styled-components'

export type Color = string
export interface Colors {
  chainId: any
  darkMode: boolean
  // base
  white: Color
  black: Color
  whiteHalf: Color

  // text
  text1: Color
  text2: Color
  text3: Color
  text4: Color
  text5: Color
  tabsText: Color

  // backgrounds / greys
  bg1: Color
  bg2: Color
  bg3: Color
  bg4: Color
  bg5: Color

  // purple-bg-light
  bg6: Color

  //purple-currency-bg
  bg7: Color
  bg8: Color
  bg9: Color
  bg10: Color
  bg11: Color
  bg12: Color
  bg13: Color
  bg14: Color
  maxButton: Color
  modalBg: Color
  hoveredButton: Color

  modalBG: Color
  advancedBG: Color

  //blues
  primary1: Color
  primary2: Color
  primary3: Color
  primary4: Color
  primary5: Color

  disabled1: Color

  inputSelect1: Color

  navigationTabs: Color

  navigationBorder: Color

  anchorFloatBadge: Color

  questionMarks : Color

  slippageActive: Color

  walletActive: Color

  cardSmall: Color
  cardExpanded: Color

  positionsButtons: Color

  primaryText1: Color

  // pinks
  secondary1: Color
  secondary2: Color
  secondary3: Color
  whiteBlackPink: Color
  cardLightBorder: Color

  // other
  red1: Color
  red2: Color
  green1: Color
  yellow1: Color
  yellow2: Color

  colors: {
    [key: string]: Color
  }
  card: {
    [key: string]: Color
  }
  mediaQueries: {
    [key: string]: string
  }
  radii: {
    [key: string]: string
  }
  tooltip: string
  shadows: {
    [key: string]: string
  }
  toggle: {
    [key: string]: string
  }
  lightColors: {
    [key: string]: string
  }
  darkColors: {
    [key: string]: string
  }
  modal: {
    [key: string]: string
  }
  zIndices: {
    [key: string]: number
  }
}

export interface Grids {
  sm: number
  md: number
  lg: number
}

declare module 'styled-components' {
  export interface DefaultTheme extends Colors {
    grids: Grids

    // shadows
    shadow1: string

    // media queries
    mediaWidth: {
      upToExtraSmall: ThemedCssFunction<DefaultTheme>
      upToSmall: ThemedCssFunction<DefaultTheme>
      upToMedium: ThemedCssFunction<DefaultTheme>
      upToLarge: ThemedCssFunction<DefaultTheme>
    }

    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation
  }
}
