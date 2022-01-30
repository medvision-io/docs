const createVersionPages = require("./create-version-page");
const path = require("path");
const semver = require("semver");

async function createPages({ actions, graphql }) {
  const { data } = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              docVersion
            }
          }
        }
      }
      allOpenapiYaml {
        edges {
          node {
            id
            x_tagGroups {
              tags {
                slug
              }
              slug
            }
            schemas {
              name
              slug
              doNotRender
            }
            slug
            info {
              version
            }
          }
        }
      }
    }
  `);

  const latestVersionNum = getLatestSemver(data.allOpenapiYaml.edges.map(edge => edge.node.info.version));
  const latestVersion = data.allOpenapiYaml.edges.find(edge => edge.node.info.version === latestVersionNum);
  data.allOpenapiYaml.edges.push({
    ...latestVersion,
    node: {
      ...latestVersion.node,
      info: {
        ...latestVersion.node.info,
      },
      slug: 'latest',
    }
  })


  if (data && data.allMarkdownRemark) {
    data.allMarkdownRemark.edges.forEach(({ node }) => {
      const compatibleVersions = data.allOpenapiYaml.edges.filter((edge) =>
        semver.satisfies(
          edge.node.info.version,
          String(node.frontmatter.docVersion)
        )
      );

      compatibleVersions.forEach((compatibleVersion) => {
        const slug = [compatibleVersion.node.slug, node.fields.slug].join("");
        actions.createPage({
          path: slug,
          component: path.resolve(`src/templates/page-template.tsx`),
          context: {
            markdownid: node.id,
            verid: compatibleVersion.node.id,
          },
        });
      });
    });
  }
  if (data && data.allOpenapiYaml) {
    await createVersionPages({
      data: data.allOpenapiYaml,
      actions,
    });
  }
}

/**
 * Returns latest version from the list of strings
 * @param versions Array of versions
 * @return version latest version from the list
 */
function getLatestSemver(versions) {
  let sortedVersions = versions
    .map((version) => version.trim())
    .sort((a, b) => semver.rcompare(a, b))
    .filter((version) => semver.prerelease(version) === null);

  return sortedVersions[0];
}

module.exports = createPages;
