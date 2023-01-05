import React, { useState } from "react";
import styled, { useTheme } from "styled-components";
import { darken } from "polished";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useWindowDimensions } from "../../hooks";
import {
  useUserFarmsFilterAnchorFloat,
  useUserFarmsFilterPylonClassic,
  useUserFarmsFinishedOnly,
  useUserFarmsViewMode,
} from "../../state/user/hooks";
import {
  FarmFilter,
  FarmFilterAnchorFloat,
  FarmFinishedOnly,
  ViewMode,
} from "../../state/user/actions";
import CardIcon from "../ViewCardIcon";
import TableIcon from "../ViewTableIcon";

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 12px;
  justify-content: space-evenly;
  padding: 5px;
  margin: auto;
  background: ${({ theme }) => theme.darkMode ? 'rgba(213, 174, 175, 0.07)' : '#E9E5E5'};
`;

const activeClassName = "ACTIVE";

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  letter-spacing: 0.05em;
  font-weight: 400;
  justify-content: center;
  height: auto;
  border-radius: 7px;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.tabsText};
  font-size: 13px;
  padding: 6px 10px;
  width: 50%;

  &.${activeClassName} {
    border-radius: 7px;
    z-index: 1;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.darkMode ? 'rgba(213, 174, 175, 0.3)' : '#FCFBFC'};
    box-shadow: ${({ theme }) => theme.darkMode ? '0px 1px 1px rgba(58, 28, 41, 0.25), inset 0px 1px 1px rgba(213, 174, 175, 0.25)' : 
    '0px 1px 2px 0px rgba(0,0,0,0.15)'};
    svg {
      path {
        stroke: ${({ theme }) => theme.darkMode && '#fff'};
        stroke-opacity: 1;
      }
    }
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
  @media (min-width: 700px) {
    width: auto;
  }
`;

// DropDown menu is a menu that appears with an animation when the user hovers over the tab
const DropdownMenu = styled.div<{active}>`
  position: absolute;
  top: 45px;
  z-index: 0;
  width: 90px;
  background: ${({ theme }) => theme.darkMode ? '#5a3934' : '#E9E5E5'};
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 5px 0;
  margin-left: 66px;
  opacity: ${({ active }) => (active ? 1 : 0)};
  visibility: ${({ active }) => (active ? "visible" : "hidden")};
  transform: ${({ active }) => (active ? "translateY(0)" : "translateY(-10px)")};
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out,
    visibility 0.2s ease-in-out;
`;

export function PylonClassicTab({ active }: { active: "PYLON" | "CLASSIC" }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const [
    filter,
    setuserFarmsFilterPylonClassic,
  ] = useUserFarmsFilterPylonClassic();

  const [, setuserFarmsFilterAnchorFloat] = useUserFarmsFilterAnchorFloat();

  return (
    <Tabs
      style={{ marginRight: "10px", width: width >= 700 ? "auto" : "100%" }}
    >
      <StyledNavLink
        id={`pylon-select-tab`}
        to={"#"}
        onClick={() => {
          setuserFarmsFilterPylonClassic(FarmFilter.PYLON);
          setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.ALL);
        }}
        isActive={() => filter === FarmFilter.PYLON}
      >
        {t("PYLON")}
      </StyledNavLink>
      <StyledNavLink
        style={{cursor: 'not-allowed'}}
        id={`classic-select-tab`}
        to={"#"}
        // onClick={() => {
        //   setuserFarmsFilterPylonClassic(FarmFilter.CLASSIC);
        //   setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.ALL);
        // }}
        isActive={() => filter === FarmFilter.CLASSIC}
      >
        {t("CLASSIC")}
      </StyledNavLink>
    </Tabs>
  );
}

export function AnchorFloatTab({
  active,
}: {
  active: "ALL" | "STABLE" | "FLOAT";
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [
    filter,
    setuserFarmsFilterAnchorFloat,
  ] = useUserFarmsFilterAnchorFloat();
  const [, setuserFarmsFilterPylonClassic] = useUserFarmsFilterPylonClassic();

  return (
    <Tabs style={{ width: width >= 700 ? "auto" : "100%" }}>
      <StyledNavLink
        id={`all-select-tab`}
        to={"#"}
        onClick={() => {
          setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.ALL);
        }}
        isActive={() => filter === FarmFilterAnchorFloat.ALL}
      >
        {t("ALL")}
      </StyledNavLink>
      <StyledNavLink
        id={`anchor-select-tab`}
        to={"#"}
        onClick={() => {
            setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.ANCHOR);
            setuserFarmsFilterPylonClassic(FarmFilter.PYLON);
        }}
        isActive={() => filter === FarmFilterAnchorFloat.ANCHOR}
      >
        {t("STABLE")}
      </StyledNavLink>
      <StyledNavLink
        id={`float-select-tab`}
        to={"#"}
        onClick={() => {
            setuserFarmsFilterAnchorFloat(FarmFilterAnchorFloat.FLOAT);
            setuserFarmsFilterPylonClassic(FarmFilter.PYLON);
        }}
        isActive={() => filter === FarmFilterAnchorFloat.FLOAT}
      >
        {t("FLOAT")}
      </StyledNavLink>
    </Tabs>
  );
}

export function ViewModeTabs({ active }: { active: "TABLE" | "CARD" }) {
  const [viewMode, setViewMode] = useUserFarmsViewMode();
  const theme = useTheme();
  return (
    <div style={{ width: "100%" }}>
      <Tabs style={{ background: theme.darkMode ? '#452632' : '#EEEBEC', width: "70px", margin: "0" }}>
        <StyledNavLink
          style={{ padding: "5px", background: (theme.darkMode && viewMode === ViewMode.TABLE) && '#704F57'}}
          id={`anchor-select-tab`}
          to={"#"}
          onClick={() => {
            setViewMode(ViewMode.TABLE);
          }}
          isActive={() => viewMode === ViewMode.TABLE}
        >
          <TableIcon />
        </StyledNavLink>
        <StyledNavLink
          style={{ padding: "5px", background: (theme.darkMode && viewMode === ViewMode.CARD) && '#704F57'}}
          id={`all-select-tab`}
          to={"#"}
          onClick={() => {
            setViewMode(ViewMode.CARD);
          }}
          isActive={() => viewMode === ViewMode.CARD}
        >
          <CardIcon />
        </StyledNavLink>
      </Tabs>
    </div>
  );
}

export function FarmTabButtons({ active }: { active: "Active" | "Finished" }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [finished, setFinished] = useUserFarmsFinishedOnly();
  const [hovered, setHovered] = useState(false);

  return (
    <Tabs style={{ padding: "5px", width: width >= 700 ? "auto" : "100%" }}>
      <StyledNavLink
        id={`live-farms-select`}
        to={"/farm"}
        onClick={() => {
          setFinished(FarmFinishedOnly.FALSE);
        }}
        isActive={() => finished === FarmFinishedOnly.FALSE}
      >
        {t("ACTIVE")}
      </StyledNavLink>
      <StyledNavLink
        id={`finished-farms-select`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        to={"/farm"}
        onClick={() => {
          setFinished(FarmFinishedOnly.TRUE);
        }}
        isActive={() => finished === FarmFinishedOnly.TRUE ? true : finished === FarmFinishedOnly.ARCHIVED ? true : false}
      >
        {finished === FarmFinishedOnly.TRUE ? 'FINISHED' : finished === FarmFinishedOnly.ARCHIVED ? 'ARCHIVED' : 'FINISHED'}
      </StyledNavLink>
      <DropdownMenu active={hovered}>
        <StyledNavLink
          id={`archived-farms-select`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          to={"/farm"}
          onClick={() => {
            setFinished(finished === FarmFinishedOnly.ARCHIVED ? FarmFinishedOnly.TRUE : FarmFinishedOnly.ARCHIVED);
          }}
          isActive={() => false}
          style={{width: '100%'}}
        >
          {finished === FarmFinishedOnly.ARCHIVED ? 'FINISHED' : finished === FarmFinishedOnly.TRUE ? 'ARCHIVED' : 'ARCHIVED'}
        </StyledNavLink>
      </DropdownMenu>
    </Tabs>
  );
}
