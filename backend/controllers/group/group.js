const sqlController = require("../../resources/db");
const auth = require("../../resources/auth");

const getGroups = async (token) => {
  const user = await auth.verify(token);
  const sql = `SELECT * FROM Grupo WHERE owner=?`;
  const grupos = await sqlController.queryDataBase(sql, [user.id]);
  return grupos;
};

module.exports = {getGroups};
