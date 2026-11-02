const jwt = require("jsonwebtoken");
const sqlQuery = require("../../resources/db");

const likePost = async (token, projectId) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `INSERT INTO Likes (userId,postId) VALUES (?,?)`;
  const inserted = await sqlQuery.queryDataBase(sql, [user.id, projectId]);
  return inserted;
};

const unlikePost = async (token, projectId) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `DELETE FROM Likes WHERE userId=? and postId=?`;
  const deleted = await sqlQuery.queryDataBase(sql, [user.id, projectId]);
  return deleted;
};

const doesUserLikePost = async (token, projectId) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `SELECT COUNT(*) as total FROM Likes WHERE userId=? and postId=?`;
  const liked = await sqlQuery.queryDataBase(sql, [user.id, projectId]);
  return liked[0].total > 0;
};

const getLikes = async (projectId) => {
  const sql = `SELECT COUNT(*) as total FROM Likes WHERE postId=?`;
  const count = await sqlQuery.queryDataBase(sql, [projectId]);
  return count[0].total;
};

module.exports = { likePost, getLikes, doesUserLikePost,unlikePost };
