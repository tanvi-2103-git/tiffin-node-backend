import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const RoleBaseValidation = (...allowedRoles: string[]) => {

  return async (req: Request, res: Response, next: NextFunction) => {
    try{ 
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
        userId: string;
        role: string;
      };

      const userRole = decoded.role;

      console.log(allowedRoles);

      console.log(userRole);

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ message: "Access Denied" });
      } else {
        next();
      }
    }
}catch(err){
    res.status(403).json({ message: err });
}



  };
};
