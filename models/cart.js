const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");

const cartFile = path.join(rootDir, "data", "cart.json");

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous Cart
    fs.readFile(cartFile, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      // Analyze the cart => Find existing product
      const existingProductIdx = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIdx];
      let updatedProduct;
      // Add new product / increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
      } else {
        updatedProduct = { id: id, qty: 1 };
      }
      cart.totalPrice = cart.totalPrice + productPrice;
    });
  }
};
