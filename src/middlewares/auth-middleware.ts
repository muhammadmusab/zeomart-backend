import { AuthError } from "../utils/api-errors";
import { verifyDecodedToken } from "../types/general";
import { UserType } from "../types/model-types";
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
const authMiddleware = (ignoreExpiration = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user;
      // getting accessToken from header
      const accessToken = req.header("Authorization")?.replace("Bearer ", "");

      const { refresh_token } = req.cookies;

      const getRefreshToken = await Token.findOne({
        where: {
          token: refresh_token,
        },
      });
      // throwing err if token not found in header
      if (!accessToken || !getRefreshToken) {
        const err = new AuthError();
        err.message = "Unauthorised";
        return res.status(401).send({ message: err.message });
      }
      // adding verify
      const verifyOptions = {
        // @ts-ignore
        issuer: global.PLATFORM_NAME,
        // subject: req.query.user,
        audience: process.env.DOMAIN,
        expiresIn: "15m",
        algorithms: [process.env.JWT_HASH_ALGORITHM],
        ignoreExpiration: ignoreExpiration,
      };
      const decoded = jwt.verify(
        accessToken,
        jwtAccessPublicKey,
        // @ts-ignore
        verifyOptions
      );

      verifyDecodedToken(decoded, "email");

      user = await Auth.findOne({
        where: {
          email: decoded.email,
        },
        include: { model: User },
      });

      if (user?.verified) {
        const err = new AuthError();
        err.message = "User Not Verified";
        err.status = 401;
        return res.status(err.status).send(err.message);
      }

      if (decoded.type !== user?.type || !user) {
        const err = new AuthError();
        err.message = "Unauthorised";
        err.status = 401;
        return res.status(err.status).send(err.message);

        // next(err);
        // res.status(401).send(err);
      }

      // @ts-ignore
      req.user = user;
      next();
    } catch (error) {
      res.status(401).send({ message: "Unauthorized" });
    }
  };
};
export default authMiddleware;
