// utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (id, secret, expiresIn = "7d") => {
  return jwt.sign({ id }, secret, { expiresIn });
};

export default generateToken;
