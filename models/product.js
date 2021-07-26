const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");

const getProductsFromFile = (cb) => {
  const productsFile = path.join(rootDir, "data", "products.json");
  fs.readFile(productsFile, (err, fileContent) => {
    if (!err) {
      return cb(JSON.parse(fileContent));
    }
    return cb([]);
  });
};

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(productsFile, JSON.stringify(products), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
    const productsFile = path.join(rootDir, "data", "products.json");
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
