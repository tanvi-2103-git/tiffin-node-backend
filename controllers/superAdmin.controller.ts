import { UserModel } from "../model/userModel";
import { Request, Response } from 'express';

export class SuperAdminController{

  
    
    public pendingApproval = 
    async (req: Request, res: Response) => {
        const result = await UserModel.find({role:"Admin","role_specific_details.subadmin.approval_status":"pending"}).exec();
        res.status(200).json(result);
    }
   

}