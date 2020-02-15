var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const MongoClient = require("mongodb").MongoClient;
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const session = require("express-session");
const flash = require("connect-flash");
const auth = require("./utils/auth");
const hbs = require("hbs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

var app = express();

MongoClient.connect(
  "mongodb://localhost:27017/dinoDB",
  { useUnifiedTopology: true },
  (err, client) => {
    if (err) console.log(err);

    const db = client.db("dinoDB");
    const dinos = db.collection("dinos");
    app.locals.dinos = dinos;
  }
);

passport.use(
  new Strategy(
    {
      usernameField: "dinoname"
    },
    (dinoname, password, done) => {
      app.locals.dinos.findOne({ dinoname }, (err, dino) => {
        if (err) {
          return err;
        }
        if (!dino) {
          return done(null, false);
        }
        if (dino.password != auth.hashPassword(password)) {
          return done(null, false);
        }

        return done(null, dino);
      });
    }
  )
);

// Setting Dino's id as a browser's cookie
passport.serializeUser((dino, done) => {
  done(null, dino._id);
});

// Getting the id from the cookie
passport.deserializeUser((id, done) => {
  done(null, { id });
});
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({ secret: "session secret", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  next();
});
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
