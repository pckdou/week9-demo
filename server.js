const http = require("http");
const { hello } = require("./src/index");

http
  .createServer((req, res) => res.end(hello("Docker") + "\n"))
  .listen(3000, () => console.log("listening on 3000"));
