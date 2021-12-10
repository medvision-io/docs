import {styled} from "@mui/material/styles";
import {MiddlePanel} from "../../common/Panels";
import {H1, H3} from "../../common/Headings";

const delimiterWidth = 15;

export const ApiInfoWrap = MiddlePanel;

export const ApiHeader = styled(H3)`
  margin-top: 0;
  margin-bottom: 0.5em;

`;

export const DownloadButton = styled('a')`
  border: 1px solid ${props => props.theme.palette.primary.main};
  color: ${props => props.theme.palette.primary.main};
  font-weight: normal;
  margin-left: 0.5em;
  padding: 4px 8px 4px;
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
`;

export const InfoSpan = styled('span')`
  &::before {
    content: '|';
    display: inline-block;
    opacity: 0.5;
    width: ${delimiterWidth}px;
    text-align: center;
  }

  &:last-child::after {
    display: none;
  }
`;

export const InfoSpanBoxWrap = styled('div')`
  overflow: hidden;
`;

export const InfoSpanBox = styled('div')`
  display: flex;
  flex-wrap: wrap;
  // hide separator on new lines: idea from https://stackoverflow.com/a/31732902/1749888
  margin-left: -${delimiterWidth}px;
`;
