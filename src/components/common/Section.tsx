import * as React from "react";
import { styled, ThemedProps } from "@mui/material/styles";
import { Theme } from "@emotion/react";
import { ReactElement, useContext, useEffect, useRef } from "react";
import useOnScreen from "../../utils/useOnScreen";
import { ActionKind, NavigationContext } from "../Layout/NavigationContext";

interface SectionDivProps {
  underlined?: boolean;
  theme?: Theme;
}

export const SectionDiv = styled("div")<SectionDivProps>`
  padding: ${(props) => props.theme.spacing(4)}px 0;

  &:last-child {
    min-height: calc(100vh + 1px);
  }

  & > &:last-child {
    min-height: initial;
  }

  ${(props) => props.theme.breakpoints.down("md")} {
    padding: 0;
  }
  ${(props: SectionDivProps) =>
    (props.underlined &&
      `
    position: relative;

    &:not(:last-of-type):after {
      position: absolute;
      bottom: 0;
      width: 100%;
      display: block;
      content: '';
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }
  `) ||
    ""}
`;

interface SectionProps extends SectionDivProps {
  id?: string;
  underlined?: boolean;
  children: ReactElement;
}

export const Section = ({ id, underlined, children }: SectionProps) => {
  const ref = useRef();
  const [state, dispatch] = useContext(NavigationContext);
  const isVisible = useOnScreen(ref, () => {});

  useEffect(() => {
    if (isVisible) {
      dispatch({
        type: ActionKind.ADD_VISIBLE_ELEMENT,
        value: id,
        field: null,
      });
    } else {
      dispatch({
        type: ActionKind.REMOVE_VISIBLE_ELEMENT,
        value: id,
        field: null,
      });
    }
  }, [isVisible]);
  return (
    <SectionDiv id={id} underlined={underlined} ref={ref}>
      {children}
    </SectionDiv>
  );
};
