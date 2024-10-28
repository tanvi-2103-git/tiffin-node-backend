// import { Request, Response, NextFunction } from 'express';

// const authorizeRoles  =(...allowedRoles: string[] ) =>{
//     return(req: Request , res: Response, next: NextFunction) =>{
//         if(!allowedRoles.includes(req.user.role)){
//             return res.status(403).json({message : "Access Denied"});
//         }
//         next();
//     };
// };

// module.exports = authorizeRoles;