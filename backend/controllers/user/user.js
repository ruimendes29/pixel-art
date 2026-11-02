const sqlController = require("../../resources/db");
const bcrypt = require("bcryptjs");
const auth = require("../../resources/auth");
require("dotenv").config();

const checkUser = async (name, email) => {
  const sqlQuery = `SELECT id,username,email,password FROM User WHERE username=? and email=?;`;
  const ret = await sqlController.queryDataBase(sqlQuery, [name, email]);
  return ret;
};

const getUserId = async (token) => {
  try {
    // get information from the user using the jwt
    const user = await auth.verify(token);
    console.log(user.id);
    return user.id;
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const getUserName = async (token) => {
  try {
    // get information from the user using the jwt
    const user = await auth.verify(token);
    return user.username;
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const loginUser = async (username, password) => {
  const checkUserExists = `SELECT password,id FROM User WHERE username=? limit 1`;
  const userInfo = await sqlController.queryDataBase(checkUserExists, [
    username,
  ]);
  if (userInfo.length === 0) {
    throw Error("Username does not exist!");
  }
  const hashedPassword = userInfo[0].password;
  const passwordIsRight = bcrypt.compareSync(password, hashedPassword);
  if (!passwordIsRight) {
    throw Error("Credentials do not match!");
  }
  return {
    token: await auth.sign({ username, id: userInfo[0].id }),
  };
};

const isEmailUsed = async (email) => {
  const checkIfEmailExists = `SELECT * FROM User WHERE email=?`;
  const returnedRows = await sqlController.queryDataBase(checkIfEmailExists, [
    email,
  ]);

  return returnedRows.length > 0;
};

const addUser = async (name, email, password, photo) => {
  //verify the inputs in the backend
  const checkName = name.trim() !== "";
  const checkEmail = email.includes("@");
  //encrypt password
  const hashedPassword = await bcrypt.hash(password, 5);
  // check if the email is already in use
  const emailUsed = await isEmailUsed(email);
  if (checkName && checkEmail && !emailUsed) {
    // firstly store the photo in the database to get its id
    const addImage = `INSERT INTO Image (data,mime) VALUES (?,?)`;
    const image = await sqlController.queryDataBase(addImage, [
      photo.buffer,
      photo.mimetype,
    ]);
    // insert the user in the DB using the photo id
    const sqlQuery = `INSERT INTO User (username,email,password,photo) VALUES (?,?,?,?);`;
    const ret = await sqlController.queryDataBase(sqlQuery, [
      name,
      email,
      hashedPassword,
      image.insertId,
    ]);
    return ret;
  } else if (emailUsed) {
    throw new Error("Email is already in use!");
  } else {
    throw new Error("Name can not be empty and email must contain a @");
  }
};

const removeUser = async (name, email, password) => {
  const userExists = await checkUser(name, email);
  if (userExists.length === 0) {
    throw new Error("User does not exist!");
  }
  if (!bcrypt.compareSync(password, userExists[0].password)) {
    throw new Error("Credentials do not match!");
  }
  const sqlQuery = `DELETE FROM User WHERE id=?;`;
  const ret = await sqlController.queryDataBase(sqlQuery, [userExists[0].id]);
  return ret;
};

const getPhoto = async (id) => {
  try {
    const photoIdQuery = `SELECT photo FROM User WHERE id=?`;
    const photoIdRow = await sqlController.queryDataBase(photoIdQuery, [id]);
    const photoId = photoIdRow[0].photo;

    const imageQuery = `SELECT data,mime FROM Image WHERE id=?`;
    const imageRow = await sqlController.queryDataBase(imageQuery, [photoId]);

    return imageRow[0];
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const getGroups = async (token) => {
  try {
    // get information from the user using the jwt
    const user = await auth.verify(token);
    const groupQuery = `SELECT name,id FROM Grupo WHERE owner=?`;
    const groupRows = await sqlController.queryDataBase(groupQuery, [user.id]);
    return groupRows.map((el) => {
      return { name: el.name, id: el.id };
    });
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const addGroup = async (token, groupName) => {
  try {
    // get information from the user using the jwt
    const user = await auth.verify(token);
    const groupQuery = `INSERT INTO Grupo (owner,name) VALUES (?,?);`;
    const insertedGroup = await sqlController.queryDataBase(groupQuery, [
      user.id,
      groupName,
    ]);
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const getName = async (id) => {
  const sql = `SELECT username FROM User WHERE id=?`;
  const fromDB = await sqlController.queryDataBase(sql, [id]);
  return fromDB[0].username;
};

module.exports = {
  checkUser,
  addUser,
  removeUser,
  loginUser,
  getPhoto,
  getUserId,
  getUserName,
  getGroups,
  addGroup,
  getName
};
