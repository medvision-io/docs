import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout/Layout";
import { PageContext } from "gatsby/internal";
import { OpenAPI } from "../services/OpenAPI";
import { OpenAPISpec } from "../types/OpenAPISpec";
import AppInfo from "../components/Redoc/ApiInfo/ApiInfo";
import Group from "../components/Redoc/Group/Group";

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
      };
      spec: string;
      slug: string;
      tags: {
        description: string;
        name: string;
      };
    };
  };
  pageContext: PageContext;
}

export default function PageTemplate({ data, pageContext }: Props) {
  const { openapiYaml } = data;
  const openApiStore = new OpenAPI({
    spec: JSON.parse(openapiYaml.spec) as any as OpenAPISpec,
  });
  return (
    <Layout
      selectedVersion={openapiYaml.slug}
      selectedTagGroup={pageContext.group}
      openApiStore={openApiStore}
    >
      <Group selectedGroup={pageContext.group} openApiStore={openApiStore} />
    </Layout>
  );
}

export const pageQuery = graphql`
  query VersionWithGroup($verid: String!, $group: String!) {
    openapiYaml(
      x_tagGroups: { elemMatch: { slug: { eq: $group } } }
      id: { eq: $verid }
    ) {
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
  }
`;
