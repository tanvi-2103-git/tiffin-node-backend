import { Request, Response } from "express";
import { User, UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";
import { OrganizationModel } from "../../model/organizationModel";

export class ApprovalController {
  public addApprovalRequest = async function (req: Request, res: Response) {
    // ideally speaking we dont need to add a separate function for adding the request as, when a admin registers, their aproval status is by default pending.
  };

  public getAllPendingAdminApprovalRequests = async  (
    req: Request,
    res: Response
  )=> {
    try {
      const approvalRequests = await UserModel.find({
        role_id: "672775e4f2a1e38ef52c63c6", //admin
        "role_specific_details.approval_status": "pending",
      }).exec();
      
      const newdata = await Promise.all( approvalRequests.map(async (admin) =>  {
        const org_id = admin.role_specific_details.organization_id
        
        const org_name = await OrganizationModel.findById(org_id).exec();
        // console.log(org_name);
        
        const newadmin ={
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          contact_number: admin.contact_number,
          address: admin.address,
          role_id: admin.role_id,
          role_specific_details: {
            organization_id: admin.role_specific_details.organization_id,
            organization_name:org_name?.org_name,
            approval_status: admin.role_specific_details.approval_status
          }
        };
        // console.log(newadmin);
        
        return newadmin;
      }))
      console.log(newdata);
      

      res.status(200).json({ statuscode: 200, data: newdata });
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
      const approvalRequests = await UserModel.find({
        role_id: "672775e4f2a1e38ef52c63c6", //admin
        "role_specific_details.approval_status": "approved",
      }).exec();

      const newdata = await Promise.all( approvalRequests.map(async (admin) =>  {
        const org_id = admin.role_specific_details.organization_id
        
        const org_name = await OrganizationModel.findById(org_id).exec();
        // console.log(org_name);
        
        const newadmin ={
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          contact_number: admin.contact_number,
          address: admin.address,
          role_id: admin.role_id,
          role_specific_details: {
            organization_id: admin.role_specific_details.organization_id,
            organization_name:org_name?.org_name,
            approval_status: admin.role_specific_details.approval_status
          }
        };
        // console.log(newadmin);
        
        return newadmin;
      }))
      res.status(200).json({ statuscode: 200, data: newdata });
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
      const approvalRequests = await UserModel.find({
        role_id: "672775e4f2a1e38ef52c63c6", //admin
        "role_specific_details.approval_status": "rejected",
      }).exec();
      const newdata = await Promise.all( approvalRequests.map(async (admin) =>  {
        const org_id = admin.role_specific_details.organization_id
        
        const org_name = await OrganizationModel.findById(org_id).exec();
        // console.log(org_name);
        
        const newadmin ={
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          contact_number: admin.contact_number,
          address: admin.address,
          role_id: admin.role_id,
          role_specific_details: {
            organization_id: admin.role_specific_details.organization_id,
            organization_name:org_name?.org_name,
            approval_status: admin.role_specific_details.approval_status
          }
        };
        // console.log(newadmin);
        
        return newadmin;
      }))
      
      res.status(200).json({ statuscode: 200, data: newdata });
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
