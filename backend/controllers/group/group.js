const sqlController = require("../../resources/db");
const jwt = require("jsonwebtoken");

const getGroups = async (token) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `SELECT * FROM Grupo WHERE owner=?`;
  const grupos = await sqlController.queryDataBase(sql, [user.id]);
  return grupos;
};

module.exports = {getGroups};
