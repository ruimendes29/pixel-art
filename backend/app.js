// The Express app on its own, so it can run as a normal server (server.js)
// or as a serverless function (api/index.js at the repository root).
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const swagger = require("swagger-node-express");

const userRouter = require("./routers/userRouter/index");
const artRouter = require("./routers/artRouter/index");
const groupRouter = require("./routers/groupRouter/index");
const likesRouter = require("./routers/likesRouter/index");

const app = express();

swagger.setAppHandler(app);

// app internal configurations
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// expose url paths and endpoints
app.use("/api/users", userRouter);
app.use("/api/art", artRouter);
app.use("/api/groups", groupRouter);
app.use("/api/likes", likesRouter);

module.exports = app;
