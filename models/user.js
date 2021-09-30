const { ObjectId } = require("mongodb");
const { getDb } = require("../util/database");
const Product = require("./product");

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    db.collection("users").insertOne(this);
  }

  addToCart(product) {
    let cartProductIndex = -1;
    let updatedCartItems = [];
    if (this.cart.items) {
      cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
      });
      updatedCartItems = [...this.cart.items];
    }

    let newQuantity = 1;
    if (cartProductIndex >= 0) {
      const newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      )
      .then((result) => result)
      .catch((err) => console.log(err));
  }

  removeFromCart(prodId) {
    const updatedCartItems = this.cart.items.filter(
      (product) => product.productId.toString() !== prodId.toString()
    );

    const updatedCart = {
      items: updatedCartItems,
    };

    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      )
      .then((result) => {
        return result;
      })
      .catch((err) => console.log(err));
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(
      (prod) => new ObjectId(prod.productId)
    );

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        if (products.length !== productIds.length) {
          const productIdsNotCart = productIds.filter((productId) => {
            for (const product of products) {
              if (productId.toString() === product._id.toString()) return false;
            }
            return true;
          });
          console.log(productIdsNotCart);
          const newCart = {
            items: this.cart.items.filter((item) => {
              for (let i = 0; i < productIdsNotCart.length; i++) {
                if (
                  item.productId.toString() === productIdsNotCart[i].toString()
                )
                  return false;
              }
              return true;
            }),
          };
          db.collection("users").updateOne(
            { _id: this._id },
            { $set: { cart: newCart } }
          );
        }
        return products.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find((p) => {
              return p.productId.toString() === product._id.toString();
            }).quantity,
          };
        });
      })
      .catch((err) => console.log(err));
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
            email: this.email,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: this.cart } }
          );
      })
      .catch((err) => console.log(err));
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        return user;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
