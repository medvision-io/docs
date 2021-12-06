const path = require('path');

async function createVersionPage({ data, actions }) {
  const { createPage } = actions;
  data.edges.forEach(({node}) => {
    const versionSlug = node.slug;
    createPage({
      path: versionSlug,
      component: path.resolve(`src/templates/page-version.tsx`),
      context: { version: versionSlug },
    });

    node.x_tagGroups.forEach(xTagGroup => {
      const tagSlug = `${versionSlug}/${xTagGroup.slug}`
      createPage({
        path: tagSlug,
        component: path.resolve(`src/templates/page-tag-group.tsx`),
        context: { version: versionSlug, group: xTagGroup.slug },
      });
    })
  });
}

module.exports = createVersionPage;
