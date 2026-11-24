// mysql2 instead of mysql: the old driver can't authenticate against MySQL 8+
// (caching_sha2_password). A pool also reconnects if the server drops us.
var mysql = require("mysql2");
var fs = require("fs");
require("dotenv").config();

// Hosted databases require SSL. DB_SSL_CA is for hosts with their own CA
// certificate: the path to the .pem file or the certificate text itself (line
// breaks may be written as \n, for env settings that only take one line).
// DB_SSL=true is for hosts with a public certificate (e.g. TiDB Cloud), checked
// against Node's built-in CAs.
const sslCa = process.env.DB_SSL_CA;
const ssl = sslCa
  ? {
      ca: sslCa.includes("-----BEGIN")
        ? sslCa.replace(/\\n/g, "\n")
        : fs.readFileSync(sslCa),
    }
  : process.env.DB_SSL === "true"
  ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
  : undefined;

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  // keep it small: on serverless every running instance has its own pool
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 5,
});

module.exports = {connection};
