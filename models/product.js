const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    const productsFile = path.join(rootDir, "data", "products.json");
    fs.readFile(productsFile, (err, fileContent) => {
      let products = [];
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this);
      fs.writeFile(productsFile, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    const productsFile = path.join(rootDir, "data", "products.json");
    fs.readFile(productsFile, (err, fileContent) => {
      if (!err) {
        return cb(JSON.parse(fileContent));
      }
      cb([]);
    });
  }
};
