const { PrismaClient } = require("@prisma/client");
const { verifyUserToken } = require("../common/token");
const { Unauthorized } = require("../utils/requestErrors");
const prisma = new PrismaClient();

//IN PROGRESS
const userAuth = async (req, res, next) => {
  try {
    const reqToken = req.headers.authorization;
    if (!reqToken) {
      throw new Unauthorized("Authorization token is missing.");
    }

    const token = reqToken.split(" ")[1];
    const userSecret = process.env.TOKEN_USER_SECRET;
    const user = await verifyUserToken(token, userSecret);
    if (user.error) {
      return res.status(user.statusCode).json({ error: user.error });
    }
    if (!user) {
      throw new Unauthorized("Invalid or expired user token.");
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};




module.exports = {
  userAuth,
  
};
