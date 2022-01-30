import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout/Layout";
import { PageContext } from "gatsby/internal";
import { OpenAPI } from "../services/OpenAPI";
import { OpenAPISpec } from "../types/OpenAPISpec";
import Group from "../components/Redoc/Group/Group";
import DocHead from "../components/Layout/DocHead";
import Schema from "../components/Redoc/Schema/Schema";

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
        section: string;
        tags: {
          name: string;
          slug: string;
        };
        slug: string;
      }[];
      schemas: {
        name: string;
        slug: string;
        doNotRender: boolean | null;
      }[];
      spec: string;
      slug: string;
      tags: {
        description: string;
        name: string;
      };
    };
    site: {
      siteMetadata: {
        categories: {
          name: string;
          key: string;
        }[];
      };
    };
  };
  pageContext: PageContext;
}

export default function PageTemplate({ data, pageContext }: Props) {
  const {
    openapiYaml,
    site: {
      siteMetadata: { categories },
    },
  } = data;
  const openApiStore = new OpenAPI({
    spec: JSON.parse(openapiYaml.spec) as any as OpenAPISpec,
  });
  const selectedSchema = openapiYaml?.schemas?.find(
    (schema) => schema.slug === pageContext.schema
  );
  return (
    <Layout
      selectedVersion={openapiYaml.slug}
      selectedSchema={pageContext.schema}
      openApiStore={openApiStore}
    >
      <React.Fragment>
        <DocHead
          title={pageContext.schema + " - v" + openapiYaml.info.version}
        />
        <Schema
          selectedSchema={selectedSchema.name}
          openApiStore={openApiStore}
        />
      </React.Fragment>
    </Layout>
  );
}

export const pageQuery = graphql`
  query VersionWithSchema($verid: String!, $schema: String!) {
    openapiYaml(
      schemas: { elemMatch: { slug: { eq: $schema } } }
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
      schemas {
        slug
        name
        doNotRender
      }
      spec
      slug
      tags {
        description
        name
      }
    }
    site {
      siteMetadata {
        categories {
          name
          key
        }
      }
    }
  }
`;
