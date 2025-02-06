import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { ApiError } from "../../utils/ApiError";
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, "./public/users");
  },

  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, filename: string) => void
  ) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10485760 },
});

export const uploader =
  (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    return new Promise<void>((resolve, reject) => {
      /*
        upload.single returns a middleware function which needs to be executed so we have executed that middleware here inside our custom middleware by passing req, res and a callback function which is called when file is uploaded or any errors occured 
        the reason behind using Promise is that the multer operation is an asynchronous operation due to which we have called the next middleware in the chain after our file is uploaded 
      */
      upload.single(fieldName)(req, res, (err: any) => {
        if (err instanceof MulterError) {
          reject(
            new ApiError(
              400,
              `File Size is too big, upload less than ${(
                10485760 /
                (1024 * 1024)
              ).toFixed(2)}`,
              [err]
            )
          );
        } else if (err) {
          console.log(err);
          reject(new ApiError(500, "Internal Server Error", [err]));
        }
        resolve();
      });
    })
      .then(() => {
        next();
      })
      .catch((err) => next(err));
  };
