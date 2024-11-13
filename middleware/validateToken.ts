import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request,Response, NextFunction } from 'express';

export interface CustomRequest extends Request {
  token: string | JwtPayload;
 }
export const validateToken =async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
 
    if (!token) {
        res.status(400).json('No token found');
    }
    else{
 
    const decoded = jwt.verify(token, process.env.SECRET_KEY!);
    (req as CustomRequest).token = decoded;
 
    next();}
  } catch (err) {
    res.status(401).send(`Please authenticate ${err}`);
  }
 };

// middleware.ts



// import jwt, { JwtPayload } from 'jsonwebtoken';
// import { Request, Response, NextFunction } from 'express';

// // Define the structure of your JWT payload
// export interface CustomJwtPayload extends JwtPayload {
//   id: string;
//   role: string;
// }

// export interface CustomRequest extends Request {
//   token: CustomJwtPayload;  // Token now has the proper structure
// }

// // Type guard to check if the decoded token is a CustomJwtPayload
// function isCustomJwtPayload(decoded: any): decoded is CustomJwtPayload {
//   return typeof decoded === 'object' && 'id' in decoded && 'role' in decoded;
// }

// export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(400).json('No token found');
//     }

//     const decoded = jwt.verify(token, process.env.SECRET_KEY!);

//     // Check if the decoded token is of type CustomJwtPayload
//     if (isCustomJwtPayload(decoded)) {
//       (req as CustomRequest).token = decoded;  // TypeScript now knows that decoded is CustomJwtPayload
//       next();
//     } else {
//       // Handle the case where the decoded token is invalid or doesn't match expected structure
//       return res.status(401).json('Invalid token');
//     }
//   } catch (err) {
//     res.status(401).send(`Please authenticate ${err}`);
//   }
// };





