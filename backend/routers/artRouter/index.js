const express = require("express");
const multer = require("multer");

// canvas images are kept in memory and saved in the database
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 4 },
});

const router = express.Router();
const controller = require("../../controllers/art/art");
const { assertFields, ValidationError } = require("../../resources/fields");

// POSTS

router.post("/share-project", async (req, res) => {
  try {
    const token = req.body.token;
    const tags = req.body.tags;
    const { id: projectId, description } = assertFields({
      id: req.body.id,
      description: req.body.description,
    });

    const s = await controller.shareProject(
      token,
      projectId,
      tags,
      description
    );
    console.log(s);

    res.status(200).jsonp({ s });
  } catch (error) {
    //fs.unlinkSync(req.file.path);
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.post("/add-project", async (req, res) => {
  try {
    console.log(req.body);
    const { token } = req.body;
    const { projectName: name, canvasSize: size, description } = assertFields({
      projectName: req.body.name,
      canvasSize: req.body.size,
      description: req.body.description,
    });
    // no group means the project is not in one
    const group = req.body.group ? assertFields({ id: req.body.group }).id : null;

    const s = await controller.createProject(
      token,
      name,
      description,
      size,
      group
    );
    console.log(s);
    res.status(200).jsonp({ id: s.insertId });
  } catch (error) {
    //fs.unlinkSync(req.file.path);
    console.error(error);

    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.post("/add-image", upload.single("image"), async (req, res) => {
  try {
    const { id: projectId } = assertFields({ id: req.body.projectId });
    if (!req.file) throw new ValidationError("No image was sent");
    if (!req.file.mimetype.startsWith("image/")) throw new ValidationError("The file must be an image");
    await controller.addImageToProject(
      req.headers.authorization,
      req.file,
      projectId
    );
    res.status(200).jsonp({});
  } catch (error) {
    //fs.unlinkSync(req.file.path);
    console.error(error);

    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

//GETS

router.get("/project-owner/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const author = await controller.getAuthor(id);
    res.status(200).jsonp({ author });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/project-image/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const image = await controller.getImage(id);
    res.type(image.mime).send(image.data);
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/project-canvas/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const canvas = await controller.getCanvas(id);
    res.status(200).jsonp({ ...canvas });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const token = req.query.key;
    const group = req.query.group;
    const projects = await controller.getProjects(token, group);
    res.status(200).jsonp(projects);
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/is-shared/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const isShared = await controller.isShared(id);
    res.status(200).jsonp({ shared: isShared });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

router.get("/shared-projects", async (req, res) => {
  try {
    const tags = req.query.tags;
    const projects = await controller.getShared(tags, req.query.search);
    res.status(200).jsonp(projects);
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

module.exports = router;
