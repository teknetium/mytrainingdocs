/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

// Modules
require('dotenv').config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cors = require("cors");
const nodemailer = require("nodemailer");
// Config
const config = require("./server/config");

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

  /*
 |--------------------------------------
 | MongoDB
 |--------------------------------------
 */


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});
const monDb = mongoose.connection;

monDb.on("error", function() {
  console.error("MongoDB Connection Error. Please make sure that", config.MONGO_URI, "is running.");
});

monDb.once("open", function callback() {
  console.info("Connected to MongoDB:", config.MONGO_URI);
});

mongoose.set("debug", false);
/*
 |--------------------------------------
 | App
 |--------------------------------------
 */

const app = express();

app.use(cors());

app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '200mb'}));
app.use(methodOverride("X-HTTP-Method-Override"));

// Set port
const port = process.env.PORT || "8083";
app.set("port", port);

// Set static-deprecated path to Angular app in dist
// Don"t run in dev
if (process.env.NODE_ENV !== "dev") {
  app.use("/", express.static(path.join(__dirname, "./dist")));
}

/*
 |--------------------------------------
 | Routes
 |--------------------------------------
 */

require("./server/api")(app, config);

// Pass routing to Angular app
// Don"t run in dev
if (process.env.NODE_ENV !== "dev") {
  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "/dist/index.html"));
  });
}

/*
 |--------------------------------------
 | Server
 |--------------------------------------
 */

app.listen(port, () => console.log(`Server running on localhost:${port}`));
