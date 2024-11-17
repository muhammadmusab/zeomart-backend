import { AuthError, BadRequestError } from "../utils/api-errors";
import { verifyDecodedToken } from "../types/general";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Token } from "../models/Token";
const jwt = require("jsonwebtoken");
import fs from "fs";
import path from "path";
import { Auth } from "../models/Auth";

const jwtAccessPublicKey = fs.readFileSync(
  path.join(__dirname, "../config", "access-token.public.pem"),
  "utf8"
);
const optionalMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let user;
    // getting accessToken from header
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");
 

    // throwing err if token not found in header
    if (!accessToken) {
      return next();
    }
    // adding verify
    const verifyOptions = {
      // @ts-ignore
      issuer: global.PLATFORM_NAME,
      // subject: req.query.user,
      audience: process.env.DOMAIN,
      expiresIn: process.env.JWT_ACCESS_EXPIRY,
      algorithms: [process.env.JWT_HASH_ALGORITHM],
      ignoreExpiration: true,
    };
    const decoded = jwt.verify(
      accessToken,
      jwtAccessPublicKey,
      // @ts-ignore
      verifyOptions
    );

    if (!decoded.email) {
      return next();
    }
    user = await Auth.findOne({
      where: {
        email: decoded.email,
      },
      include: [
        {
          model: User,
        },
      ],
    });

    // @ts-ignore
    req.user = user;
    next();
  } catch (error: any) {
    console.log(error.message);
    res.status(401).send({ message: "Unauthorized" });
  }
};
export default optionalMiddleware;
