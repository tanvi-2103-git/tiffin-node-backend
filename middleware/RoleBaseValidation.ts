import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RoleModel } from "../model/roleModel";

// export const RoleBaseValidation = (...allowedRoles: string[]) => {

//   return async (req: Request, res: Response, next: NextFunction) => {
//     try{
//     const token = req.headers.authorization?.split(" ")[1];
//     if (token) {
//       const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
//         userId: string;
//         role: string;
//       };

//       const userRole = decoded.role;

//       console.log(allowedRoles);

//       console.log(userRole);

//       if (!allowedRoles.includes(userRole)) {
//         res.status(403).json({ message: "Access Denied" });
//       } else {
//         next();
//       }
//     }
// }catch(err){
//     res.status(403).json({ message: err });
// }



//   };
// };


export const RoleBaseValidation = (permission: string) => {

  return async (req: Request, res: Response, next: NextFunction) => {
    try{
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
        userId: string;
        role: string;
      };

      const userRole = decoded.role;
      const role = await RoleModel.findById(userRole);
      console.log(role);
      console.log("permission required:", permission);
      console.log("user permissions:", role?.role_permission);

      if (!role?.role_permission?.includes(permission)) {
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