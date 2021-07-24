const path = require("path");

// This one is deprecated
// module.exports = path.dirname(process.mainModule.filename)

// So we can use this instead
module.exports = path.dirname(require.main.filename);
