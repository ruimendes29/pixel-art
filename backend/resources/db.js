const { connection } = require("../global");

// Always pass user input through `params` (the ? placeholders in `sql`),
// never by building the SQL string, so it can't be used for SQL injection.
module.exports.queryDataBase = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
