import { Request, Response } from 'express';

export  const Admin =async(req: Request, res: Response)=>{
    res.status(200).json({message:'Welcome Admin'})
    
  } 