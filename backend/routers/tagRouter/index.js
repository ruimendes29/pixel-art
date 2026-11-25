const express = require("express");
const router = express.Router();
const controller = require("../../controllers/tag/tag");
const { assertFields } = require("../../resources/fields");

// GET /api/tags?key=<token, optional>
router.get("/", async (req, res) => {
  try {
    res.status(200).jsonp(await controller.listTags(req.query.key));
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

// POST /api/tags { token, name }
router.post("/", async (req, res) => {
  try {
    const { newTag } = assertFields({ newTag: req.body.name });
    // same cleaning as tags sent when sharing: single spaces
    const name = await controller.createTag(req.body.token, newTag.replace(/\s+/g, " "));
    res.status(200).jsonp({ name });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

module.exports = router;
