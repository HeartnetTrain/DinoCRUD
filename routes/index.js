var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  const dinos = req.app.locals.dinos;

  dinos
    .find()
    .limit(10)
    .toArray((err, recent) => {
      res.render("index", { recent });
    });
});

module.exports = router;
