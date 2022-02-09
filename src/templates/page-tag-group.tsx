import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout/Layout";
import { PageContext } from "gatsby/internal";
import { OpenAPI } from "../services/OpenAPI";
import { OpenAPISpec } from "../types/OpenAPISpec";
import Group from "../components/Redoc/Group/Group";
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
        section: string;
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
    allOpenapiYaml,
    site: {
      siteMetadata: { categories },
    },
  } = data;
  const latestVersion = getLatestSemver(allOpenapiYaml.nodes.map((openapi) => openapi.info.version));
  const openApiStore = new OpenAPI({
    spec: JSON.parse(openapiYaml.spec) as any as OpenAPISpec,
    versionSlug: openapiYaml.info.version === latestVersion ? 'latest' : openapiYaml.slug,
  });
  const selectedGroup = openapiYaml?.x_tagGroups?.find(
    (group) => group.slug === pageContext.group
  );
  const selectedCategory = categories.find(
    (cat) => cat.key === selectedGroup?.section
  );
  return (
    <Layout
      selectedVersion={openapiYaml.slug}
      selectedTagGroup={pageContext.group}
      openApiStore={openApiStore}
    >
      <React.Fragment>
        <DocHead
          title={
            selectedGroup.name +
            " - " +
            selectedCategory.name +
            " - v" +
            openapiYaml.info.version
          }
        />
        <Group selectedGroup={pageContext.group} openApiStore={openApiStore} />
      </React.Fragment>
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
    allOpenapiYaml {
      nodes {
        info {
          version
        }
        slug
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
