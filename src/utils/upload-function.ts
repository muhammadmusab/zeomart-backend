import { Request, Response, NextFunction } from "express";
//@ts-expect-error
import sharp from "sharp";

export const Upload = (type = "image") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let files;
      if (!req?.file && (!req.files || typeof req.files.map !== "function"))
        return res.status(403).send({ message: "Error, Bad Request" });

      const uploadedFiles = req.file ? [req.file] : req.files;
      if (uploadedFiles?.length) {
        files = await Promise.all(
          // @ts-expect-error
          uploadedFiles?.map(async (file: Express.Multer.File) => {
            const image = sharp(file.path);
            const metadata = await image.metadata();
            return {
              url: `${process.env.IMAGE_DOMAIN}/media/${file?.filename}`,
              width: file.mimetype.includes(type) ? metadata.width : undefined,
              height: file.mimetype.includes(type)
                ? metadata.height
                : undefined,
              size: file.size,
              mime: file.mimetype,
              name: file.filename,
            };
          })
        );
      }
      console.log(JSON.stringify(files));
      
      res.send({ message: "Success", data: files });
    } catch (error: any) {
      // console.log(error.message);
      next(error);
    }
  };
};
