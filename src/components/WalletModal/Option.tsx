import React from 'react'
import styled from 'styled-components'

const InfoCard = styled.button<{ active?: boolean }>`
  background-color:${({ theme, active }) => active ? 'transparent' : theme.bg14};
  border: ${({ theme, active }) => active ? '1px solid ' + theme.opacitySmall : 'none'};
  padding: 20px !important;
  outline: none;
  display: flex;
  flex-flow: row !important;
  border-radius: 12px;
  width: 100% !important;
  margin: auto;
  &:hover {
    cursor: pointer;
    background: ${({ theme, active }) => active ? theme.bg14 : theme.opacitySmall};
  }
`

const OptionCard = styled(InfoCard as any)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
`

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
  margin: 10px 0 10px 0;
`

const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
  margin-top: 0;
  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
  }
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.pinkGamma};
    border-radius: 50%;
  }
`

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.pinkGamma};
  display: flex;
  justify-content: center;
  align-items: center;
`

const HeaderText = styled.div`
  justify-content: center;
  ${({ theme }) => theme.flexRowNoWrap};
  color: ${({ theme }) => theme.darkMode ? theme.text1 : theme.pinkBrown};
  font-size: 18px;
  font-weight: 500;
`

const SubHeader = styled.div`
  color: ${({ theme }) => theme.whiteHalf};
  margin-top: 10px;
  font-size: 16px;
`

const IconWrapper = styled.div<{ size?: number | null }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    border-radius: 17px;
    height: ${({ size }) => (size ? size + 'px' : '40px')};
    width: ${({ size }) => (size ? size + 'px' : '40px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

export default function Option({
  link = null,
  clickable = true,
  size,
  onClick = null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id
}: {
  link?: string | null
  clickable?: boolean
  size?: number | null
  onClick?: null | (() => void)
  color: string
  header: React.ReactNode
  subheader: React.ReactNode | null
  icon: string
  active?: boolean
  id: string
}) {
  const content = (
    <OptionCardClickable id={id} onClick={onClick} clickable={clickable && !active} active={active}>
      <OptionCardLeft>
        <HeaderText color={color}>
          {active ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ''
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper size={size}>
        <img src={icon} alt={'Icon'} />
      </IconWrapper>
    </OptionCardClickable>
  )

  return content
}
