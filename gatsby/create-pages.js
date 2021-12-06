const createVersionPages = require('./create-version-page')
const path = require('path');
const semver = require('semver')

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
            x_tagGroups {
              tags {
                slug
              }
              slug
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
  if (
    data && data.allMarkdownRemark
  ) {
    data.allMarkdownRemark.edges.forEach(({node}) => {
      const compatibleVersions = data.allOpenapiYaml.edges.filter(edge => semver.satisfies(edge.node.info.version, String(node.frontmatter.docVersion)));

      compatibleVersions.forEach(compatibleVersion => {
        const slug = [compatibleVersion.node.slug, node.fields.slug].join('');
        actions.createPage({
          path: slug,
          component: path.resolve(`src/templates/page-template.tsx`),
          context: { markdownid: node.id, version: compatibleVersion.node.slug },
        });
      })
    });
  }
  if (
    data && data.allOpenapiYaml
  ) {
    await createVersionPages({
      data: data.allOpenapiYaml, actions
    })
  }
}

module.exports = createPages;
