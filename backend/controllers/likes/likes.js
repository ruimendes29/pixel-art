const jwt = require("jsonwebtoken");
const sqlQuery = require("../../resources/db");

const likePost = async (token, projectId) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `INSERT INTO Likes (userId,postId) VALUES (${user.id},${projectId})`;
  const inserted = await sqlQuery.queryDataBase(sql);
  return inserted;
};

const unlikePost = async (token, projectId) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `DELETE FROM Likes WHERE userId=${user.id} and postId=${projectId}`;
  const deleted = await sqlQuery.queryDataBase(sql);
  return deleted;
};

const doesUserLikePost = async (token, projectId) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  const sql = `SELECT COUNT(*) as total FROM Likes WHERE userId=${user.id} and postId=${projectId}`;
  const liked = await sqlQuery.queryDataBase(sql);
  return liked[0].total > 0;
};

const getLikes = async (projectId) => {
  const sql = `SELECT COUNT(*) as total FROM Likes WHERE postId=${projectId}`;
  const count = await sqlQuery.queryDataBase(sql);
  return count[0].total;
};

module.exports = { likePost, getLikes, doesUserLikePost,unlikePost };
