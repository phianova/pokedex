require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;
const router = require("./routes/pokeRoutes");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
mongoose
  .connect(process.env.CONNECTION_STRING, {})
  .then(console.log("Connected to MongoDB"));
app.use(express.json());

app.use(router);
app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
