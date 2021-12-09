import {styled} from "@mui/material/styles";


const MiddlePanel = styled("div")<{ compact?: boolean }>`
  width: calc(100% - 40%);
  padding: 0 ${(props) => props.theme.spacing(4)}px;

  ${({ compact, theme }) =>
  `
    ${(props) => props.theme.breakpoints.down("md")} {
      width: 100%;
      padding: ${`${!!compact ? 0 : theme.spacing(4)}px ${theme.spacing(4)}px`};
    }
  `};
`;

export default MiddlePanel