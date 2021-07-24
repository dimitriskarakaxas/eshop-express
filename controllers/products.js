const Product = require("../models/product");

module.exports.getAddProduct = (req, res, next) => {
  res.render("add-product", {
    pageTitle: "Shop Add-product",
    path: "/admin/add-product",
  });
};

module.exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect("/");
};

module.exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop", { prods: products, pageTitle: "Shop", path: "/" });
  });
};
