const crypto = require("crypto");

const generateSercret = () => {
  return crypto.randomBytes(12).toString("hex");
};

console.log(generateSercret());
