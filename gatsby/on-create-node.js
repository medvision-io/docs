const { createFilePath } = require(`gatsby-source-filesystem`);
const slugify = require('slugify');

function onCreateNode({ node, getNode, actions }) {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    let slug = "";
    if (node.frontmatter.slug && node.frontmatter.slug.length > 0) {
      slug = `/${node.frontmatter.slug}`;
    } else if (node.frontmatter.title && node.frontmatter.title.length > 0) {
      slug = `/${slugify(node.frontmatter.title, {
        replacement: "-",
        lower: true,
        strict: true,
      })}`;
    } else {
      slug = createFilePath({ node, getNode, basePath: `pages` });
    }
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
}

module.exports = onCreateNode;
