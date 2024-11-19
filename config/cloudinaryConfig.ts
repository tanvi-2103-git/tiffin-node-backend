import { Request, Response, NextFunction } from "express";

import dotenv from "dotenv"
import multer, { Multer } from 'multer';
import { v2 as cloudinary, UploadApiResponse, 
UploadApiErrorResponse } from 'cloudinary';
import sharp from 'sharp';

dotenv.config();
 
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_NAME, 
 api_key:  process.env.CLOUDINARY_API_KEY, 
 api_secret:  process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryFile extends Express.Multer.File {
 buffer: Buffer;
}

//multer middleware
const storage = multer.memoryStorage();
export const upload: Multer = multer({ storage: storage });

//cloudinary service
export const uploadToCloudinary =(folder:string)=>{ return async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file: CloudinaryFile = req.file as CloudinaryFile;
    console.log("file", file);
    console.log(folder);
    
    if (!file) {
      // next(new Error('No files provided'));
      // return;
      res.send({message: "No files provided"})
    }else{
      let cloudinaryUrl: string = '';
    
      const resizedBuffer: Buffer = await sharp(file.buffer)
        .resize({ width: 800, height: 600 })
        .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
        } as any,
        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (err) {
            console.error('Cloudinary upload error:', err);
            // next(err);
          } else if (!result) {
            console.error('Cloudinary upload error: Result is undefined');
            // next(new Error('Cloudinary upload result is undefined'));
          } else {
            cloudinaryUrl=result.secure_url;
            console.log("cloudinaryUrl",cloudinaryUrl);
            return res.json({image:cloudinaryUrl})
              // req.body.cloudinaryUrl = cloudinaryUrl;
              // next();
            
          }
        }
      );
      uploadStream.end(resizedBuffer);
    }
  } catch (error) {
    console.error('Error in uploadToCloudinary service:', error);
    next(error);
  }
}};
