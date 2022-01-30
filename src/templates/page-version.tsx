import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout/Layout";
import { PageContext } from "gatsby/internal";
import AppInfo from "../components/Redoc/ApiInfo/ApiInfo";
import { OpenAPI } from "../services/OpenAPI";
import { OpenAPISpec } from "../types/OpenAPISpec";
import DocHead from "../components/Layout/DocHead";
import {getLatestSemver} from "../utils";

interface Props {
  data: {
    openapiYaml: {
      info: {
        contact: {
          email: string;
          url: string;
        };
        description: string;
        termsOfService: string;
        title: string;
        version: string;
      };
      openapi: string;
      x_tagGroups: {
        name: string;
        tags: {
          name: string;
          slug: string;
        };
        slug: string;
      }[];
      spec: string;
      slug: string;
      tags: {
        description: string;
        name: string;
      };
    };
    allOpenapiYaml: {
      nodes: [
        {
          info: {
            version: string;
          };
          slug: string;
        }
      ]
    };
  };
  pageContext: PageContext;
}

export default function PageTemplate({ data, pageContext }: Props) {
  const { openapiYaml, allOpenapiYaml } = data;
  const latestVersion = getLatestSemver(allOpenapiYaml.nodes.map((openapi) => openapi.info.version));
  const openApiStore = new OpenAPI({
    spec: JSON.parse(openapiYaml.spec) as any as OpenAPISpec,
    versionSlug: openapiYaml.info.version === latestVersion ? 'latest' : openapiYaml.slug,
  });
  return (
    <Layout selectedVersion={openapiYaml.slug} openApiStore={openApiStore}>
      <React.Fragment>
        <DocHead
          title={openapiYaml.info.title + " " + openapiYaml.info.version}
        />
        <AppInfo store={openApiStore} />
      </React.Fragment>
    </Layout>
  );
}

export const pageQuery = graphql`
  query ($verid: String!) {
    openapiYaml(id: { eq: $verid }) {
      info {
        contact {
          email
          url
        }
        description
        termsOfService
        title
        version
      }
      openapi
      x_tagGroups {
        name
        section
        tags {
          name
          slug
        }
        slug
      }
      spec
      slug
      tags {
        description
        name
      }
    }
    allOpenapiYaml {
      nodes {
        info {
          version
        }
        slug
      }
    }
  }
`;
