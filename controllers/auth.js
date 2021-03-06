const { randomBytes } = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");

const User = require("../models/user");

dotenv.config();

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors.array());
    return res.status(422).render("auth/login", {
      pageTitle: "Signup",
      path: "/login",
      errorMessage: validationErrors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: validationErrors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: "",
            password: "",
          },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.userId = user._id;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              if (err) console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors.array());
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: validationErrors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: validationErrors.array(),
    });
  }

  bcrypt
    .genSalt(12)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "mitsoskarakaxas@gmail.com",
        subject: "Signup Succesfully",
        html: "<h1>You succesfully signed up!</h1>",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/password-reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postRestPassword = (req, res, next) => {
  // Check for email existance in database
  User.findOne({ email: req.body.email })
    .then((user) => {
      // User doesn't exist
      if (!user) {
        req.flash("error", "There is no user with this email address.");
        return res.redirect("/reset");
      }
      // User exists in database
      // Generate unique strong random token with crypt nodejs module
      randomBytes(32, (err, buffer) => {
        if (err) {
          req.flash(
            "error",
            "Something went wrong:( Try again in a few minutes."
          );
          return res.redirect("/reset");
        }

        user.resetToken = buffer.toString("hex");
        user.resetTokenExpiration = Date.now() + 900000; // This token will be outdated in 15min

        // Save token to the user requested for password reset
        user
          .save()
          .then((user) => {
            res.redirect("/");
            // Send email with reset link to the user
            transporter.sendMail({
              to: req.body.email,
              from: "mitsoskarakaxas@gmail.com",
              subject: "Reset Password",
              html: `
                <h1>Reset your Node-Eshop password</h1>
                <p>We heard that you lost Node-Eshop password. Sorry about that!</p>
                <p>But don't worry! You can use the following link to reset your password</p>
                <a style="padding: 10px; background: lightgreen; text-decoration: none; font-size: 21px;" href="http://localhost:3000/reset/${user.resetToken}">Reset Password</a>
              `,
            });
          })
          .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
          });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  // Check to whom user :token exists to.
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/reset",
        pageTitle: "Reset Password",
        errorMessage: message,
        userId: user._id.toString(),
        resetToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  let resetUser;

  User.findOne({
    _id: req.body.userId,
    resetToken: resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.genSalt(12);
    })
    .then((salt) => {
      return bcrypt.hash(newPassword, salt);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
