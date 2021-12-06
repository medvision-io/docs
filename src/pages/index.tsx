import * as React from "react";
import { graphql } from "gatsby";
import semver from "semver";
import Layout from "../components/Layout/Layout";
import { OpenAPI } from "../services/OpenAPI";
import { OpenAPISpec } from "../types/OpenAPISpec";
import { useEffect } from "react";

interface Props {
  data: {
    allOpenapiYaml: {
      edges: {
        node: {
          info: {
            version: string;
          };
          openapi: string;
          slug: string;
          spec: string;
        };
      }[];
    };
  };
}

// markup
const IndexPage = ({ data }: Props) => {
  const {
    allOpenapiYaml: { edges },
  } = data;
  const latestVerNum = semver.maxSatisfying(
    edges.map((edge) => edge.node.info.version),
    "x"
  );
  const latestVer = edges.find(
    (edge) => edge.node.info.version === latestVerNum
  );
  useEffect(() => {
    if (latestVer != null) {
      window.location.href = ["", latestVer.node.slug].join("/");
    }
  }, [latestVer]);
  const openApiStore = new OpenAPI({
    spec: JSON.parse(latestVer.node.spec || "{}") as any as OpenAPISpec,
  });
  return (
    <Layout openApiStore={openApiStore} selectedVersion={latestVer.node.slug}>
      <div>Redirecting to newest doc version</div>
    </Layout>
  );
};

export const pageQuery = graphql`
  query IndexPage {
    allOpenapiYaml {
      edges {
        node {
          info {
            version
          }
          openapi
          slug
        }
      }
    }
  }
`;

export default IndexPage;
