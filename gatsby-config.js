const packageJSON = require("./package.json");

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
  siteMetadata: {
    title: "zhiva.ai",
    siteUrl: 'https://docs.zhiva.ai',
    description: "Documentation for zhiva.ai",
    sections: [
      {
        name: 'Build',
        key: 'build'
      },
      {
        name: 'Quality',
        key: 'quality'
      }
    ],
    categories: [
      {
        name: 'Authentication',
        key: 'authentication',
        icon: 'users',
        section: 'build'
      },
      {
        name: 'Database',
        key: 'database',
        icon: 'database',
        section: 'build'
      },
      {
        name: 'Storage',
        key: 'storage',
        icon: 'image',
        section: 'build'
      },
      {
        name: 'Hosting',
        key: 'hosting',
        icon: 'world',
        section: 'build'
      },
      {
        name: 'Functions',
        key: 'functions',
        icon: 'width',
        section: 'build'
      },
      {
        name: 'Machine Learning',
        key: 'ml',
        icon: 'connectors',
        section: 'build'
      },
      {
        name: 'Analytics',
        key: 'analytics',
        icon: 'setup',
        section: 'quality'
      },
      {
        name: 'Performance',
        key: 'performance',
        icon: 'stopwatch',
        section: 'quality'
      },
      {
        name: 'Test Lab',
        key: 'test-lab',
        icon: 'phone_setup',
        section: 'quality'
      }
    ]
  },
};
