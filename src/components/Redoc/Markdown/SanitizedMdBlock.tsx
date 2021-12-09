import * as DOMPurify from "dompurify";
import * as React from "react";

import { StylingMarkdownProps } from "./Markdown";
import { StyledMarkdownBlock } from "./styled.elements";

const StyledMarkdownSpan = StyledMarkdownBlock.withComponent("span");
const isBrowser = () => typeof window !== "undefined"
let sanitize = (untrustedSpec, html) => html;

export function SanitizedMarkdownHTML(
  props: StylingMarkdownProps & {
    html: string;
    className?: string;
    "data-role"?: string;
    untrustedSpec?: boolean
  }
) {
  const Wrap = props.inline ? StyledMarkdownSpan : StyledMarkdownBlock;
  const untrustedSpec = props.untrustedSpec != null ? props.untrustedSpec : true;

  if(isBrowser()) {
    const domPurify = DOMPurify(window)
    sanitize = (untrustedSpec, html) =>
      untrustedSpec ? domPurify.sanitize(html) : html;
  }

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
