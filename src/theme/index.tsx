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
    text1: darkMode ? '#FFFFFF' : '#000000',
    text2: darkMode ? '#C3C5CB' : '#000f0f',
    text3: darkMode ?'#6C7284'  : '#000f0f',
    text4: darkMode ?'#565A69'  : '#000f0f',
    text5: darkMode ?'#2C2F36'  : '#000f0f',
    tabsText: chainId !== 1287 ? '#FFF' : darkMode ? '#D5AEAF' : '#945c67',

    // backgrounds / greys
    bg1: chainId !== 1287 ? '#221237' : darkMode ? '#3A1C29' : '#FCFBFC', // Dark purple
    bg2: chainId !== 1287 ? '#221237' : darkMode ? '#3f1f29' : '#FCFBFC', // Light purple
    bg3: '#40444F', // Dark gray221237
    bg4: '#565A69', // Lighter gray
    bg5: '#6C7284',
    // light purple - inputs
    bg6: chainId !== 1287 ? '#534169' : darkMode ? '#492f3a' : '#EFEDEE',
    // darker purple - container
    bg7: chainId !== 1287 ? '#402d58' : darkMode ? '#3c2330' : '#f5f3f3',
    // connect wallet button - dark purple
    bg8: chainId !== 1287 ? '#4a207c' : darkMode ? '#874955' : '#874955',
    // max button - very light purple
    bg9: chainId !== 1287 ? '#443455' : darkMode ? '#634d58' : '#edebeb',
    //modal bg
    bg10: chainId !== 1287 ? '#3c2955' : darkMode ? '#492F3D' : '#f5f3f3',
    //button bg
    bg11: chainId !== 1287 ? '#604C7A' : '#5b4450',
    // hover button
    bg12: chainId !== 1287 ? '#5B4874' : '#634d58',
    // button purple
    bg13: chainId !== 1287 ? '#5F299F' : '#361E2A',
    bg14: chainId !== 1287 ? '#4E386B' : darkMode ? '#592e40' : '#f5f3f3',
    //specialty colors
    modalBG: chainId !== 1287 ? '#3c2955A1' : darkMode ? '#3a1c29a0' : '#FCFCFDA1',
    advancedBG: 'rgba(0,0,0,0.1)',

    //primary colors
    primary1: '#A69BB5',
    primary2: '#A548E9',
    primary3: '#BA73ED',
    primary4: '#A548E970',
    primary5: '#BA73ED70',
    maxButton: chainId !== 1287 ? '#311149' : darkMode ? '#3e1f2e' : '#efe7ee',

    disabled1: chainId !== 1287 ? '#36195A' : darkMode ? '#44232E' : '#dfced2',

    inputSelect1: chainId !== 1287 ? '#A987C2' : darkMode ? '#d5aeaf' : '#a69997',

    navigationTabs: chainId !== 1287 ? '#402D54' : darkMode ? '#583935' : '#e7e2e2',

    navigationBorder: chainId !== 1287 ? '#413055' : darkMode ? '#66393D' : '#e7e2e2',

    anchorFloatBadge: chainId !== 1287 ? '#311f48' : darkMode ? '#442734' : '#eee6e8',

    farmTabsBg: chainId !== 1287 ? '#341853' : darkMode ? '#543334' : '#eae7ed',

    questionMarks: chainId !== 1287 ? '#604C7A' : darkMode ? '#5b434f' : '#F2E9EB',

    slippageActive: chainId !== 1287 ? '#997aaf' : darkMode ? '#9E4D86' : '#a69997',

    walletActive: chainId !== 1287 ? '#25123C' : darkMode ? '#4e3430' : '#edebea',

    hoveredButton: chainId !== 1287 ? '#604C7A' : darkMode ? '#9e4d86' : '#874955',

    poolPinkButton: '#874955',

    pinkGamma: '#CB74B1',

    meatPink: '#D5AEAF',

    farmPoolCardsBg: chainId !== 1287 ? '#3C2955' : darkMode ? '#39202b' : '#eeecf0',

    actionPanelBg: chainId !== 1287 ? '#3C2955' : darkMode ? '#5a2f41' : '#efedee',

    contrastLightButton: chainId !== 1287 ? '#604C7A' : darkMode ? '#582b40' : '#f1ebef',

    darkerContrastPink: chainId !== 1287 ? '#604C7A' : darkMode ? '#412030' : '#f7f2f6',

    cardSmall: chainId !== 1287 ? '#2B1840' : darkMode ? '#361E2A' : '#fcfbfc',
    cardLightBorder: '#f2f0f1',
    cardExpanded: chainId !== 1287 ? '#3C2955' : darkMode ? '#52273a' : '#f2f0f1',
    badgeSmall: chainId !== 1287 ? '#604C7A' : darkMode ? '#442734' : '#f2f0f1',

    positionsButtons: chainId !== 1287 ? '#7a628c' : darkMode ? '#755452' : '#EAE5E8',
    modalBg : chainId !== 1287 ? 'rgba(0,0,0,0.5)' : darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(36, 17, 26, 0.5)',

    liquidityBg: chainId !== 1287 ? '#260B42' : darkMode ? '#331924' : '#F5F3F6',

    walletModal: chainId !== 1287 ? '#3c2955' : darkMode ? '#52273a' : '#fff',

    // color text
    primaryText1: '#ffffff',
    whiteBlackPink: chainId !== 1287 ? '#ffffff' : darkMode ? '#ffffff' : '#9e4d86',

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

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
    colors: {
      backgroundDisabled: "#E9EAEB",
      backgroundAlt: chainId !== 1287 ? '#311f48' : '#4A303E',
      backgroundAlt2: "rgba(255, 255, 255, 0.7)",
      cardBorder: chainId !== 1287 ? '#311f48' : '#361E2A',
      contrast: "#191326",
      dropdown: "#F6F6F6",
      dropdownDeep: "#EEEEEE",
      invertedContrast: chainId !== 1287 ? '#311f48' : darkMode ? '#583834' : '#EAEAEA',
      input: chainId !== 1287 ? '#311f48' : '#4A303E',
      inputSecondary: chainId !== 1287 ? '#311f48' : '#4A303E',
      tertiary: chainId !== 1287 ? '#311f48' : '#4A303E',
      text: "#FFFFFF",
      textDisabled: "#BDC2C4",
      textSubtle: 'rgba(255,255,255,0.5)',
      disabled: chainId !== 1287 ? '#311f48' : '#4A303E',
      success: "#2ECC71",
    },
    card: {
      background: chainId !== 1287 ? '#2B1840' : darkMode ? '#52273a' : '#f5f3f6',
    },
    lightColors: {
      card: chainId !== 1287 ? '#2B1840' : '#361E2A' ,
    },
    darkColors: {
      card: chainId !== 1287 ? '#2B1840' : '#361E2A' ,
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
      focus: chainId !== 1287 ? "0px 0px 0px 1px #311f48, 0px 0px 0px 4px rgba(118, 69, 217, 0.6)" : "0px 0px 0px 1px #4A303E, 0px 0px 0px 4px rgba(74, 48, 62, 0.4)",
      inset: "inset 0px 2px 2px -1px rgba(74, 74, 104, 0.1)",
      tooltip: "0px 0px 2px rgba(0, 0, 0, 0.2), 0px 4px 12px -8px rgba(14, 14, 44, 0.1)",
    },
    // toggle: chainId !== 1287 ? '#311f48' : '#4A303E',
    toggle: {
      handleBackground: chainId !== 1287 ? '#644a7c' : darkMode ? '#d5aeaf' : '#FFF',
    },
    modal: {
      background: chainId !== 1287 ? '#2B1840' : darkMode ? '#361E2A' : '#f1eff1' ,
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
  background: A9A0B4;
}

html,
body {
  margin: 0;
  padding: 0;
  -ms-overflow-style: none; 
  }
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
  ${({ theme }) => theme.chainId !== 1287 ? 
      (theme.darkMode ? (`
        background: rgb(43,12,74);
        background: -moz-radial-gradient(circle, rgba(43,12,74,1) 0%, rgba(34,10,59,1) 100%);
        background: -webkit-radial-gradient(circle, rgba(43,12,74,1) 0%, rgba(34,10,59,1) 100%);
        background: radial-gradient(circle, rgba(43,12,74,1) 0%, rgba(34,10,59,1) 100%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#2B0C4A",endColorstr="#220A3B",GradientType=1);`) 
      : 
      (`background: #371057;`)) 
    :
    (theme.darkMode ? (`
      background: rgb(87,51,46);
      background: -moz-radial-gradient(circle, rgba(87,51,46,1) 0%, rgba(70,41,37,1) 100%);
      background: -webkit-radial-gradient(circle, rgba(87,51,46,1) 0%, rgba(70,41,37,1) 100%);
      background: radial-gradient(circle, rgba(87,51,46,1) 0%, rgba(70,41,37,1) 100%);
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#57332E",endColorstr="#462925",GradientType=1);`
    ) : (`background: #F5F4F4;`)) }
  background-attachment: fixed;

}

`

