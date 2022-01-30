const path = require('path');
const slugify = require('slugify');

async function createVersionPage({ data, actions }) {
  const { createPage } = actions;
  data.edges.forEach(({node}) => {
    const versionSlug = node.slug;
    createPage({
      path: versionSlug,
      component: path.resolve(`src/templates/page-version.tsx`),
      context: { verid: node.id },
    });

    node.x_tagGroups.forEach(xTagGroup => {
      const tagSlug = `${versionSlug}/${xTagGroup.slug}`
      createPage({
        path: tagSlug,
        component: path.resolve(`src/templates/page-tag-group.tsx`),
        context: { verid: node.id, group: xTagGroup.slug },
      });
    })

    node.schemas.forEach((schema)=> {
      if (schema.doNotRender) {
        return;
      }
      const tagSlug = `${versionSlug}/schemas/${slugify(schema.slug)}`
      createPage({
        path: tagSlug,
        component: path.resolve(`src/templates/page-schema-template.tsx`),
        context: { verid: node.id, group: 'api', schema: schema.slug },
      });
    })
  });
}

module.exports = createVersionPage;
