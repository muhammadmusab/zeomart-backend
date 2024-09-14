import express from "express";

import { uploadMiddleware } from '../../middlewares/upload-middleware';
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";
const router = express.Router();
import { Upload } from "../../utils/upload-function";

router.post(
  "/upload",
  uploadMiddleware().array("media", 5),
  // validate(createProductImageSchema),
  authMiddleware(UserType.VENDOR),
  Upload()
);

export default router;