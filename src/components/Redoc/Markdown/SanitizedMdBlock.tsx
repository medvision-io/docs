import * as DOMPurify from "dompurify";
import * as React from "react";

import { StylingMarkdownProps } from "./Markdown";
import { StyledMarkdownBlock } from "./styled.elements";

const StyledMarkdownSpan = StyledMarkdownBlock.withComponent("span");

const sanitize = (untrustedSpec, html) =>
  untrustedSpec ? DOMPurify.sanitize(html) : html;

export function SanitizedMarkdownHTML(
  props: StylingMarkdownProps & {
    html: string;
    className?: string;
    "data-role"?: string;
    untrustedSpec?: boolean
  }
) {
  const Wrap = props.inline ? StyledMarkdownSpan : StyledMarkdownBlock;
  const untrustedSpec = props.untrustedSpec != null ? props.untrustedSpec : false;

  return (
    <Wrap
      className={"redoc-markdown " + (props.className || "")}
      dangerouslySetInnerHTML={{
        __html: sanitize(untrustedSpec, props.html),
      }}
      data-role={props["data-role"]}
      {...props}
    />
  );
}
