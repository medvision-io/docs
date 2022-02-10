import * as React from "react";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import { H1, H2, H3, H4, H5, H6 } from "../../common/Headings";
import { Row } from "../../common/Row";
import { Description } from "../../common/Description";
import { MiddlePanel, RightPanel } from "../../common/Panels";
import { ExternalDocumentation } from "../ExternalDocumentation/ExternalDocumentation";
import { Markdown } from "../Markdown/Markdown";
import OperationBadge from "../../common/OperationBadge";
import AuthorizationItem from "./components/AuthorizationItem";
import PathParametersItem from "./components/PathParametersItem";
import ResponsesItem from "./components/ResponsesItem";
import RequestBodyItem from "./components/RequestBodyItem";
import ExamplesItem from "./components/ExamplesItem";
import CodeItem from "./CodeItem";

interface Props {
  item: any;
}

export const OperationRow = styled(Row)`
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
        <MiddlePanel compact={undefined}>
          <H5>
            <OperationBadge item={item} compact={false} />
            <Link
              href={`#${item.urlId}`}
              sx={{
                textDecorationLine: `${
                  deprecated ? "line-through" : undefined
                }`,
              }}
            >
              {summary}
            </Link>
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
          {item.pathName && (
            <div style={{ maxWidth: "100%", overflowWrap: "anywhere" }}>
              <code
                style={{
                  fontSize: "1rem",
                  maxWidth: "100%",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.pathName}
              </code>
            </div>
          )}
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
        <RightPanel>
          <ExamplesItem requestBody={item.requestBody} type={"request"} />
          <ExamplesItem responses={item.responses} type={"response"} />
          <CodeItem codeSamples={item["x-codeSamples"]} />
        </RightPanel>
      </OperationRow>
    </React.Fragment>
  );
}
