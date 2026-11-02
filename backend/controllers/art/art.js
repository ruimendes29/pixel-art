const sqlController = require("../../resources/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const createProject = async (
  token,
  projectName,
  projectDescription,
  canvasSize,
  projectGroup
) => {
  //token, author, name, description, group
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  if (projectGroup) {
    console.log(projectGroup);
    const checkGroup = `SELECT * FROM Grupo WHERE owner=? and id=?`;
    const groupRows = await sqlController.queryDataBase(checkGroup, [
      user.id,
      projectGroup,
    ]);
    if (groupRows.length === 0) {
      throw new Error("Group does not exist or user is not the owner.");
    }
  }
  const insertSQL = `INSERT INTO Project (name,author,grupo,description,shared,size) values (?,?,?,?,false,?)`;
  const inserted = await sqlController.queryDataBase(insertSQL, [
    projectName,
    user.id,
    projectGroup || null,
    projectDescription,
    canvasSize,
  ]);
  return inserted;
};

const getAuthor = async (id) => {
  const sql = `SELECT author FROM Project WHERE id=?`;
  const ownerRow = await sqlController.queryDataBase(sql, [id]);
  return ownerRow[0].author;
};

const addImageToProject = async (token, image, projectId) => {
  const checkUser = `Select author from Project where id=?`;
  const owner = (await sqlController.queryDataBase(checkUser, [projectId]))[0]
    .author;
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  if (owner !== user.id) {
    throw new Error("Token does not match owner of the project");
  }
  const checkIfImageExists = `SELECT * FROM Image WHERE path=?`;
  const fromDB = await sqlController.queryDataBase(checkIfImageExists, [image]);
  if (fromDB.length === 0) {
    const addImage = `INSERT INTO Image (path) VALUES (?)`;
    const insertedImage = await sqlController.queryDataBase(addImage, [image]);
    // insert the user in the DB using the photo id
    const sqlQuery = `UPDATE Project SET image=? where id=?`;
    const ret = await sqlController.queryDataBase(sqlQuery, [
      insertedImage.insertId,
      projectId,
    ]);
    return ret;
  }
};

const getImage = async (projectId) => {
  const photoSQL = `select path from Project join Image on Project.image=Image.id where Project.id=?;`;
  const photo = await sqlController.queryDataBase(photoSQL, [projectId]);
  console.log(photo);
  return photo[0].path;
};

const getCanvas = async (projectId) => {
  const canvasSQL = `select name,size,shared from Project where id=?;`;
  const canvas = await sqlController.queryDataBase(canvasSQL, [projectId]);
  return canvas[0];
};

const getProjects = async (token, group) => {
  let sqlQuery = `SELECT * FROM Project`;
  const params = [];
  if (token) {
    const user = jwt.verify(token, process.env.TOKEN_KEY);
    sqlQuery += ` WHERE author=?`;
    params.push(user.id);

    if (group) {
      if (group === "null") {
        sqlQuery += ` and grupo IS NULL`;
      } else {
        sqlQuery += ` and grupo=?`;
        params.push(group);
      }
    }
  }
  const projectsRows = await sqlController.queryDataBase(sqlQuery, params);
  return projectsRows;
};

const getShared = async (tags) => {
  console.log(tags);
  const parsedTags = JSON.parse(tags);
  // `IN (?)` expands an array into a list of escaped values
  const sql =
    parsedTags.length > 0
      ? `SELECT Project.* FROM Project join
  (SELECT * FROM (SELECT projectId,Count(*) as numberOfTags FROM Tag where name in (?) group by projectId) as tags where numberOfTags=?)
   as fullProjects on Project.id=projectId WHERE shared=1`
      : `SELECT * FROM Project where shared=1`;
  const shared = await sqlController.queryDataBase(sql, [
    parsedTags,
    parsedTags.length,
  ]);
  return shared;
};

const shareProject = async (token, projectId, tags, description) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  let sql = `UPDATE Project SET shared=1,description=? WHERE id=? and author=?`;
  const updated = await sqlController.queryDataBase(sql, [
    description,
    projectId,
    user.id,
  ]);
  if (updated.affectedRows === 0)
    throw new Error("The project does not exist or is not from the user!");
  for (const tag of tags) {
    const tagSql = `INSERT IGNORE INTO Tag (projectId,name) VALUES (?,?)`;
    await sqlController.queryDataBase(tagSql, [projectId, tag]);
  }
  return updated;
};

const isShared = async (projectId) => {
  const sql = `SELECT shared FROM Project WHERE id=?`;
  const sharedRow = await sqlController.queryDataBase(sql, [projectId]);
  console.log(sharedRow);
  return sharedRow[0].shared;
};

module.exports = {
  createProject,
  addImageToProject,
  getImage,
  getCanvas,
  getProjects,
  getShared,
  shareProject,
  isShared,
  getAuthor,
};
