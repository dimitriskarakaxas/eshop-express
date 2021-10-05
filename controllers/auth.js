const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session);

  res.render("auth/login", {
    pageTitle: "Login",
    path: "auth/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("615acf2c969517cf1f11dbbf", "_id")
    .then((userId) => {
      if (userId) {
        req.session.userId = userId._id;
        req.session.isLoggedIn = true;
        req.session.save((err) => {
          if (err) console.log(err);
          return res.redirect("/");
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
