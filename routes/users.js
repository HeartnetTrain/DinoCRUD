var express = require("express");
var router = express.Router();
const ObjectID = require("mongodb").ObjectID;

router.get("/", function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect("/auth/login");
  }
  const dinos = req.app.locals.dinos;
  const _id = ObjectID(req.session.passport.user);

  dinos.findOne({ _id }, (err, results) => {
    if (err) {
      throw err;
    }

    res.render("account", { ...results });
  });
});

// Get public profile for any dinosaure

router.get("/:dinoname", (req, res, next) => {
  const dinos = req.app.locals.dinos;
  const dinoname = req.params.dinoname;

  dinos.findOne({ dinoname }, (err, results) => {
    if (err || !results) {
      res.render("public-profile", {
        messages: { error: ["Dinosaure not found"] }
      });
    }

    res.render("public-profile", { ...results, dinoname });
  });
});

router.delete("/users/:id", (req, res) => {
  const _id = ObjectID(req.session.passport.user);
  const dinos = req.app.locals.dinos;

  dinos.deleteOne({ _id: _id }, err => {
    if (err) throw err;
    res.redirect("/");
  });
});

router.post("/", (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/auth/login");
  }

  const dinos = req.app.locals.dinos;
  const { name, race, family, food, age } = req.body;
  const _id = ObjectID(req.session.passport.user);

  dinos.updateOne({ _id }, { $set: { name, race, family, food, age } }, err => {
    if (err) {
      throw err;
    }

    res.redirect("/users");
  });
});

module.exports = router;
