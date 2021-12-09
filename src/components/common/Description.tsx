import * as React from "react";

import { alpha, styled } from "@mui/material/styles";

export const Description = styled("div")`
  margin-bottom: ${({ theme }) => theme.spacing(6)}px;
`;

export const FieldLabel = styled("span")`
  vertical-align: middle;
  font-size: ${({ theme }) => theme.code.fontSize};
  line-height: 20px;
`;

export const ExampleValue = styled(FieldLabel)`
  border-radius: 2px;
  ${({ theme }) => `
    background-color: ${alpha(theme.palette.text.primary, 0.95)};
    color: ${alpha(theme.palette.text.primary, 0.1)};

    padding: 0 ${theme.spacing(1)}px;
    border: 1px solid ${alpha(theme.palette.text.primary, 0.9)};
    font-family: ${theme.code.fontFamily};
}`};
  & + & {
    margin-left: 0;
  }
`;

export const ExtensionValue = styled(ExampleValue)``;