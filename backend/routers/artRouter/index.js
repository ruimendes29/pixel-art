const express = require("express");
const multer = require("multer");

// canvas images are kept in memory and saved in the database
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 4 },
});

const router = express.Router();
const controller = require("../../controllers/art/art");

// POSTS

router.post("/share-project", async (req, res) => {
  try {
    const token = req.body.token;
    const projectId = req.body.id;
    const tags = req.body.tags;
    const description = req.body.description;

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
    res.status(401).jsonp({ error: error.message });
  }
});

router.post("/add-project", async (req, res) => {
  try {
    console.log(req.body);
    const { token, name, description, group, size } = req.body;

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

    res.status(401).jsonp({ error: error.message });
  }
});

router.post("/add-image", upload.single("image"), async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!req.file) throw new Error("No image was sent!");
    await controller.addImageToProject(
      req.headers.authorization,
      req.file,
      projectId
    );
    res.status(200).jsonp({});
  } catch (error) {
    //fs.unlinkSync(req.file.path);
    console.error(error);

    res.status(401).jsonp({ error: error.message });
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
    res.status(401).jsonp({ error: error.message });
  }
});

router.get("/project-image/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const image = await controller.getImage(id);
    res.type(image.mime).send(image.data);
  } catch (error) {
    console.error(error);
    res.status(401).jsonp({ error: error.message });
  }
});

router.get("/project-canvas/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const canvas = await controller.getCanvas(id);
    res.status(200).jsonp({ ...canvas });
  } catch (error) {
    console.error(error);
    res.status(401).jsonp({ error: error.message });
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
    res.status(401).jsonp({ error: error.message });
  }
});

router.get("/is-shared/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const isShared = await controller.isShared(id);
    res.status(200).jsonp({ shared: isShared });
  } catch (error) {
    console.error(error);
    res.status(401).jsonp({ error: error.message });
  }
});

router.get("/shared-projects", async (req, res) => {
  try {
    const tags = req.query.tags;
    const projects = await controller.getShared(tags);
    res.status(200).jsonp(projects);
  } catch (error) {
    console.error(error);
    res.status(401).jsonp({ error: error.message });
  }
});

module.exports = router;
