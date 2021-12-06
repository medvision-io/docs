import * as React from "react";
import { styled } from "@mui/material/styles";
import { OpenAPIV3_1 } from "openapi-types";

const LinkWrap = styled(({ compact }: { compact: boolean }) => <div />)`
  ${({ compact }) => (!compact ? "margin: 1em 0" : "")}
`;

export class ExternalDocumentation extends React.Component<{
  externalDocs: OpenAPIV3_1.ExternalDocumentationObject;
  compact?: boolean;
}> {
  render() {
    const { externalDocs } = this.props;
    if (!externalDocs || !externalDocs.url) {
      return null;
    }

    return (
      <LinkWrap compact={this.props.compact}>
        <a href={externalDocs.url}>
          {externalDocs.description || externalDocs.url}
        </a>
      </LinkWrap>
    );
  }
}
