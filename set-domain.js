var fs = require("fs");

const domainName = process.argv[2];
fs.writeFile("./public/CNAME", domainName, "utf8", function (err) {
  if (err) return console.error(err);
});
