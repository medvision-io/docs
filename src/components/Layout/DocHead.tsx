import * as React from "react";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";
import { useEffect } from "react";
import { isBrowser } from "../Redoc/Markdown/SanitizedMdBlock";
import { scrollToId } from "../../utils/scrollToId";

interface HeadProps {
  title?: string;
  description?: string;
}

export default function DocHead({ description, title }: HeadProps) {
  const {
    site: {
      siteMetadata: { title: appTitle, description: defaultDescription },
    },
  } = useStaticQuery(graphql`
    query LayoutQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `);

  useEffect(() => {
    if (
      isBrowser() &&
      window.location.hash &&
      window.location.hash.length > 1
    ) {
      let hash = window.location.hash;

      if (hash.charAt(0) === "#") {
        hash = hash.substring(1);
      }

      scrollToId(hash);
    }
  }, []);
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>
        {title ? `${title} | ` : ""}
        {`Docs ${appTitle}`}
      </title>
      <meta name="description" content={description || defaultDescription} />
    </Helmet>
  );
}
