import * as React from "react";

import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import { MenuListItem } from "../../services/OpenAPI";

const OperationBadgeElement = styled(Typography)<TypographyProps>`
  &.operation-type {
    width: 9ex;
    display: inline-block;
    height: 32px;
    line-height: 32px;
    background-color: #333;
    border-radius: 3px;
    background-repeat: no-repeat;
    background-position: 6px 4px;
    font-size: 16px;
    font-family: Verdana, sans-serif; // web-safe
    color: white;
    text-transform: uppercase;
    text-align: center;
    font-weight: bold;
    vertical-align: middle;
    margin-right: 6px;
    margin-top: 0;
  }

  &.operation-type--compact {
    height: 18px;
    line-height: 18px;
    font-size: 7px;
    margin-top: 2px;
  }

  &.get {
    background-color: ${(props) => props.theme.colors.http.get};
  }

  &.post {
    background-color: ${(props) => props.theme.colors.http.post};
  }

  &.put {
    background-color: ${(props) => props.theme.colors.http.put};
  }

  &.options {
    background-color: ${(props) => props.theme.colors.http.options};
  }

  &.patch {
    background-color: ${(props) => props.theme.colors.http.patch};
  }

  &.delete {
    background-color: ${(props) => props.theme.colors.http.delete};
  }

  &.basic {
    background-color: ${(props) => props.theme.colors.http.basic};
  }

  &.link {
    background-color: ${(props) => props.theme.colors.http.link};
  }

  &.head {
    background-color: ${(props) => props.theme.colors.http.head};
  }

  &.hook {
    background-color: ${(props) => props.theme.palette.secondary.main};
  }
`;

interface Props {
  item: MenuListItem;
  compact?: boolean;
}

const OperationBadge: React.FC<Props> = ({
  item,
  compact = true,
  ...otherProps
}) => {
  return (
    <OperationBadgeElement
      variant="body1"
      component="span"
      className={`operation-type ${item.isWebhook ? "hook" : item.httpVerb} ${
        compact ? "operation-type--compact" : ""
      }`}
      {...otherProps}
    >
      {item.isWebhook && "event"}
      {!item.isWebhook && item.httpVerb}
    </OperationBadgeElement>
  );
};

export default OperationBadge;
