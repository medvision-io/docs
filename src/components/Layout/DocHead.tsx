import * as React from "react";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";

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
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>
        {title ? `${title} |` : ''}{`Docs ${appTitle}`}
      </title>
      <meta name="description" content={description || defaultDescription} />
    </Helmet>
  );
}
