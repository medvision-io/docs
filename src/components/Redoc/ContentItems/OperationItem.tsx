import * as React from "react";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import { H1, H2, H4, H5 } from "../../common/Headings";
import { Row } from "../../common/Row";
import { Description } from "../../common/Description";
import MiddlePanel from "../../common/MiddlePanel";
import { ExternalDocumentation } from "../ExternalDocumentation/ExternalDocumentation";
import { Markdown } from "../Markdown/Markdown";
import OperationBadge from "../../common/OperationBadge";
import Extensions from "./Extensions";
import SecurityRequirements from "./SecurityRequirements";
import Parameters from "./Parameters";
import AuthorizationItem from "./components/AuthorizationItem";
import PathParametersItem from "./components/PathParametersItem";
import ResponsesItem from "./components/ResponsesItem";
import RequestBodyItem from "./components/RequestBodyItem";

interface Props {
  item: any;
}

const OperationRow = styled(Row)`
  backface-visibility: hidden;
  contain: content;
  overflow: hidden;
`;

export default function OperationItem({ item }: Props) {
  const { summary, description, deprecated, externalDocs, isWebhook } = item;
  const hasDescription = !!(description || externalDocs);

  return (
    <React.Fragment>
      <OperationRow>
        <MiddlePanel compact={false}>
          <H5>
            <OperationBadge item={item} compact={false} />
            <Link href={`#${item.id}`} sx={{textDecorationLine: `${deprecated ? 'line-through' : undefined}`}}>{summary}</Link>
            {deprecated && (
              <Chip
                sx={{ ml: 2 }}
                color="warning"
                label="Deprecated"
                size="small"
              />
            )}
            {isWebhook && (
              <Chip
                sx={{ ml: 2 }}
                color="primary"
                label="Webhook"
                size="small"
              />
            )}
          </H5>
          {/*{options.pathInMiddlePanel && !isWebhook && (*/}
          {/*  <Endpoint operation={operation} inverted={true} />*/}
          {/*)}*/}
          {hasDescription && (
            <Description>
              {description !== undefined && <Markdown source={description} />}
              {externalDocs && (
                <ExternalDocumentation externalDocs={externalDocs} />
              )}
            </Description>
          )}
          <AuthorizationItem security={item.security} />
          <PathParametersItem pathParameters={item.pathParameters} />
          <PathParametersItem pathParameters={item.parameters} />
          <RequestBodyItem requestBody={item.requestBody} />
          <ResponsesItem responses={item.responses} />
        </MiddlePanel>
      </OperationRow>
    </React.Fragment>
  );
}
