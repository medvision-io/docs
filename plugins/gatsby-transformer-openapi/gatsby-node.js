/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
// You can delete this file if you're not using it

const YAML = require(`js-yaml`);
const kebabCase = require("lodash.kebabcase");
const {
  isString,
  upperFirst,
  camelCase,
  isFunction,
  isArray,
  isPlainObject,
} = require(`lodash`);
const path = require(`path`);

function unstable_shouldOnCreateNode({ node }) {
  return node.internal.mediaType === `text/yaml`;
}

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  if (
    !unstable_shouldOnCreateNode(
      { node },
      pluginOptions.instanceName || "openapi"
    )
  ) {
    return;
  }
  if (node.sourceInstanceName !== (pluginOptions.instanceName || "openapi")) {
    return;
  }
  const { createNode, createParentChildLink } = actions;

  function getType({ node, object, isArray }) {
    if (pluginOptions && isFunction(pluginOptions.typeName)) {
      return pluginOptions.typeName({ node, object, isArray });
    } else if (pluginOptions && isString(pluginOptions.typeName)) {
      return pluginOptions.typeName;
    } else if (node.internal.type !== `File`) {
      return upperFirst(camelCase(`${node.internal.type} Yaml`));
    } else if (isArray) {
      return upperFirst(camelCase(`${node.name} Yaml`));
    } else {
      return upperFirst(camelCase(`${path.basename(node.dir)} Yaml`));
    }
  }

  function transformObject(obj, id, type) {
    const yamlNode = {
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type,
      },
      info: {
        ...obj.info
      },
      tags: obj.tags,
      openapi: obj.openapi,
      "x-tagGroups": obj["x-tagGroups"],
      slug: kebabCase(obj.info.version),
    };


    if (obj["x-tagGroups"] == null || !Array.isArray(obj["x-tagGroups"])) {
      obj["x-tagGroups"] = [
        {
          name: "General",
          tags: [...obj.tags.map(tag => tag.name)],
        },
      ];
    }

    obj["x-tagGroups"] = obj["x-tagGroups"].map(tagGroup => ({
      ...tagGroup,
      slug: kebabCase(tagGroup.name.replace(/\W/g, "")),
    }))

    yamlNode["x-tagGroups"] = obj["x-tagGroups"].map((tagGroup) => {
      return {
        ...tagGroup,
        tags: tagGroup.tags.map((tag) => {
          return {
            name: tag,
              slug: kebabCase(tag.replace(/\W/g, "")),
          }
        }),
      };
    });

    if (obj.id) {
      yamlNode[`yamlId`] = obj.id;
    }
    yamlNode["spec"] = JSON.stringify(obj);
    createNode(yamlNode);
    createParentChildLink({ parent: node, child: yamlNode });
  }

  const content = await loadNodeContent(node);
  const parsedContent = YAML.load(content);

  if (isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(
        obj,
        createNodeId(`${node.id} [${i}] >>> YAML`),
        getType({ node, object: obj, isArray: true })
      );
    });
  } else if (isPlainObject(parsedContent)) {
    transformObject(
      parsedContent,
      createNodeId(`${node.id} >>> YAML`),
      getType({ node, object: parsedContent, isArray: false })
    );
  }
}

exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode;
exports.onCreateNode = onCreateNode;
