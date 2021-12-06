import {styled} from "@mui/material/styles";

import { StyledComponent } from 'styled-components';
import PrismDiv from "../../common/PrismDiv";

export const StyledMarkdownBlock = styled(
  PrismDiv as StyledComponent<
    'div',
    { compact?: boolean; inline?: boolean }
  >,
)`
  font-family: ${props => props.theme.typography.fontFamily};
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  line-height: ${props => props.theme.typography.lineHeight};

  p {
    &:last-child {
      margin-bottom: 0;
    }
  }

  ${({ compact }) =>
    compact &&
    `
    p:first-child {
      margin-top: 0;
    }
    p:last-child {
      margin-bottom: 0;
    }
  `}

  ${({ inline }) =>
    inline &&
    ` p {
    display: inline-block;
  }`}

  h1 {
    ${props => props.theme.typography.h3};
    color: ${props => props.theme.palette.primary.main};
    margin-top: 0;
  }

  h2 {
    ${props => props.theme.typography.h4};
    color: ${props => props.theme.palette.text.primary};
  }

  h3 {
    ${props => props.theme.typography.h5};
    color: ${props => props.theme.palette.text.primary};
  }

  code {
    color: ${({ theme }) => theme.code.color};
    background-color: ${({ theme }) => theme.code.backgroundColor};

    font-family: ${props => props.theme.code.fontFamily};
    border-radius: 2px;
    border: 1px solid rgba(38, 50, 56, 0.1);
    padding: 0 ${({ theme }) => theme.spacing.unit}px;
    font-size: ${props => props.theme.code.fontSize};
    font-weight: ${({ theme }) => theme.code.fontWeight};

    word-break: break-word;
  }

  pre {
    font-family: ${props => props.theme.code.fontFamily};
    white-space: ${({ theme }) => (theme.code.wrap ? 'pre-wrap' : 'pre')};
    background-color: ${({ theme }) => theme.code.backgroundColor};
    color: white;
    padding: ${props => props.theme.spacing.unit * 4}px;
    overflow-x: auto;
    line-height: normal;
    border-radius: 0px;
    border: 1px solid rgba(38, 50, 56, 0.1);

    code {
      background-color: transparent;
      color: white;
      padding: 0;

      &:before,
      &:after {
        content: none;
      }
    }
  }

  blockquote {
    margin: 0;
    margin-bottom: 1em;
    padding: 0 15px;
    color: #777;
    border-left: 4px solid #ddd;
  }

  img {
    max-width: 100%;
    box-sizing: content-box;
  }

  ul,
  ol {
    padding-left: 2em;
    margin: 0;
    margin-bottom: 1em;

    ul,
    ol {
      margin-bottom: 0;
      margin-top: 0;
    }
  }

  table {
    display: block;
    width: 100%;
    overflow: auto;
    word-break: normal;
    word-break: keep-all;
    border-collapse: collapse;
    border-spacing: 0;
    margin-top: 1.5em;
    margin-bottom: 1.5em;
  }

  table tr {
    background-color: #fff;
    border-top: 1px solid #ccc;

    &:nth-child(2n) {
      background-color: ${({ theme }) => theme.schema.nestedBackground};
    }
  }

  table th,
  table td {
    padding: 6px 13px;
    border: 1px solid #ddd;
  }

  table th {
    text-align: left;
    font-weight: bold;
  }
  
  .share-link {
    ${props => props.theme.typography.body2};
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.palette.primary.main};

    &:visited {
      color: ${props => props.theme.palette.primary.main};
    }

    &:hover {
      color: ${props => props.theme.palette.primary.light};
    }
  }
`;
