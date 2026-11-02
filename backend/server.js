const app = require("./app");
const { connection } = require("./global");

const PORT = process.env.PORT || 8080;

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
