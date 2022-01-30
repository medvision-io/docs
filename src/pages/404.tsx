import * as React from "react";
import { graphql, Link } from "gatsby";
import { useEffect } from "react";
import { OpenAPI } from "../services/OpenAPI";
import { OpenAPISpec } from "../types/OpenAPISpec";
import Layout from "../components/Layout/Layout";
import semver from "semver";
import { getLatestSemver } from "../utils";

// styles
const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
};

const paragraphStyles = {
  marginBottom: 48,
};
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
};

interface Props {
  data: {
    allOpenapiYaml: {
      nodes: {
        info: {
          version: string;
        };
        openapi: string;
        slug: string;
        spec: string;
      };
    }[];
  };
}

const NotFoundPage = ({ data }: Props) => {
  const {
    allOpenapiYaml: { nodes },
  } = data;
  const latestVerNum = semver.maxSatisfying(
    nodes.map((edge) => edge.info.version),
    "x"
  );
  const latestVer = nodes.find(
    (edge) => edge.info.version === latestVerNum
  );
  const openApiStore = new OpenAPI({
    spec: JSON.parse(latestVer.node.spec || "{}") as any as OpenAPISpec,
    versionSlug: latestVer.node.slug,
  });
  return (
    <Layout openApiStore={openApiStore} selectedVersion={latestVer.node.slug}>
      <main style={pageStyles}>
        <title>Not found</title>
        <h1 style={headingStyles}>Page not found</h1>
        <p style={paragraphStyles}>
          Sorry{" "}
          <span role="img" aria-label="Pensive emoji">
            😔
          </span>{" "}
          we couldn’t find what you were looking for.
          <br />
          {process.env.NODE_ENV === "development" ? (
            <>
              <br />
              Try creating a page in <code style={codeStyles}>src/pages/</code>.
              <br />
            </>
          ) : null}
          <br />
          <Link to="/">Go home</Link>.
        </p>
      </main>
    </Layout>
  );
};
export const pageQuery = graphql`
  query NotFoundPage {
    allOpenapiYaml {
      nodes {
        info {
          version
        }
        openapi
        slug
        spec
      }
    }
  }
`;

export default NotFoundPage;
