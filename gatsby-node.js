const onCreateNode = require('./gatsby/on-create-node');
const createPages = require('./gatsby/create-pages')

exports.createPages = createPages
exports.onCreateNode = onCreateNode

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /react-json-view/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}