import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request,Response, NextFunction } from 'express';
// import dotenv from 'dotenv';
// dotenv.config();

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