const sqlController = require("../../resources/db");
const auth = require("../../resources/auth");
const {
  normalizeTags,
  parseTagsQuery,
  parseSearchQuery,
  escapeLike,
} = require("../../resources/tags");
require("dotenv").config();

const createProject = async (
  token,
  projectName,
  projectDescription,
  canvasSize,
  projectGroup
) => {
  //token, author, name, description, group
  const user = await auth.verify(token);
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
  const checkUser = `Select author,image from Project where id=?`;
  const project = (await sqlController.queryDataBase(checkUser, [projectId]))[0];
  const user = await auth.verify(token);
  if (project.author !== user.id) {
    throw new Error("Token does not match owner of the project");
  }
  if (project.image) {
    // saving again replaces the stored canvas
    const updateImage = `UPDATE Image SET data=?, mime=? WHERE id=?`;
    return sqlController.queryDataBase(updateImage, [
      image.buffer,
      image.mimetype,
      project.image,
    ]);
  }
  const addImage = `INSERT INTO Image (data,mime) VALUES (?,?)`;
  const insertedImage = await sqlController.queryDataBase(addImage, [
    image.buffer,
    image.mimetype,
  ]);
  const sqlQuery = `UPDATE Project SET image=? where id=?`;
  const ret = await sqlController.queryDataBase(sqlQuery, [
    insertedImage.insertId,
    projectId,
  ]);
  return ret;
};

const getImage = async (projectId) => {
  const photoSQL = `select data,mime from Project join Image on Project.image=Image.id where Project.id=?;`;
  const photo = await sqlController.queryDataBase(photoSQL, [projectId]);
  return photo[0];
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
    const user = await auth.verify(token);
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

// Shared projects that have every tag asked for (ignoring case) and whose name
// or description contains the search text, newest first.
const getShared = async (tagsQuery, searchQuery) => {
  const tags = parseTagsQuery(tagsQuery).map((t) => t.toLowerCase());
  const search = parseSearchQuery(searchQuery);
  const params = [];
  let sql = `SELECT Project.* FROM Project`;
  if (tags.length > 0) {
    // `IN (?)` expands an array into a list of escaped values
    sql += ` JOIN (SELECT projectId FROM Tag WHERE LOWER(name) IN (?)
      GROUP BY projectId HAVING COUNT(DISTINCT LOWER(name)) = ?) AS tagged
      ON Project.id = tagged.projectId`;
    params.push(tags, tags.length);
  }
  sql += ` WHERE shared=1`;
  if (search) {
    const pattern = `%${escapeLike(search.toLowerCase())}%`;
    sql += ` AND (LOWER(Project.name) LIKE ? OR LOWER(COALESCE(Project.description,'')) LIKE ?)`;
    params.push(pattern, pattern);
  }
  sql += ` ORDER BY Project.id DESC`;
  return sqlController.queryDataBase(sql, params);
};

const shareProject = async (token, projectId, rawTags, description) => {
  const user = await auth.verify(token);
  const tags = normalizeTags(rawTags ?? []);
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
