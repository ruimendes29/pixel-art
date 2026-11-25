const express = require("express");

const router = express.Router();
const controller = require("../../controllers/likes/likes");
const { assertFields } = require("../../resources/fields");

router.get("/number/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const numberOfLikes = await controller.getLikes(projectId);
    res.status(200).jsonp({ likes: numberOfLikes });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message });
  }
});

router.get("/liked/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const token = req.query.key;
    const liked = await controller.doesUserLikePost(token, projectId);
    res.status(200).jsonp({ liked });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message });
  }
});

router.post("/like", async (req, res) => {
  try {
    const token = req.body.token;
    const { id: projectId } = assertFields({ id: req.body.projectId });
    const liked = await controller.likePost(token, projectId);
    res.status(200).jsonp({ liked });
  } catch (error) {
    console.error(error);
    res.status(error.status || 401).jsonp({ error: error.message });
  }
});

router.delete("/:projectId", async(req,res) => {
    try{
        const projectId = req.params.projectId;
        const token = req.query.key;
        const liked = await controller.unlikePost(token,projectId);
        res.status(200).jsonp({ liked });
    }
    catch (error) {
        console.error(error);
        res.status(error.status || 401).jsonp({ error: error.message });
      }
})

module.exports = router;
