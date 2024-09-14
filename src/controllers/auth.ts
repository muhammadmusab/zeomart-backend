import { Token } from "../models/Token";
import { Auth } from "../models/Auth";
import { MailToken } from "../models/MailToken";
import { User } from "../models/User";
import { Vendor } from "../models/Vendor";

import { UserType, AuthType, AuthStatus, AuthData } from "../types/model-types";

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { AuthError, BadRequestError, CustomError } from "../utils/api-errors";
import {
  generateResetPasswordMail,
  generateVerificationMail,
} from "../utils/generate-mail";
import { verifyDecodedToken } from "../types/general";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Address } from "../models/Address";
import { UnprocessableError } from "../utils/api-errors/unprocessable-content";
import { ServerError } from "../utils/api-errors/server-error";

const jwtMailPublicKey = fs.readFileSync(
  path.join(__dirname, "../config", "jwt-mail-public.pem"),
  "utf8"
);
const jwtRefreshPublicKey = fs.readFileSync(
  path.join(__dirname, "../config", "refresh-token.public.pem"),
  "utf8"
);
// ======Register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { email, password } = req.body;

    // check if email exists:
    const existingEmail = await Auth.findOne({
      where: {
        email: email,
      },
    });

    if (existingEmail) {
      const err = new BadRequestError("email already exists");
      return next(err);
    }

    // we get query from FE
    const type = req.query.type ? (req.query.type as UserType) : UserType.USER;

    let user;
    let vendor;
    let auth;

    // create user
    if (type === UserType.USER) {
      const { firstName, lastName } = req.body;
      user = await User.create({
        firstName,
        lastName,
      });
    }

    // create vendor
    else if (type === UserType.VENDOR) {
      const { address, name } = req.body;
      const { streetAddress, city, zip, state } = address;

      vendor = await Vendor.create({
        name,
      });

      await Address.create({
        streetAddress,
        city,
        zip,
        state,
        VendorId: vendor.dataValues.id,
      });
    }

    let authPayload: AuthData = {
      email,
      password,
      authType: AuthType.CUSTOM,
      type: type,
      UserId: type === UserType.USER && user ? user.dataValues.id : null,
      VendorId:
        type === UserType.VENDOR && vendor ? vendor.dataValues.id : null,
    };
    if (req.file && req.file?.fieldname) {
      authPayload.avatar = `${process.env.IMAGE_DOMAIN}/media/${req.file?.filename}`;
    }

    auth = await Auth.create(authPayload);

    //@ts-ignore
    delete auth.dataValues.id;
    delete auth.dataValues.UserId;
    delete auth.dataValues.VendorId;

    if (user) {
      delete user.dataValues.id;
    } else if (vendor) {
      delete vendor?.dataValues.id;
    }

    const returnObject = {
      auth,
      [UserType.USER === type ? "user" : "vendor"]: user ? user : vendor,
    };

    if (auth) {
      const token = await auth.generateMailToken();

      await generateVerificationMail(auth.email, token, type);

      res.status(201).send({ message: "Success", data: returnObject });
    } else {
      const err = new BadRequestError("Bad Request");
      return next(err);
    }
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
};
export const ResendVerificationMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { email } = req.body;

    // check if email exists:
    const existingEmail = await Auth.scope("withoutPassword").findOne({
      where: {
        email,
      },
    });
    if (!existingEmail) {
      const err = new BadRequestError(
        "No registered user found with this email"
      );
      return next(err);
    }

    if (existingEmail.verified) {
      const err = new BadRequestError("The user is already verified");
      return next(err);
    }

    const token = await existingEmail.generateMailToken();
    const result = await generateVerificationMail(
      existingEmail.email,
      token,
      req.query.type as UserType
    );
    let message = "Success";
    if (result.rejected.length) {
      const err = new ServerError("Error, Failed to send an email");
      return next(err);
    }
    res.send({ message });
  } catch (error) {
    // next(error);
    next(error);
  }
};

//======Google Signin
export const googleSignin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // we get query from FE
    const type = req.query.type as UserType;

    let { contact, profileImage = null, googleToken } = req.body; //for AUTH and general use
    const { firstName, lastName } = req.body; //for USER
    const { storeName, mobile } = req.body; //for SELLER
    let vendor;
    let user;
    let authType = AuthType.SOCIAL;
    let auth;

    const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    // get payload from googleToken
    const payload = ticket.getPayload();

    const email = payload?.email as string;

    auth = await Auth.scope("withoutPasswordAndVerified").findOne({
      where: {
        email,
        authType: authType,
      },
      include: { model: User },
    });

    // user does not exists create new user as per type and also populate auth table
    if (!auth) {
      if (type === UserType.USER) {
        user = await User.create({
          firstName,
          lastName,
        });
      }

      auth = await Auth.create({
        email,
        type: type,
        UserId: type === UserType.USER && user ? user?.id : null,
        // SellerId: type === UserType.USER && vendor ? vendor?.id : null,
      });
      //@ts-ignore
      delete auth.User.dataValues.id;

      const token = await auth.generateMailToken();
      await generateVerificationMail(auth.email, token, type);
      res.send({ message: "Success", data: auth });
      return;
    } else {
      // if auth-user already exists
      if (type === UserType.USER && auth.UserId) {
        user = await User.findOne({
          where: {
            id: auth.UserId,
          },
        });

        if (user) {
          user.firstName = firstName ? firstName : user.firstName;
          user.lastName = lastName ? lastName : user.lastName;
          await user.save();
        }
      }

      // save auth model values
      await auth.save();

      // generate new access and refresh tokens when user signs in
      const accessToken = auth.generateJWT();

      const refreshToken = auth.generateJWT(
        process.env.JWT_REFRESH_EXPIRY,
        "refresh"
      );

      // save refresh token to database
      await Token.create({
        token: refreshToken,
        AuthId: auth.id as number, //authId
      });

      // option for cookies
      const cookieOptions = {
        maxAge: getFormattedExpiry(),
        secure: process.env.NODE_ENV !== "dev" ? true : false,
        httpOnly: true,
        // domain: 'http://localhost:8080',
      };

      // sending refresh token to FE using cookies
      res.cookie("refresh_token", refreshToken, cookieOptions);
      // sending data and access_token via response
      res.send({ user: auth, accessToken, message: "Success" });
    }
  } catch (error: any) {
    if (error.message) {
      console.log(error.message);
    }
    next(error);
  }
};

// ======Verify Email Address
export const verifyEmailAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.query.token as string;

    const options = {
      // @ts-ignore
      issuer: PLATFORM_NAME,
      audience: process.env.DOMAIN,
      expiresIn: process.env.JWT_MAIL_EXPIRY,
      algorithm: process.env.JWT_HASH_ALGORITHM,
    };
    const payload = jwt.verify(token, jwtMailPublicKey, options);
    verifyDecodedToken(payload);

    const auth = await Auth.scope("withoutPassword").findOne({
      where: {
        email: payload.email,
      },
    });
    if (!auth) {
      const err = new UnprocessableError("could not find user with this email");
      return next(err);
    }

    const mailToken = await MailToken.destroy({
      where: {
        token,
        email: auth.email,
      },
    });

    if (auth.verified) {
      return res.status(200).send({
        message: "User is already verified",
      });
    }

    if (mailToken !== 1) {
      const err = new UnprocessableError("Couldn't verify, please try again");
      return next(err);
    }

    auth.verified = true;
    auth.status = AuthStatus.USER_VERIFIED;
    await auth.save();

    res.send({
      message: "Success",
      status: auth.status,
    });
  } catch (error) {
    // next(error);
    // const err = new ServerError();
    next(error);
  }
};

//======Signin
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const type = req.query.type as UserType;
    let auth = await Auth.scope("withPassword").findOne({
      where: {
        email,
        type
      },
    });

    if (!auth) {
      let err = new BadRequestError("Unable to login, User not found");
      return next(err);
    }
    // if account is not verified

    if (!auth?.verified) {
      const err = new AuthError("Please verify your profile");
      return next(err);
    }
    // compare passwords
    const isMatch = await bcrypt.compare(password, auth.password as string);

    if (!isMatch) {
      let err = new BadRequestError("Unable to login, wrong credentials");
      return next(err);
    }

    // generate new access and refresh tokens when auth signs in
    const accessToken = auth.generateJWT();

    const refreshToken = auth.generateJWT(
      process.env.JWT_REFRESH_EXPIRY,
      "refresh"
    );

    // save refresh token to database
    await Token.create({
      token: refreshToken,
      AuthId: auth.id as number, //authId
    });

    // option for cookies
    const cookieOptions = {
      maxAge: getFormattedExpiry(),
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
      // domain: 'http://localhost:8080',
    };

    auth = await Auth.findOne({
      where: {
        email,
        type
      },
      include: {
        model: type === UserType.USER ? User : Vendor,
      },
    });
    // sending refresh token to FE using cookies
    res.cookie("refresh_token", refreshToken, cookieOptions);
    // sending data and access_token via response

    res.send({
      data: { ...auth?.dataValues, accessToken },
      message: "Success",
    });
  } catch (error: any) {
    next(error);
  }
};

// =====Refresh Token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // objective : to get new tokens(refresh+access) when acess_token is expired on FE and user wants new acess token based on the refresh_token user provides
  try {
    const { refresh_token } = req.cookies;
    const { user } = req;
    // if no refresh_token provided from user then return with error
    if (!refresh_token) {
      const err = new Error() as CustomError;
      err.message = "Unauthorised";
      err.status = 401;
      return next(err);
    }
    // verify the given refreshToken
    const refreshTokenPayload = jwt.verify(refresh_token, jwtRefreshPublicKey);

    // return with error if verification failed(token is not valid)
    if (!refreshTokenPayload) {
      res.clearCookie("refresh_token");
      const err = new Error() as CustomError;
      err.message = "Unauthorised";
      err.status = 401;
      return next(err);
    }

    // find auth id by user email
    const auth = await Auth.scope("withoutPasswordAndVerified").findOne({
      where: { email: user.email },
    });

    // if user is not found in auth table based on the email provided return with error
    if (!auth) {
      res.clearCookie("refresh_token");
      const err = new Error() as CustomError;
      err.message = "Unauthorised";
      err.status = 401;
      return next(err);
    }

    // find the old refresh token which is saved in the database using the token provided by the user in payload and the auth id
    const oldRefreshToken = await Token.findOne({
      where: {
        token: refresh_token,
        AuthId: auth?.id,
      },
    });

    // if no token is found return with error
    if (!oldRefreshToken) {
      res.clearCookie("refresh_token");
      const err = new Error() as CustomError;
      err.message = "Unauthorised";
      err.status = 401;
      return next(err);
    }

    // generate new refresh & access tokens
    const accessToken = auth.generateJWT();
    const newRefreshToken = auth.generateJWT(
      process.env.JWT_REFRESH_EXPIRY,
      "refresh"
    );

    // replace old refresh token with new one
    oldRefreshToken.token = newRefreshToken;
    await oldRefreshToken.save();

    // setting up cookie options to send to FE side.
    const cookieOptions = {
      maxAge: getFormattedExpiry(),
      secure: process.env.NODE_ENV !== "production" ? false : true,
      httpOnly: true,
      // domain: 'http://localhost:8080',
    };

    // sending refresh token in the cookie
    res.cookie("refresh_token", newRefreshToken, cookieOptions);

    // sending access token in the user response
    res.status(200).send({ accessToken, message: "success" });
  } catch (error) {
    res.clearCookie("refresh_token");
    // next(error);
    next(error);
  }
};

// =====Signout
export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refresh_token } = req.cookies;

    const auth = await Auth.scope("withoutPasswordAndVerified").findOne({
      where: {
        email: req.user.email,
      },
    });
    if (refresh_token) {
      const result: any = await Token.destroy({
        where: {
          AuthId: auth?.id,
          token: refresh_token,
        },
      });
      if (!result) {
        const err = new BadRequestError("Invalid token");
        res.status(err.status).send({ message: err.message });
        return;
      }
    }
    res.clearCookie("refresh_token");
    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

// =====Forgot Password
export const resetPasswordMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    let user;

    user = await Auth.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      const err = new Error() as CustomError;
      err.message = "Invalid email";
      err.status = 401;
      return next(err);
    }
    const mailToken = await user.generateMailToken();
    generateResetPasswordMail(user.email, mailToken, user.type);

    res.send({ message: "Please check your email to reset password" });
  } catch (error) {
    // next(error);
    next(error);
  }
};

// =====Reset Password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;
    const token = req.query.token as string;
    const payload = jwt.verify(token, jwtMailPublicKey);
    verifyDecodedToken(payload);

    const user = await Auth.scope("withPassword").findOne({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      const err = new UnprocessableError(
        "Couldn't reset password, please try again"
      );
      return next(err);
    }
    const mailToken = await MailToken.destroy({
      where: {
        token,
        email: user.email,
      },
    });

    if (mailToken !== 1) {
      const err = new UnprocessableError(
        "Couldn't reset password, please try again"
      );
      return next(err);
    }
    user.password = password;
    await user.save();
    res.send({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    next(error);
    // next(error);
  }
};
export const resetPasswordWithoutMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await Auth.scope("withPassword").findOne({
      where: {
        email: req.user.email,
      },
    });

    // compare passwords
    const isMatch = await bcrypt.compare(oldPassword, user?.password as string);

    if (!isMatch || !user) {
      const err = new Error() as CustomError;
      err.message = "Couldn't reset password, please try again";
      err.status = 401;
      return next(err);
    }

    user.password = newPassword;
    await user.save();
    res.send({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    // next(err);
    next(error);
  }
};

// =====Delete Account
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await Auth.scope("withoutPasswordAndVerified").findOne({
      where: {
        email,
      },
    });

    if (!user) {
      const err = new BadRequestError("User Not Found");
      return next(err);
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password as string);

    if (!isMatch) {
      let err = new BadRequestError("Wrong credentials");
      return next(err);
    }
    if (user) {
      await Token.destroy({
        where: {
          AuthId: user.id,
        },
      });
      await Auth.destroy({
        where: {
          email: user.email,
        },
      });
    }
    if (user.UserId && user.type === UserType.USER) {
      await User.destroy({
        where: {
          id: user.UserId,
        },
      });
    } else if (user.VendorId && user.type === UserType.VENDOR) {
      await Vendor.destroy({
        where: {
          id: user.VendorId,
        },
      });
    }

    res.send({
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    // next(err);
    next(error);
  }
};

function getFormattedExpiry() {
  const maxAgeInDays = parseInt(process.env.JWT_REFRESH_EXPIRY as string);
  return maxAgeInDays * 24 * 60 * 60 * 1000;
}
