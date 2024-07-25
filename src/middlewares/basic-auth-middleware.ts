import * as basicAuth from "express-basic-auth";
const basicAuthMiddleware = basicAuth.default({
  users: {
    "kristijan.vidovic@pointsyncc.com": "Sr54rHdg84kLjZh",
    "musab.muhammad@pointsyncc.com": "Sr54rHdg84kLjZh",
    "shumas.muhammad@pointsyncc.com": "Sr54rHdg84kLjZh",
  },
  unauthorizedResponse: { error: "Un Authorized" },
});

export default basicAuthMiddleware;
