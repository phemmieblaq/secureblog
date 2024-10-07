const bcrypt = require("bcryptjs");
hasher = (value, salt) => bcrypt.hash(value, salt);
matchChecker = (value, dbValue) => {
  let compare = bcrypt.compare(value, dbValue);
  return compare;
};

module.exports = { hasher, matchChecker };
