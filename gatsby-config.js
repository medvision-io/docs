const packageJSON = require("./package.json");
const siteConfig = require("./siteConfig");

module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-google-gtag",
      options: {
        trackingIds: [
          "G-8MVYBDGVHP"
        ],
        pluginConfig: {
          // Puts tracking script in the head instead of the body
          head: false,
          // Respect Do Not Track users
          respectDNT: true,
        },
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: `zhiva.ai Documentation`,
        short_name: `Docs | zhiva.ai`,
        description: `Documentation for zhiva.ai`,
        lang: `en`,
        icon: "src/images/icon.png",
      },
    },
    "gatsby-plugin-mdx",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-mui-emotion",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/content/pages`,
        ignore: [`**/\.*`],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `openapi`,
        path: `${__dirname}/content/openapi/`,
        ignore: [`**/\.*`],
      },
    },
    {
      resolve: "gatsby-transformer-openapi",
      options: {
        instanceName: "openapi",
        docfiles: packageJSON.docfiles,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        // Footnotes mode (default: true)
        footnotes: true,
        // GitHub Flavored Markdown mode (default: true)
        gfm: true,
        // Plugins configs
        plugins: [],
      },
    },
  ],
  siteMetadata: siteConfig,
};
