import {styled} from "@mui/material/styles";

export const Row = styled('div')`
  display: flex;
  width: 100%;
  padding: 0;
  
  ${(props) => props.theme.breakpoints.down("md")} {
    flex-direction: column;
  }
`;
