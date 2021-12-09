import * as React from "react";
import { H1, H2 } from "../../common/Headings";
import { Row } from "../../common/Row";
import MiddlePanel from "../../common/MiddlePanel";
import { ExternalDocumentation } from "../ExternalDocumentation/ExternalDocumentation";
import { ReactElement } from "react";
import { OpenAPI } from "../../../services/OpenAPI";
import { MarkdownRenderer } from "../../../services/MarkdownRenderer";
import { SanitizedMarkdownHTML } from "./SanitizedMdBlock";

interface Props {
  source: any;
  htmlWrap: (el: ReactElement) => ReactElement;
}

export default function AdvancedMarkdown({
  source,
  htmlWrap = (i) => i,
}: Props) {
  // const renderWithOptionsAndStore = (store?: OpenAPI) => {
  //   if (!store) {
  //     throw new Error(
  //       "When using components in markdown, store prop must be provided"
  //     );
  //   }
  //
  //   const renderer = new MarkdownRenderer();
  //   const parts = renderer.renderMdWithComponents(source);
  //
  //   if (!parts.length) {
  //     return null;
  //   }
  //
  //   return parts.map((part, idx) => {
  //     if (typeof part === "string") {
  //       return React.cloneElement(
  //         htmlWrap(
  //           <SanitizedMarkdownHTML html={part} inline={false} compact={false} />
  //         ),
  //         { key: idx }
  //       );
  //     }
  //     return (
  //       <part.component
  //         key={idx}
  //         {...{ ...part.props, ...part.propsSelector(store) }}
  //       />
  //     );
  //   });
  // };
  //
  // return renderWithOptionsAndStore(store);
}
