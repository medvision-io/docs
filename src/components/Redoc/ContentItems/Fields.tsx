import { styled, alpha } from "@mui/material/styles";

import { PropertyNameCell } from "./PropertyField";

export const ClickablePropertyNameCell = styled(PropertyNameCell)`
  button {
    background-color: transparent;
    border: 0;
    outline: 0;
    font-size: 13px;
    font-family: ${(props) => props.theme.code.fontFamily};
    cursor: pointer;
    padding: 0;
    color: ${(props) => props.theme.palette.text.primary};
    &:focus {
      font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    }
  }
`;

export const FieldLabel = styled("span")`
  vertical-align: middle;
  font-size: ${({ theme }) => theme.code.fontSize};
  line-height: 20px;
`;

export const TypePrefix = styled(FieldLabel)`
  color: ${(props) => alpha(props.theme.schema.typeNameColor, 0.1)};
`;

export const TypeName = styled(FieldLabel)`
  color: ${(props) => props.theme.schema.typeNameColor};
`;

export const TypeTitle = styled(FieldLabel)`
  color: ${(props) => props.theme.schema.typeTitleColor};
  word-break: break-word;
`;

export const TypeFormat = TypeName;

export const RequiredLabel = styled(FieldLabel.withComponent("div"))`
  color: ${(props) => props.theme.schema.requireLabelColor};
  font-size: ${(props) => props.theme.schema.labelsTextSize};
  font-weight: normal;
  margin-left: 20px;
  line-height: 1;
`;

export const RecursiveLabel = styled(FieldLabel)`
  color: ${({ theme }) => theme.colors.warning.main};
  font-size: 13px;
`;

export const PatternLabel = styled(FieldLabel)`
  color: #0e7c86;
  &::before,
  &::after {
    font-weight: bold;
  }
`;

export const ExampleValue = styled(FieldLabel)`
  border-radius: 2px;
  ${({ theme }) => `
    background-color: ${alpha(theme.palette.text.primary, 0.95)};
    color: ${alpha(theme.palette.text.primary, 0.1)};

    padding: 0 ${theme.spacing.unit}px;
    border: 1px solid ${alpha(theme.palette.text.primary, 0.9)};
    font-family: ${theme.code.fontFamily};
}`};
  & + & {
    margin-left: 0;
  }
`;

export const ExtensionValue = styled(ExampleValue)``;

export const ConstraintItem = styled(FieldLabel)`
  border-radius: 2px;
  ${({ theme }) => `
    background-color: ${alpha(theme.palette.primary.light, 0.95)};
    color: ${alpha(theme.palette.primary.main, 0.1)};

    margin: 0 ${theme.spacing(1)}px;
    padding: 0 ${theme.spacing(1)}px;
    border: 1px solid ${alpha(theme.palette.primary.main, 0.9)};
    font-family: ${theme.code.fontFamily};
}`};
  & + & {
    margin-left: 0;
  }
`;

export const ToggleButton = styled("button")`
  background-color: transparent;
  border: 0;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-left: ${({ theme }) => theme.spacing(1)}px;
  border-radius: 2px;
  cursor: pointer;
  outline-color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 12px;
`;
