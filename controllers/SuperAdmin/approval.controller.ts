import { Request, Response } from "express";
import { User, UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";

export class ApprovalController {
  public addApprovalRequest = async function (req: Request, res: Response) {
    // ideally speaking we dont need to add a separate function for adding the request as, when a admin registers, their aproval status is by default pending.
  };


  public getAllPendingAdminApprovalRequests = async  (
    req: Request,
    res: Response
  )=> {
    try {
     const page = parseInt(req.query.page as string) || 1; 
     const limit = parseInt(req.query.limit as string) || 10;

     if(page < 1 || limit < 1){
      res.status(400).json({ message: "Page and limit must be positive integers" });
      return;
      
     }

     const skip = (page - 1) * limit;

      const approvalRequests = await UserModel.find({
        role_id: "672775e4f2a1e38ef52c63c6", //admin
        "role_specific_details.approval_status": "pending",
      }).skip(skip).limit(limit).exec();
      
      // const totalItems = await UserModel.countDocuments();

      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "pending",
      });

      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({ 
        statuscode: 200, 
        data: approvalRequests,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
       });
    } catch (error) {
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "Error fetching Approval Requests",
          error,
        });
    }
  };


  public getAllApprovedAdmin = async  (req: Request, res: Response) =>{
    try {
      const page = parseInt(req.query.page as string) || 1; 
      const limit = parseInt(req.query.limit as string) || 10;
      

      if(page < 1 || limit < 1){
        res.status(400).json({ message: "Page and limit must be positive integers" });
        return;
        
       }

      const skip = (page - 1) * limit;

      const approvalRequests = await UserModel.find({
        role_id: "672775e4f2a1e38ef52c63c6", //admin
        "role_specific_details.approval_status": "approved",
      }).skip(skip).limit(limit).exec();
     
      // const totalItems = await UserModel.countDocuments();

      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "approved",
      });

      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({ 
        statuscode: 200,
         data: approvalRequests,
         pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
        });
    } catch (error) {
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "Error fetching Approval Requests",
          error,
        });
    }
  };

  public getAllRejectedAdmin = async  (req: Request, res: Response)=> {
    try {
      const page = parseInt(req.query.page as string) || 1; 
      const limit = parseInt(req.query.limit as string) || 10;

      const skip = (page - 1) * limit;

      if(page < 1 || limit < 1){
        res.status(400).json({ message: "Page and limit must be positive integers" });
        return;
        
       }

      const approvalRequests = await UserModel.find({
        role_id: "672775e4f2a1e38ef52c63c6", //admin
        "role_specific_details.approval_status": "rejected",
      }).skip(skip).limit(limit).exec();

      // const totalItems = await UserModel.countDocuments();
      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "rejected",
      });

      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({ 
        statuscode: 200, 
        data: approvalRequests,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
       });
    } catch (error) {
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "Error fetching Approval Requests",
          error,
        });
    }
  };

  public getApprovalRequestById = async  (
    req: Request,
    res: Response
  ): Promise<void> =>{
    const { id } = req.params;
    try {
      const approvalRequest = await UserModel.findById(id);
      if (!approvalRequest) {
        res
          .status(404)
          .json({ statuscode: 404, message: "Approval Request not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: "Error Approval Request", error });
    }
  };

  public approveAdminRequest = async  (
    req: Request,
    res: Response
  ): Promise<void> =>{
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (!user) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const admin_id = req.params.admin_id;
        console.log("admin_id", admin_id);
        const result = await UserModel.updateOne(
          { _id: admin_id },
          { $set: { "role_specific_details.approval_status": "approved" } }
        );
        console.log(result);

        if (result.modifiedCount === 0) {
          res
            .status(404)
            .json({
              statuscode: 404,
              message: "Approval request not found or already updated.",
            });
        } else {
          res
            .status(200)
            .json({
              statuscode: 200,
              message: "Approval request aprrove successfully.",
              data: result,
            });
        }
      }
    } catch (error) {
      console.error("Error rejecting approval request:", error);
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "An error occurred while rejecting the request.",
          error,
        });
    }
  };

  public rejectApprovalRequest = async  (
    req: Request,
    res: Response
  ): Promise<void>=> {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (!user) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const admin_id = req.params.admin_id;
        console.log("admin_id", admin_id);
        const result = await UserModel.updateOne(
          { _id: admin_id },
          { $set: { "role_specific_details.approval_status": "rejected" } }
        );
        console.log(result);

        if (result.modifiedCount === 0) {
          res
            .status(404)
            .json({
              message: "Approval request not found or already updated.",
            });
        } else {
          res
            .status(200)
            .json({
              message: "Approval request rejected successfully.",
              data: result,
            });
        }
      }
    } catch (error) {
      console.error("Error rejecting approval request:", error);
      res
        .status(500)
        .json({
          message: "An error occurred while rejecting the request.",
          error,
        });
    }
  };
}
