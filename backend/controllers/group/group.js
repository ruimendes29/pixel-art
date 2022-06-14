const sqlController = require("../../resources/db");
const jwt = require("jsonwebtoken");

const getGroups = async (token) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `SELECT * FROM Grupo WHERE owner=${user.id}`;
  const grupos = await sqlController.queryDataBase(sql);
  return grupos;
};

module.exports = {getGroups};
