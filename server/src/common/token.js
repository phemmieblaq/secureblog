const jwt = require("jsonwebtoken");
const { BadRequest } = require("../utils/requestErrors");

exports.generateToken = (payload, secret, expired) => {
  return jwt.sign(payload, secret, {
    expiresIn: expired,
  });
};

exports.verifyUserToken = async (token, secret) => {
  try {
    const validate = await jwt.verify(token, secret);

    if (!validate) {
      throw new BadRequest("Authentification error, please check your token.");
    }
    return validate;
  } catch (error) {
    throw error;
  }
};
