const path = require("path");

const express = require("express");

const rootDir = require("./util/path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");

const app = express();
const port = 3000;

// EJS template engine set up
app.set("view engine", "ejs");
app.set("views", "views");
// / EJS template engine set up

app.use(express.static(path.join(rootDir, "public")));

app.use(express.urlencoded({ extended: true }));

app.use("/admin", adminRoutes);

app.use(shopRoutes);

app.use(errorController.get404);

app.listen(port, () => {
  console.log(`The server is up at https://localhost:${port}`);
});
