// mysql2 instead of mysql: the old driver can't authenticate against MySQL 8+
// (caching_sha2_password). A pool also reconnects if the server drops us.
var mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = {connection};
