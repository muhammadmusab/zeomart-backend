import type { Seeder } from "../umguz";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
function formatDate(date: Date) {
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hour = ("0" + date.getHours()).slice(-2);
  var minute = ("0" + date.getMinutes()).slice(-2);
  var second = ("0" + date.getSeconds()).slice(-2);
  return (
    year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second
  );
}

const jwtAccessPrivateKey = fs.readFileSync(
  path.join(__dirname, "../config", "access-token.private.pem"),
  "utf8"
);
const jwtRefreshPrivateKey = fs.readFileSync(
  path.join(__dirname, "../config", "refresh-token.private.pem"),
  "utf8"
);
const generateJWT = (expiresIn = "15m", tokenType = "refresh") => {
  let privateKey = jwtAccessPrivateKey;

  if (tokenType === "refresh") privateKey = jwtRefreshPrivateKey;

  const payload = { id: 1, type: "user", email: "muhammadmusab2020@gmail.com" };

  const options = {
    // @ts-ignore
    issuer: "phm",
    audience: process.env.DOMAIN,
    expiresIn,
    algorithm: process.env.JWT_HASH_ALGORITHM as any,
  };
  let token = jwt.sign(payload, privateKey, options);

  return token;
};
const generateHash = (password: string) => {
  const hashPassword = bcrypt.hashSync(password, 8);
  
  return hashPassword;
};
const seedAuth = [
  {
    id: 1,
    uuid: uuidv4(),
    email: "muhammadmusab2020@gmail.com",
    password: generateHash("test1234"),
    type: "user",
    UserId: 1,
    verified:true,
    authType: "custom",
    status: "user_verified",
    createdAt: formatDate(new Date()),
  },
];

const seedToken = [
  {
    id: 1,
    uuid: uuidv4(),
    token: generateJWT(),
    AuthId: 1,
    createdAt: formatDate(new Date()),
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Auth", seedAuth);
  await sequelize.getQueryInterface().bulkInsert("Tokens", seedToken);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("Auth", { id: seedAuth.map((u) => u.id) });
  await sequelize
    .getQueryInterface()
    .bulkDelete("Tokens", { id: seedToken.map((u) => u.id) });
};
