import * as React from "react";

import { styled } from "@mui/material/styles";
import { MenuListItem } from "../../services/OpenAPI";
import { ReactElement } from "react";

const OperationBadgeElement = styled("span")`
  &.operation-type {
    width: 9ex;
    display: inline-block;
    height: ${(props) => props.theme.typography.h6.fontSize};
    line-height: ${(props) => props.theme.typography.h6.fontSize};
    background-color: #333;
    border-radius: 3px;
    background-repeat: no-repeat;
    background-position: 6px 4px;
    font-size: 7px;
    font-family: Verdana, sans-serif; // web-safe
    color: white;
    text-transform: uppercase;
    text-align: center;
    font-weight: bold;
    vertical-align: middle;
    margin-right: 6px;
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
}

const OperationBadge: React.FC<Props> = ({ item, children }) => {
  return (
    <OperationBadgeElement
      className={`operation-type ${item.isWebhook ? "hook" : item.httpVerb}`}
    >
      {item.isWebhook && "event"}
      {!item.isWebhook && item.httpVerb}
    </OperationBadgeElement>
  );
};

export default OperationBadge;
