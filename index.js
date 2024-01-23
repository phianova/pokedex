const express = require("express");
const axios = require("axios")
const app = express();
const port = 3000;
const router = require("./routes/pokeRoutes");
app.use(express.json());

app.use(router);
app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

