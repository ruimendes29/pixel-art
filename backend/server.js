const express = require("express");
const fs = require("fs");
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

// multer doesn't create its destination folders
fs.mkdirSync("./uploads/users", { recursive: true });
fs.mkdirSync("./uploads/arts", { recursive: true });

connection.query("SELECT 1", (err) => {
  if (err) {
    console.error("Could not connect to MySQL, check backend/.env:", err.message);
    process.exit(1);
  }
  console.log("Connected!");
  app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
  });
});
