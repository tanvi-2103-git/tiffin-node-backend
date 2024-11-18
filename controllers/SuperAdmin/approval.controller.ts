import { Request, Response } from "express";
import { User, UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";
import { OrganizationModel } from "../../model/organizationModel";
import { ADMIN_ID } from "../../utils/constants";
import mongoose from "mongoose";
import { sendErrorResponse, sendSuccessResponse } from "../../utils/responsesUtils";
import { send } from "process";

export class ApprovalController {
  public getAllPendingAdminApprovalRequests = async (
    req: Request,
    res: Response
  ) => {
    try {
     const page = parseInt(req.query.page as string) || 1; 
     const limit = parseInt(req.query.limit as string) || 10;

     if(page < 1 || limit < 1){
      sendErrorResponse(res, 400, false, "Page and limit must be positive integers" )
      return;
      
     }

     const skip = (page - 1) * limit;

      const approvalRequests = await UserModel.find({
        role_id: ADMIN_ID, //admin
        "role_specific_details.approval_status": "pending",
        isActive : true
      }).skip(skip).limit(limit).exec();
      
      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "pending",
      });

      const totalPages = Math.ceil(totalItems / limit);

      const newdata = await this.addOrganizationName(approvalRequests);

     
      sendSuccessResponse(res, 200, true, "All pending admin approval", newdata, {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
      })
      
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error fetching Approval Requests",
        error)

    }
  };


  public getAllApprovedAdmin = async  (req: Request, res: Response) =>{
    try {
      const page = parseInt(req.query.page as string) || 1; 
      const limit = parseInt(req.query.limit as string) || 10;
      

      if(page < 1 || limit < 1){
        sendErrorResponse(res, 400, false, "Page and limit must be positive integers" )
        return;
        
       }

      const skip = (page - 1) * limit;

      const approvalRequests = await UserModel.find({
        role_id: ADMIN_ID, 
        "role_specific_details.approval_status": "approved",
        isActive : true
      }).skip(skip).limit(limit).exec();

       
      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "approved",
      });

      const totalPages = Math.ceil(totalItems / limit);

      const newdata = await this.addOrganizationName(approvalRequests);

      sendSuccessResponse(res, 200, true, "All Approved admin approval", newdata, {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
      })
      
    } catch (error) {
      res.status(500).json({
        statuscode: 500,
        message: "Error fetching Approval Requests",
        error,
      });
    }
  };

  public getAllRejectedAdmin = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1; 
      const limit = parseInt(req.query.limit as string) || 10;

      const skip = (page - 1) * limit;

      if(page < 1 || limit < 1){
        sendErrorResponse(res, 400, false, "Page and limit must be positive integers" )
        return;
        
       }

      const approvalRequests = await UserModel.find({
        role_id: ADMIN_ID, 
        "role_specific_details.approval_status": "rejected",
        isActive : true
      }).skip(skip).limit(limit).exec();

      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "rejected",
      });

      const totalPages = Math.ceil(totalItems / limit);

      const newdata = await this.addOrganizationName(approvalRequests);
      
      sendSuccessResponse(res, 200, true, "All rejected admin", newdata, {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
      })
      
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error fetching Approval requests" )

    }
  };

 
// combined API
  public getAllAdminRequest = async (req: Request, res: Response) => {
    try {
      const status = req.query.status;
      let admins;
      if (status) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
          sendErrorResponse(res, 400, false, "Page and limit must be positive integers" )

          return;
        }

        const approvalRequests = await UserModel.find({
          role_id: ADMIN_ID, 
          "role_specific_details.approval_status": status,
        })
          .skip(skip)
          .limit(limit)
          .exec();

        const totalItems = await UserModel.countDocuments({
          role_id:ADMIN_ID,
          "role_specific_details.approval_status": status,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const newdata = await this.addOrganizationName(approvalRequests);

        sendSuccessResponse(res, 200, true, "", newdata, {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        })
 
      } else {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
          sendErrorResponse(res, 400, false, "Page and limit must be positive integers" )

          return;
        }
        admins = await UserModel.find({ role_id: ADMIN_ID })
          .skip(skip)
          .limit(limit)
          .exec();

        const totalItems = await UserModel.countDocuments({
          role_id: ADMIN_ID,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const newdata = await this.addOrganizationName(admins); 

        sendSuccessResponse(res, 200, true, "", newdata, {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        })

      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "error", error)
    }
  };


  public getApprovalRequestById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const approvalRequest = await UserModel.findById(id);
      if (approvalRequest?.isActive==false || !approvalRequest ) {
        sendErrorResponse(res, 404, false, "Approval Request not found")
        }
    } catch (error) {

      sendErrorResponse(res,  500, false, "Error Approval Request", error )

    }
  };

  public  approveAdminRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);


      if (user?.isActive==false || !user) {
        sendErrorResponse(res, 401, true,"Unauthorized or invalid user details.")
        
      } else {
        const admin_id = req.params.admin_id;
        const result = await UserModel.updateOne(
          { _id: admin_id, isActive:true },
          { $set: { "role_specific_details.approval_status": "approved" } }
        );

        const admin = await UserModel.findById(admin_id);


        const orgId = admin?.role_specific_details.organization_id;
        const orgLoc = admin?.role_specific_details.org_location;


        const organization = await OrganizationModel.findById(orgId);

        if (organization) {
          const itemIndex = organization.org_location.findIndex(
            (orgLocation) => orgLocation.loc == orgLoc
          );

          if (itemIndex > -1) {
            organization.org_location[itemIndex].admin_id =
              new mongoose.Types.ObjectId(admin_id);
            await organization.save();
          } else {

            sendErrorResponse(res, 404, false, "Location of admin has no match on respective organization")
          }
        if (result.modifiedCount === 0) {

          sendErrorResponse(res, 404, false, "Approval request not found or already updated.")

        } else {

          sendSuccessResponse(res, 200, true, "Approval request aprrove successfully.", result)
        }
      }}
    } catch (error) {

      sendErrorResponse(res, 500, false, "An error occurred while rejecting the request.",
        error)
    }
  };



  public rejectApprovalRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);

      if (user?.isActive==false || !user) {
        sendErrorResponse(res, 401, false, "Unauthorized or invalid user details.")

      } else {
        const admin_id = req.params.admin_id;
        const {rejection_reason} = req.body;

        const result = await UserModel.updateOne(
          { _id: admin_id , isActive:true },
          { $set: { "role_specific_details.approval_status": "rejected" , "role_specific_details.rejection_reason":rejection_reason} }
        );

        if (result.modifiedCount === 0) {
          sendErrorResponse(res, 404, false, "Approval request not found or already updated.")

        } else {
          sendSuccessResponse(res, 200, true, "Approval request rejected successfully.", result)
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error rejecting approval request", error)
    }
  };

//to display admin name instead of admin id
  public addOrganizationName = async (admins: User[]) => {
    const newdata = await Promise.all(
      admins.map(async (admin) => {
        const org_id = admin.role_specific_details.organization_id;

        const org_name = await OrganizationModel.findById(org_id).exec();


        const newadmin = {
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          contact_number: admin.contact_number,
          address: admin.address,
          role_id: admin.role_id,
          role_specific_details: {
            organization_id: admin.role_specific_details.organization_id,
            organization_name: org_name?.org_name,
            approval_status: admin.role_specific_details.approval_status,
          },
        };

        return newadmin;
      })
    );
    return newdata;
  };
}
