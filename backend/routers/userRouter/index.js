const express = require("express");
const multer = require("multer");
const auth = require("../../resources/auth");
const { assertFields, ValidationError } = require("../../resources/fields");

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") cb(null, true);
  else cb(null, false);
};

// images are kept in memory and saved in the database (no local disk needed);
// 4 MB keeps requests under the serverless body limit
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 4 },
});

const router = express.Router();
const controller = require("../../controllers/user/user");

//GETS

router.get("/photo", async (req, res) => {
  try {
    token = req.query.key;
    const photo = await controller.getPhoto(
      (await auth.verify(token)).id
    );

    res.type(photo.mime).send(photo.data);
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/photo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const photo = await controller.getPhoto(id);

    res.type(photo.mime).send(photo.data);
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/name", async (req, res) => {
  try {
    token = req.query.key;
    const username = await controller.getUserName(token);
    res.status(200).jsonp({ username });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});
router.get("/name/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const username = await controller.getName(id);
    res.status(200).jsonp({ username });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/id", async (req, res) => {
  try {
    token = req.query.key;
    const userId = await controller.getUserId(token);
    console.log(userId);
    res.status(200).jsonp({ id: userId });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});


//POSTS

router.post("/login", async (req, res) => {
  try {
    const { username, loginPassword } = assertFields({
      username: req.body.name,
      loginPassword: req.body.password,
    });
    const loginInfo = await controller.loginUser(username, loginPassword);

    res.status(200).jsonp(loginInfo);
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.post("/add-user", upload.single("image"), async (req, res) => {
  try {
    const { username, email, password } = assertFields({
      username: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    if (!req.file) throw new ValidationError("A profile picture is required");
    await controller.addUser(username, email, password, req.file);
    res.status(200).send({});
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.post("/add-group/:groupName", async (req, res) => {
  try {
    const { groupName } = assertFields({ groupName: req.params.groupName });
    await controller.addGroup(req.body.token, groupName);
    res.status(200).send({});
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

//DELETES

router.delete("/:name/:email/:password", async (req, res) => {
  try {
    const { name, email, password } = req.params;
    await controller.removeUser(name, email, password);
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

module.exports = router;
