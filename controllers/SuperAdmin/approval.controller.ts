import { Request, Response } from "express";
import { User, UserModel } from "../../model/userModel";

export class ApprovalController{

    public addApprovalRequest = async function(req: Request, res: Response){
        // ideally speaking we dont need to add a separate function for adding the request as, when a admin registers, their aproval status is by default pending.

    }

    public getAllApprovalRequests = async function(req: Request, res: Response){
        try{
            const approvalRequests = await UserModel.find({approval_status:"pending"})
            res.status(200).json(approvalRequests)
        }catch(error){
            res.status(500).json({message: 'Error fetching Approval Requests', error});
        }
    }

    public getApprovalRequestById = async function(req: Request, res : Response):Promise<void> {
        const {id} = req.params;
        try{
            const approvalRequest = await UserModel.findById(id);
            if(!approvalRequest){
                res.status(404).json({ message: 'Approval Request not found' });
            }
        }catch(error){
            res.status(500).json({ message: 'Error Approval Request', error });

        }
    }

    public rejectApprovalRequest = async function(req:Request, res: Response):Promise<void> {
        const {_id, ...approvalRequest} = req.body;
        try{
            const result = await UserModel.updateOne({ _id },
                { $set: { approval_status: 'rejected', ...approvalRequest } } 
            )
            if (result.modifiedCount === 0) {
                 res.status(404).json({ message: 'Approval request not found or already updated.' });
            }
    
             res.status(200).json({ message: 'Approval request rejected successfully.' });
        } catch (error) {
            console.error('Error rejecting approval request:', error);
             res.status(500).json({ message: 'An error occurred while rejecting the request.', error });
        }
        
        
    }

    // public updateRejectedApprovalRequest = async function(req:Request, res: Response):Promise<void> {
    //     const {_id, ...approvalRequest} = req.body;
    //     try{
    //         const result = await UserModel.updateOne({ _id },
    //             { $set: { approval_status: 'approved', ...approvalRequest } } 
    //         )
    //         if (result.modifiedCount === 0) {
    //              res.status(404).json({ message: 'Approval request not found or already updated.' });
    //         }
    
    //          res.status(200).json({ message: 'Approval request rejected successfully.' });
    //     } catch (error) {
    //         console.error('Error rejecting approval request:', error);
    //          res.status(500).json({ message: 'An error occurred while rejecting the request.', error });
    //     }
        
        
    // }

}