// Import React so that you can use JSX in HeadComponents
const React = require("react")

const BodyComponents = [
  <script key={"mermaid-script"} async={true} defer src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>,
  <script key={"mermaid-run"} type="text/javascript" dangerouslySetInnerHTML={{ __html: 'mermaid.initialize({ startOnLoad: true });' }}></script>
]

const HeadComponents = [
  <style key={"mermaid-styles"} dangerouslySetInnerHTML={{ __html: `
  .blog-post-container .mermaid { 
    overflow-x: auto;
  }
  .blog-post-container .mermaid > svg {
    width: auto !important; 
   }
  ` }}></style>

]

exports.onRenderBody = ({
                          setPostBodyComponents,
                          setHeadComponents
                        }, pluginOptions) => {
  setPostBodyComponents(BodyComponents);
  setHeadComponents(HeadComponents);
}