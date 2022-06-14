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
    const checkGroup = `SELECT * FROM Grupo WHERE owner=${user.id} and id=${projectGroup}`;
    groupRows = await sqlController.queryDataBase(checkGroup);
    if (groupRows.length === 0) {
      throw new Error("Group does not exist or user is not the owner.");
    }
  }
  const insertSQL = `INSERT INTO Project (name,author${
    projectGroup ? ",grupo" : ""
  },description,shared,size) values ('${projectName}',${user.id}${
    projectGroup ? "," + projectGroup : ""
  },'${projectDescription}',false,${canvasSize})`;
  const inserted = await sqlController.queryDataBase(insertSQL);
  return inserted;
};

const getAuthor = async (id) => {
  const sql = `SELECT author FROM Project WHERE id=${id}`;
  const ownerRow = await sqlController.queryDataBase(sql);
  return ownerRow[0].author;
};

const addImageToProject = async (token, image, projectId) => {
  const checkUser = `Select author from Project where id=${projectId}`;
  const owner = (await sqlController.queryDataBase(checkUser))[0].author;
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  if (owner !== user.id) {
    throw new Error("Token does not match owner of the project");
  }
  const checkIfImageExists = `SELECT * FROM Image WHERE path='${image}'`;
  const fromDB = await sqlController.queryDataBase(checkIfImageExists);
  if (fromDB.length === 0) {
    const addImage = `INSERT INTO Image (path) VALUES ('${image}')`;
    const insertedImage = await sqlController.queryDataBase(addImage);
    // insert the user in the DB using the photo id
    const sqlQuery = `UPDATE Project SET image=${insertedImage.insertId} where id=${projectId}`;
    const ret = await sqlController.queryDataBase(sqlQuery);
    return ret;
  }
};

const getImage = async (projectId) => {
  const photoSQL = `select path from Project join Image on Project.image=Image.id where Project.id=${projectId};`;
  const photo = await sqlController.queryDataBase(photoSQL);
  console.log(photo);
  return photo[0].path;
};

const getCanvas = async (projectId) => {
  const canvasSQL = `select name,size,shared from Project where id=${projectId};`;
  const canvas = await sqlController.queryDataBase(canvasSQL);
  return canvas[0];
};

const getProjects = async (token, group) => {
  let sqlQuery = `SELECT * FROM Project`;
  if (token) {
    const user = jwt.verify(token, process.env.TOKEN_KEY);
    sqlQuery += ` WHERE author=${user.id}`;

    if (group) {
      if (group === "null") {
        sqlQuery += ` and grupo IS NULL`;
      } else {
        sqlQuery += ` and grupo=${group}`;
      }
    }
  }
  const projectsRows = await sqlController.queryDataBase(sqlQuery);
  return projectsRows;
};

const getShared = async (tags) => {
  console.log(tags);
  const tagsToString = (tags) => {
    let ret = "";
    if (tags.length > 0) {
      ret = "(";

      for (let i = 0; i < tags.length; i++) {
        ret += `'${tags[i]}'`;
        if (i < tags.length - 1) ret += ",";
      }
      ret += ")";
    }
    return ret;
  };
  const parsedTags = JSON.parse(tags);
  const sql =
    parsedTags.length > 0
      ? `SELECT Project.* FROM Project join
  (SELECT * FROM (SELECT projectId,Count(*) as numberOfTags FROM Tag where name in ${tagsToString(
    parsedTags
  )} group by projectId) as tags where numberOfTags=${parsedTags.length})
   as fullProjects on Project.id=projectId WHERE shared=1`
      : `SELECT * FROM Project where shared=1`;
  console.log(sql);
  const shared = await sqlController.queryDataBase(sql);
  return shared;
};

const shareProject = async (token, projectId, tags, description) => {
  const user = jwt.verify(token, process.env.TOKEN_KEY);
  let sql = `UPDATE Project SET shared=1,description='${description}' WHERE id=${projectId} and author=${user.id}`;
  const updated = await sqlController.queryDataBase(sql);
  if (updated.affectedRows === 0)
    throw new Error("The project does not exist or is not from the user!");
  for (const tag of tags) {
    const tagSql = `INSERT INTO Tag (projectId,name) VALUES (${projectId},'${tag}')`;
    await sqlController.queryDataBase(tagSql);
  }
  return updated;
};

const isShared = async (projectId) => {
  const sql = `SELECT shared FROM Project WHERE id=${projectId}`;
  const sharedRow = await sqlController.queryDataBase(sql);
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
