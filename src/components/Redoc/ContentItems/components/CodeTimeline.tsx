import * as React from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Collapse } from "@mui/material";

export const Timeline = styled("ul")`
  list-style: none;
  width: 100%;

  li {
    position: relative;
    padding: 2px 10px 10px 18px;

    &:before {
      content: "-|";
      width: 16px;
      height: 16px;
      color: #b6b6b6;
      font-size: 16px;
      white-space: nowrap;
      font-weight: bold;
      position: absolute;
      left: -6px;
      top: 2px;
    }

    &:not(:last-child):after {
      content: "";
      width: 2px;
      height: calc(100% + 12px);
      background: #c7c7c7;
      position: absolute;
      left: -8px;
      top: 14px;
    }
  }
`;

export const CollapsableIcon = styled("svg")`
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  width: 16px;
  height: 16px;
  margin-bottom: -4px;
  display: inline-block;
  fill: currentColor;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-size: 1.5rem;
`;

interface KeyItemProps {
  itemKey: string;
  name?: string;
  onClick?: (key: string) => void;
  selected?: boolean;
}
export const KeyItem = ({ itemKey, name, onClick, selected }: KeyItemProps) => {
  const handleClick = () => {
    if (onClick != null) {
      onClick(itemKey);
    }
  };
  return (
    <Typography
      onClick={handleClick}
      component={"span"}
      sx={{
        cursor: selected != null && onClick != null ? "pointer" : "inherit",
      }}
    >
      {name || itemKey}
      {selected != null && onClick != null && (
        <CollapsableIcon
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium"
          focusable="false"
          viewBox="0 0 24 24"
        >
          {!selected ? (
            <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
          ) : (
            <path d="m12 8-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"></path>
          )}
        </CollapsableIcon>
      )}
    </Typography>
  );
};
