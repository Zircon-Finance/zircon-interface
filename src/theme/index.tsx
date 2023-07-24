//import { transparentize } from 'polished'
//import React, { useMemo } from 'react
import React, { useMemo } from 'react'
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme
} from 'styled-components'
import { Text, TextProps } from 'rebass'
import { Colors } from './styled'
import { useActiveWeb3React } from '../hooks'
import { useIsDarkMode } from '../state/user/hooks'

export * from './components'

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 600,
  upToMedium: 960,
  upToLarge: 1280
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
    (accumulator, size) => {
      ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
        @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
          ${css(a, b, c)}
        }
      `
      return accumulator
    },
    {}
) as any


export function colors(chainId: any, darkMode: boolean): Colors {
  return {
    chainId,
    darkMode,
    // base
    whiteHalf: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',

    white: darkMode ? '#FFFFFF' : '#000000',
    black: darkMode ? '#000000' : '#FFFFFF',

    // text
    text1: darkMode ? 'rgba(255, 255, 255, 0.9)' : '#000000',
    text2: darkMode ? '#C3C5CB' : '#000f0f',
    text3: darkMode ?'#6C7284'  : '#000f0f',
    text4: darkMode ?'#565A69'  : '#000f0f',
    text5: '#9C8D94',
    tabsText: darkMode ? '#6F6F6F' : '#945c67',

    // backgrounds / greys
    bg1: darkMode ? '#16171A' : '#FFFFFF', 
    bg2: darkMode ? '#222328' : '#FCFBFC', // Light purple
    bg3: '#40444F', // Dark gray221237
    bg4: darkMode ? 'rgba(168, 159, 202, 0.07)' : 'rgba(29, 29, 31, 0.05)', // Lighter gray
    bg5: '#6C7284',
    // light purple - inputs
    bg6: darkMode ? '#492f3a' : '#f5f3f6',
    // darker purple - container
    bg7: darkMode ? '#3c2330' : '#f5f3f3',
    // connect wallet button - dark purple
    bg8: darkMode ? '#A89FCA' : '#1D1D1F',
    // max button - very light purple
    bg9: darkMode ? '#2D2E3178' : '#edebeb',
    //modal bg
    bg10: darkMode ? '#492F3D' : '#f5f3f3',
    //button bg
    bg11: '#5b4450',
    // hover button
    bg12: darkMode ? '#A494E1' : '#EAE0E3',
    // button purple
    bg13: '#361E2A',
    bg14: darkMode ? '#2E3036' : '#f5f3f3',
    //specialty colors
    modalBG: darkMode ? '#0F1011D9' : '#F1F0EED9',
    advancedBG: 'rgba(0,0,0,0.05)',

    //primary colors
    primary1: '#A69BB5',
    primary2: '#A548E9',
    primary3: '#BA73ED',
    primary4: '#A548E970',
    primary5: '#BA73ED70',
    maxButton: 'rgba(104, 104, 104, 0.3)',
    maxButtonHover: 'rgba(104, 104, 104, 0.5)' ,

    outlinedHover: darkMode ? '#A89FCA' : '#dfced2',

    disabled1: darkMode ? '#1C1C1C' : 'rgba(168, 159, 202, 0.07)',

    inputSelect1: darkMode ? '#6F6F6F' : '#f5f3f3',

    navigationTabs: darkMode ? '#A89FCA' : '#e7e2e2',

    navigationBorder: darkMode ? '#A89FCA' : '#e7e2e2',

    anchorFloatBadge: darkMode ? '#2E3036' : 'rgba(8, 5, 6, 0.05)',

    questionMarkBg: darkMode ? '#A89FCA' : '#FCFCFD',

    farmTabsBg: darkMode ? '#A89FCA' : '#eae7ed',

    questionMarks: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',

    slippageActive: darkMode ? '#717171' : '#8e8e8e',

    walletActive: darkMode ? '#A89FCA' : '#edebea',

    hoveredButton: darkMode ? '#fff' : '#424242',

    blackBrown: darkMode ? '#222328' : '#222328',

    meatPinkBrown: darkMode ? '#6F6F6F' : '#424242',

    poolPinkButton: '#424242',

    pinkGamma: '#fff',

    meatPink: '#6F6F6F',

    percentageRed: darkMode ? '#E67066' : '#BC2929',

    percentageGreen: darkMode ? '#5CB376' : '#287438',

    pinkBrown : darkMode ? '#6F6F6F' : '#424242',

    farmPoolCardsBg: darkMode ? '#A89FCA' : '#eeecf0',

    actionPanelBg: darkMode ? '#A89FCA' : '#efedee',

    contrastLightButton: darkMode ? '#A89FCA' : '#f1ebef',

    darkerContrastPink: darkMode ? '#A89FCA' : '#f7f2f6',

    cardSmall: darkMode ? '#361E2A' : '#fcfbfc',
    cardLightBorder: '#f2f0f1',
    cardExpanded: darkMode ? '#222328' : '#faf5fc',
    badgeSmall: darkMode ? '#2E3036' : '#E4E2DF',

    changeButtonNormal: darkMode ? 'rgba(168, 159, 202, 0.07)' : 'rgba(29, 29, 31, 0.07)',
    changeButtonHover: darkMode ? 'rgba(168, 159, 202, 0.17)' : 'rgba(29, 29, 31, 0.17)',

    tableButton: darkMode ? '#442233' : '#f1ebf0',

    positionsButtons: darkMode ? '#fff' : '#EAE5E8',
    modalBg : darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(36, 17, 26, 0.5)',

    liquidityBg: darkMode ? '#222328' : '#F1F0EE',

    walletModal: darkMode ? '#222328' : '#fff',
    opacitySmall: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',

    searchInput: darkMode ? '#2E3036' : '#F1F0EE',

    // color text
    primaryText1: '#ffffff',
    whiteBlackPink: darkMode ? '#ffffff' : '#9e4d86',

    // secondary colors
    secondary1: '#2172E5',
    secondary2: '#17000b26',
    secondary3: '#17000b26',

    // other
    red1: '#D75FA3',
    red2: '#702BC4',
    green1: '#572CEE',
    yellow1: '#EEE065',
    yellow2: '#D75FA3',

    colors: {
      backgroundDisabled: darkMode ? "#482C38" : '#F0EDEE',
      backgroundAlt: '#4A303E',
      backgroundAlt2: "rgba(255, 255, 255, 0.7)",
      cardBorder: '#361E2A',
      contrast: "#191326",
      dropdown: "#F6F6F6",
      dropdownDeep: darkMode ? "#5f3c37" : '#6F6F6F',
      invertedContrast: darkMode ? '#51323D' : '#EAEAEA',
      input: '#575757',
      inputSecondary: darkMode ? '#A89FCA' : '#F6F2F4',
      tertiary: '#4A303E',
      text: "#FFFFFF",
      textDisabled: "#BDC2C4",
      textSubtle: 'rgba(255,255,255,0.5)',
      disabled: '#4A303E',
      success: "#2ECC71",
    },
    card: {
      background: darkMode ? '#222328' : '#f5f3f6',
    },
    lightColors: {
      card: '#361E2A' ,
    },
    darkColors: {
      card: '#361E2A' ,
    },

    mediaQueries: {
      xs: `@media screen and (min-width: 370 px)`,
      sm: `@media screen and (min-width: 576 px)`,
      md: `@media screen and (min-width: 852 px)`,
      lg: `@media screen and (min-width: 968 px)`,
      xl: `@media screen and (min-width: 1080px)`,
      xxl: `@media screen and (min-width: 1200 px)`,
      nav: `@media screen and (min-width: 968 px)`,
    },
    radii: {
      small: "4px",
      default: "16px",
      card: "24px",
      circle: "50%",
    },
    tooltip: "0px 0px 2px rgba(0, 0, 0, 0.2), 0px 4px 12px -8px rgba(14, 14, 44, 0.1)",
    shadows: {
      level1: "0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05)",
      active: "0px 0px 0px 1px #0098A1, 0px 0px 4px 8px rgba(31, 199, 212, 0.4)",
      success: "0px 0px 0px 1px #31D0AA, 0px 0px 0px 4px rgba(49, 208, 170, 0.2)",
      warning: "0px 0px 0px 1px #ED4B9E, 0px 0px 0px 4px rgba(237, 75, 158, 0.2)",
      focus: "0px 0px 0px 0px #4A303E, 0px 0px 0px 0px rgba(74, 48, 62, 0.4)",
      inset: "inset 0px 2px 2px -1px rgba(74, 74, 104, 0.1)",
      tooltip: "0px 0px 2px rgba(0, 0, 0, 0.2), 0px 4px 12px -8px rgba(14, 14, 44, 0.1)",
    },
    toggle: {
      handleBackground: darkMode ? '#6F6F6F' : '#FFF',
    },
    modal: {
      background: darkMode ? '#222328' : '#f1eff1' ,
    },
    zIndices: {
      modal: 1000,
    },
  }
}

export function theme(chainId: any,darkMode: boolean): DefaultTheme {
  return {
    ...colors(chainId, darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24
    },

    //shadows
    shadow1: '#000',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const { chainId } = useActiveWeb3React()

  const themeObject = useMemo(() => theme(chainId, darkMode), [chainId,darkMode])

  // @ts-ignore
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'text2'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'primary1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'text1'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  smallerBody(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={13} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={20} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'primary1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'yellow1'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={400} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={400} color={error ? 'red1' : 'text2'} {...props} />
  }
}

export const FixedGlobalStyle = createGlobalStyle`
  html, input, textarea, button {
    font-family: 'DM sans', sans-serif;
    font-display: fallback;
  }
  @supports (font-variation-settings: normal) {
    html, input, textarea, button {
      font-family: 'DM sans', sans-serif;
    }
  }

  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #A9A0B4;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    -ms-overflow-style: none;
  }


  body::-webkit-scrollbar {
    display: none;
  }

  * {
    box-sizing: border-box;
    transition: all 0.1s ease-out;
    scrollbar-width: thin;
  }

  button {
    user-select: none;
  }

  html {
    font-size: 16px;
    font-variant: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

`
//background-color: ${({ theme }) => theme.bg2};
export const ThemedGlobalStyle = createGlobalStyle`
  html {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg2};
  }

  body {
    min-height: 100vh;
    background-repeat: no-repeat;
    background-size: cover;
    color: ${({ theme }) => theme.text1};
    ${({theme}) =>
        (theme.darkMode ? (`
      background: rgb(87,51,46);
      background: #0F1011;`
        ) : (`background: #F1F0EE;`)) }
    background-attachment: fixed;

  }

`

