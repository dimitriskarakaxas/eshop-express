const fs = require("fs");

const deleteFile = (filePath) => {
  const newFilePath = `.${filePath}`;
  fs.unlink(newFilePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
