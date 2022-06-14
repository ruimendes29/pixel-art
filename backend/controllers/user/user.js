const sqlController = require("../../resources/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkUser = async (name, email) => {
  const sqlQuery = `SELECT username,email FROM User WHERE username='${name}' and email='${email}';`;
  const ret = await sqlController.queryDataBase(sqlQuery);
  return ret;
};

const getUserId = async (token) => {
  try {
    // get information from the user using the jwt
    const user = jwt.verify(token, process.env.TOKEN_KEY);
    console.log(user.id);
    return user.id;
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const getUserName = async (token) => {
  try {
    // get information from the user using the jwt
    const user = jwt.verify(token, process.env.TOKEN_KEY);
    return user.username;
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const loginUser = async (username, password) => {
  const checkUserExists = `SELECT password,id FROM User WHERE username='${username}' limit 1`;
  const userInfo = await sqlController.queryDataBase(checkUserExists);
  if (userInfo.length === 0) {
    throw Error("Username does not exist!");
  }
  const hashedPassword = userInfo[0].password;
  const passwordIsRight = bcrypt.compareSync(password, hashedPassword);
  if (!passwordIsRight) {
    throw Error("Credentials do not match!");
  }
  return {
    token: jwt.sign({ username, id: userInfo[0].id }, process.env.TOKEN_KEY),
  };
};

const isEmailUsed = async (email) => {
  const checkIfEmailExists = `SELECT * FROM User WHERE email='${email}'`;
  const returnedRows = await sqlController.queryDataBase(checkIfEmailExists);

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
    // firstly insert photo path in database to get id
    const addImage = `INSERT INTO Image (path) VALUES ('${photo}')`;
    const image = await sqlController.queryDataBase(addImage);
    // insert the user in the DB using the photo id
    const sqlQuery = `INSERT INTO User (username,email,password,photo) VALUES ('${name}','${email}','${hashedPassword}',${image.insertId});`;
    const ret = await sqlController.queryDataBase(sqlQuery);
    return ret;
  } else if (emailUsed) {
    throw new Error("Email is already in use!");
  }
};

const removeUser = async (name, email, password) => {
  const userExists = await checkUser(name, email);
  if (userExists.length > 0) {
    const sqlQuery = `DELETE FROM User WHERE username='${name}' and email='${email}';`;
    const ret = await sqlController.queryDataBase(sqlQuery);
    return ret;
  }
};

const getPhoto = async (id) => {
  try {
    const photoIdQuery = `SELECT photo FROM User WHERE id=${id}`;
    const photoIdRow = await sqlController.queryDataBase(photoIdQuery);
    const photoId = photoIdRow[0].photo;

    const pathQuery = `SELECT path FROM Image WHERE id=${photoId}`;
    const pathRow = await sqlController.queryDataBase(pathQuery);

    return pathRow[0].path;
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const getGroups = async (token) => {
  try {
    // get information from the user using the jwt
    const user = jwt.verify(token, process.env.TOKEN_KEY);
    const groupQuery = `SELECT name,id FROM Grupo WHERE owner=${user.id}`;
    const groupRows = await sqlController.queryDataBase(groupQuery);
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
    const user = jwt.verify(token, process.env.TOKEN_KEY);
    const groupQuery = `INSERT INTO Grupo (owner,name) VALUES ('${user.id}','${groupName}');`;
    const insertedGroup = await sqlController.queryDataBase(groupQuery);
  } catch (err) {
    throw new Error("Invalid Token");
  }
};

const getName = async (id) => {
  const sql = `SELECT username FROM User WHERE id=${id}`;
  const fromDB = await sqlController.queryDataBase(sql);
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
