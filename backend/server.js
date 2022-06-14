const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const swagger = require("swagger-node-express");

const userRouter = require("./routers/userRouter/index");
const artRouter = require("./routers/artRouter/index");
const groupRouter = require("./routers/groupRouter/index");
const likesRouter = require("./routers/likesRouter/index");
const { connection } = require("./global");
const { addUser } = require("./controllers/user/user");

const app = express();

swagger.setAppHandler(app);
const PORT = process.env.PORT || 8080;

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

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
  app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
  });
});
