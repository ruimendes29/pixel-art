const express = require("express");

const router = express.Router();
const controller = require("../../controllers/group/group");

router.get("/own", async (req, res) => {
  try {
    const token = req.query.key;
    const groups = await controller.getGroups(token);
    res.status(200).jsonp(groups);
  } catch (e) {
    console.error(error);
    res.status(401).jsonp({ error: error.message });
  }
});

module.exports = router;
