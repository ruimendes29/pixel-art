const express = require("express");

const router = express.Router();
const controller = require("../../controllers/group/group");

router.get("/own", async (req, res) => {
  try {
    const token = req.query.key;
    const groups = await controller.getGroups(token);
    res.status(200).jsonp(groups);
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message, field: error.field });
  }
});

module.exports = router;
