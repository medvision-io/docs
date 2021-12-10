import { styled } from "@mui/material/styles";

export const MiddlePanel = styled("div")<{ compact?: boolean }>`
  width: calc(100% - 40%);
  padding: 0 ${(props) => props.theme.spacing(2)};

  ${(props) => props.theme.breakpoints.down("md")} {
    width: 100%;
  }
`;

export const RightPanel = styled('div')`
  width: 40%;
  color: ${({ theme }) => theme.palette.common.white};
  background-color: ${({ theme }) => theme.palette.grey[800]};
  padding: 0 ${(props) => props.theme.spacing(2)};

  ${(props) => props.theme.breakpoints.down("md")} {
    width: 100%;
  }
`;
