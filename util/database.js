const { MongoClient } = require("mongodb");
let _db;
const uri =
  "mongodb+srv://dimitris:123123qweqwe@cluster0.9vwun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const mongoConnect = (callback) => {
  MongoClient.connect(uri)
    .then((client) => {
      _db = client.db();
      callback();
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  if (_db) {
    return _db;
  }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
