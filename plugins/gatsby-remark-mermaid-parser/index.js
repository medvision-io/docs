const visit = require("unist-util-visit");


module.exports = ({ markdownAST }, pluginOptions) => {
  visit(markdownAST, "code", (node) => {
    let { lang, value } = node;
    // Skip if not an h1
    if (lang !== 'mermaid') return;
    // // Grab the innerText of the heading node
    const html = `
        <div class="mermaid"  markdown="0">
          ${value}
        </div>
      `;
    node.type = "html";
    node.lang = undefined;
    node.children = undefined;
    node.value = html;
  });
  return markdownAST;
};
