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
import { useIsDarkMode } from '../state/user/hooks'
import { useActiveWeb3React } from '../hooks'

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

const white = '#FFFFFF'
const black = '#000000'

export function colors(chainId: any, darkMode: boolean): Colors {
  return {
    chainId,
    darkMode,
    // base
    white,
    black,
    whiteHalf: 'rgba(255,255,255,0.5)',

    // text
    text1: '#FFFFFF',
    text2: '#C3C5CB',
    text3: '#6C7284',
    text4: '#565A69',
    text5: '#2C2F36',

    // backgrounds / greys
    bg1: chainId !== 1287 ? '#221237' : '#2E1621', // Dark purple
    bg2: '#020202', //Black
    bg3: '#40444F', // Dark gray
    bg4: '#565A69', // Lighter gray
    bg5: '#6C7284',
    // light purple - inputs
    bg6: chainId !== 1287 ? '#534169' : '#492F3D',
    // darker purple - container
    bg7: chainId !== 1287 ? '#402d58' : '#3c2330',
    // connect wallet button - dark purple
    bg8: chainId !== 1287 ? '#4a207c' : '#874955',
    // max button - very light purple
    bg9: chainId !== 1287 ? '#443455' : '#634d58',
    //modal bg
    bg10: chainId !== 1287 ? '#3c2955' : '#492F3D',
    //button bg
    bg11: chainId !== 1287 ? '#604C7A' : '#5b4450',
    // hover button
    bg12: chainId !== 1287 ? '#5B4874' : '#634d58',
    // button purple
    bg13: '#5F299F',
    bg14: chainId !== 1287 ? '#4E386B' : '#523946',
    //specialty colors
    modalBG: 'rgba(0,0,0,.425)',
    advancedBG: 'rgba(0,0,0,0.1)',

    //primary colors
    primary1: '#A69BB5',
    primary2: '#A548E9',
    primary3: '#BA73ED',
    primary4: '#A548E970',
    primary5: '#BA73ED70',

    disabled1: chainId !== 1287 ? '#36195A' : '#44232E',

    inputSelect1: chainId !== 1287 ? '#A987C2' : '#7D5F77',

    navigationTabs: chainId !== 1287 ? '#402D54' : '#66393D',

    navigationBorder: chainId !== 1287 ? '#413055' : '#66393D',

    anchorFloatBadge: chainId !== 1287 ? '#311f48' : '#4A303E',

    questionMarks: chainId !== 1287 ? '#604C7A' : '#5b434f',

    slippageActive: chainId !== 1287 ? '#997aaf' : '#7d5f76',

    walletActive: chainId !== 1287 ? '#25123C' : '#4e3430',

    cardSmall: chainId !== 1287 ? '#2B1840' : '#361E2A' ,
    cardExpanded: chainId !== 1287 ? '#3C2955' : '#3c2330',

    positionsButtons: chainId !== 1287 ? '#7a628c' : '#503945',

    // color text
    primaryText1: '#ffffff',

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
      cardBorder: "#311f48",
      contrast: "#191326",
      dropdown: "#F6F6F6",
      dropdownDeep: "#EEEEEE",
      invertedContrast: chainId !== 1287 ? '#311f48' : '#4A303E',
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
      background: chainId !== 1287 ? '#2B1840' : '#361E2A' ,
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
      focus: "0px 0px 0px 1px #311f48, 0px 0px 0px 4px rgba(118, 69, 217, 0.6)",
      inset: "inset 0px 2px 2px -1px rgba(74, 74, 104, 0.1)",
      tooltip: "0px 0px 2px rgba(0, 0, 0, 0.2), 0px 4px 12px -8px rgba(14, 14, 44, 0.1)",
    },
    // toggle: chainId !== 1287 ? '#311f48' : '#4A303E',
    toggle: {
      handleBackground: chainId !== 1287 ? '#644a7c' : '#4A303E',
    },
    modal: {
      background: chainId !== 1287 ? '#2B1840' : '#361E2A' ,
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
  font-family: 'Montserrat', sans-serif;
  letter-spacing: -0.018em;
  font-display: fallback;
}
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: 'Montserrat', sans-serif;
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
  background: ${ ({ theme }) => theme.chainId !== 1287 ? 
    (theme.darkMode ? 
      'radial-gradient(42.57% 42.57% at 50% 50%, rgba(44, 9, 90, 0.95) 0%, rgba(29, 8, 51, 0.95) 99.19%);' :
      '#371057;') : 
    (theme.darkMode ? 
      'linear-gradient(180deg, #3C2320 0%, #261715 100%);' :
      '#372E0B;')}
  background-attachment: fixed;

}

`

