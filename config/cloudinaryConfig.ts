import { Request, Response, NextFunction } from "express";

import dotenv from "dotenv"
import multer, { Multer } from 'multer';
import { v2 as cloudinary, UploadApiResponse, 
UploadApiErrorResponse } from 'cloudinary';
import sharp from 'sharp';


dotenv.config();
 console.log("CLOUDINARY_NAME",process.env.CLOUDINARY_NAME);
 
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_NAME, 
 api_key:  process.env.CLOUDINARY_API_KEY, 
 api_secret:  process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryFile extends Express.Multer.File {
 buffer: Buffer;
}

const storage = multer.memoryStorage();
export const upload: Multer = multer({ storage: storage });

// export const uploadToCloudinary = async (req: Request, res: Response, next: NextFunction) => {
//  try {
//    const files: CloudinaryFile[] = req.files as CloudinaryFile[];
//    if (!files || files.length === 0) {
//      return next(new Error('No files provided'));
//    }
//    const cloudinaryUrls: string[] = [];
//    for (const file of files) {
//      const resizedBuffer: Buffer = await sharp(file.buffer)
//        .resize({ width: 800, height: 600 })
//        .toBuffer();

//      const uploadStream = cloudinary.uploader.upload_stream(
//        {
//          resource_type: 'auto',
//          folder: 'your-cloudinary-folder-name',
//        } as any,
//        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
//          if (err) {
//            console.error('Cloudinary upload error:', err);
//            return next(err);
//          }
//          if (!result) {
//            console.error('Cloudinary upload error: Result is undefined');
//            return next(new Error('Cloudinary upload result is undefined'));
//          }
//          cloudinaryUrls.push(result.secure_url);

//          if (cloudinaryUrls.length === files.length) {
//            //All files processed now get your images here
//            req.body.cloudinaryUrls = cloudinaryUrls;
//            next();
//          }
//        }
//      );
//      uploadStream.end(resizedBuffer);
//    }
//  } catch (error) {
//    console.error('Error in uploadToCloudinary middleware:', error);
//    next(error);
//  }
// };



export const uploadToCloudinary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file: CloudinaryFile = req.file as CloudinaryFile;
    console.log("file", file);
    
    if (!file) {
      next(new Error('No files provided'));
      return;
    }
    let cloudinaryUrl: string = '';
    
      const resizedBuffer: Buffer = await sharp(file.buffer)
        .resize({ width: 800, height: 600 })
        .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'tiffin_image',
        } as any,
        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (err) {
            console.error('Cloudinary upload error:', err);
            next(err);
          } else if (!result) {
            console.error('Cloudinary upload error: Result is undefined');
            next(new Error('Cloudinary upload result is undefined'));
          } else {
            cloudinaryUrl=result.secure_url;
            console.log("cloudinaryUrl",cloudinaryUrl);
            
            
              // All files processed now get your images here
              req.body.cloudinaryUrl = cloudinaryUrl;
              next();
            
          }
        }
      );
      uploadStream.end(resizedBuffer);
    
  } catch (error) {
    console.error('Error in uploadToCloudinary middleware:', error);
    next(error);
  }
};
