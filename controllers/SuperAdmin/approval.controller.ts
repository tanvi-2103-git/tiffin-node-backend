import { Request, Response } from "express";
import { User, UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";
import { OrganizationModel } from "../../model/organizationModel";
import { ADMIN_ID } from "../../utils/constants";

export class ApprovalController {
  public getAllPendingAdminApprovalRequests = async (
    req: Request,
    res: Response
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        res
          .status(400)
          .json({ message: "Page and limit must be positive integers" });
        return;
      }

      const skip = (page - 1) * limit;

      const approvalRequests = await UserModel.find({
        role_id: ADMIN_ID, //admin
        "role_specific_details.approval_status": "pending",
        isActive: true,
      })
        .skip(skip)
        .limit(limit)
        .exec();

      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "pending",
      });

      const totalPages = Math.ceil(totalItems / limit);

      const newdata = await this.addOrganizationName(approvalRequests);

      res.status(200).json({
        statuscode: 200,
        data: newdata,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    } catch (error) {
      res.status(500).json({
        statuscode: 500,
        message: "Error fetching Approval Requests",
        error,
      });
    }
  };

  public getAllApprovedAdmin = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        res
          .status(400)
          .json({ message: "Page and limit must be positive integers" });
        return;
      }

      const skip = (page - 1) * limit;

      const approvalRequests = await UserModel.find({
        role_id: ADMIN_ID, //admin
        "role_specific_details.approval_status": "approved",
        isActive: true,
      })
        .skip(skip)
        .limit(limit)
        .exec();

      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "approved",
      });

      const totalPages = Math.ceil(totalItems / limit);

      const newdata = await this.addOrganizationName(approvalRequests);

      res.status(200).json({
        statuscode: 200,
        data: newdata,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
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

      if (page < 1 || limit < 1) {
        res
          .status(400)
          .json({ message: "Page and limit must be positive integers" });
        return;
      }

      const approvalRequests = await UserModel.find({
        role_id: ADMIN_ID, //admin
        "role_specific_details.approval_status": "rejected",
        isActive: true,
      })
        .skip(skip)
        .limit(limit)
        .exec();

      const totalItems = await UserModel.countDocuments({
        role_id: "672775e4f2a1e38ef52c63c6",
        "role_specific_details.approval_status": "rejected",
      });

      const totalPages = Math.ceil(totalItems / limit);

      const newdata = await this.addOrganizationName(approvalRequests);

      res.status(200).json({
        statuscode: 200,
        data: newdata,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    } catch (error) {
      res.status(500).json({
        statuscode: 500,
        message: "Error fetching Approval Requests",
        error,
      });
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
          res
            .status(400)
            .json({ message: "Page and limit must be positive integers" });
          return;
        }

        const approvalRequests = await UserModel.find({
          role_id: ADMIN_ID, //admin
          "role_specific_details.approval_status": status,
        })
          .skip(skip)
          .limit(limit)
          .exec();

        const totalItems = await UserModel.countDocuments({
          role_id: ADMIN_ID,
          "role_specific_details.approval_status": status,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const newdata = await this.addOrganizationName(approvalRequests);

        res.status(200).json({
          statuscode: 200,
          data: newdata,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          },
        });
      } else {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
          res
            .status(400)
            .json({ message: "Page and limit must be positive integers" });
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

        const newdata = await this.addOrganizationName(admins); //to display org name in res

        res.status(200).json({
          statuscode: 200,
          data: newdata,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          },
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  };

  public getApprovalRequestById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const approvalRequest = await UserModel.findById(id);
      if (approvalRequest?.isActive == false || !approvalRequest) {
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

  public approveAdminRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (user?.isActive == false || !user) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const admin_id = req.params.admin_id;
        console.log("admin_id", admin_id);
        const result = await UserModel.updateOne(
          { _id: admin_id, isActive: true },
          { $set: { "role_specific_details.approval_status": "approved" } }
        );
        console.log(result);

        if (result.modifiedCount === 0) {
          res.status(404).json({
            statuscode: 404,
            message: "Approval request not found or already updated.",
          });
        } else {
          res.status(200).json({
            statuscode: 200,
            message: "Approval request aprrove successfully.",
            data: result,
          });
        }
      }
    } catch (error) {
      console.error("Error rejecting approval request:", error);
      res.status(500).json({
        statuscode: 500,
        message: "An error occurred while rejecting the request.",
        error,
      });
    }
  };

  public rejectApprovalRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (user?.isActive == false || !user) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const admin_id = req.params.admin_id;
        const { rejection_reason } = req.body;
        console.log("admin_id", admin_id);
        const result = await UserModel.updateOne(
          { _id: admin_id, isActive: true },
          {
            $set: {
              "role_specific_details.approval_status": "rejected",
              "role_specific_details.rejection_reason": rejection_reason,
            },
          }
        );
        console.log(result);

        if (result.modifiedCount === 0) {
          res.status(404).json({
            message: "Approval request not found or already updated.",
          });
        } else {
          res.status(200).json({
            message: "Approval request rejected successfully.",
            data: result,
          });
        }
      }
    } catch (error) {
      console.error("Error rejecting approval request:", error);
      res.status(500).json({
        message: "An error occurred while rejecting the request.",
        error,
      });
    }
  };

//to display admin name instead of admin id
  public addOrganizationName = async (admins: User[]) => {
    const newdata = await Promise.all(
      admins.map(async (admin) => {
        const org_id = admin.role_specific_details.organization_id;

        const org_name = await OrganizationModel.findById(org_id).exec();
        // console.log(org_name);

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
        // console.log(newadmin);

        return newadmin;
      })
    );
    return newdata;
  };
}
