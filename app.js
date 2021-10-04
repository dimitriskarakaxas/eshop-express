const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const User = require("./models/user");

const app = express();
const port = 3000;

// Setting up EJS templating engine
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("615acf2c969517cf1f11dbbf")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://dimitris:123123qweqwe@cluster0.9vwun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  )
  .then(() => {
    User.findOne({ name: "Dimitris Karakaxas" }).then((user) => {
      if (!user) {
        const user = new User({
          name: "Dimitris Karakaxas",
          email: "karakaxasdimitrios@yahoo.com",
          cart: { items: [] },
        });
        user.save();
      }
    });
    app.listen(port, () => {
      console.log(`The server is up at http://localhost${port}`);
    });
  });
