import { Request, Response } from "express";
import { User, UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";
import { OrganizationModel } from "../../model/organizationModel";
import { ADMIN_ID } from "../../utils/constants";
import mongoose from "mongoose";
import moment from "moment";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responsesUtils";

export class ApprovalController {
  public searchAdminApproval = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { query, approval_status } = req.query; // Accept a generic query parameter

      if (!query && !approval_status) {
        sendErrorResponse(res,400,false, "Query parameter is required and must be a string Or Unauthorized or invalid user details.")
      } else {
        const searchFields = ["username", "contact_number", "email", "address"];

        let users: User[] = [];

        for (let field of searchFields) {
          users = await UserModel.find({
            role_id: ADMIN_ID,
            isActive: true,
            "role_specific_details.approval_status": approval_status,
           [field]: { $regex: query, $options: "i" },  // Using regex for case-insensitive search
            // [field]: query,
          }).exec();

          if (users.length > 0) {
            break;
          }
        }

        if (users.length === 0) {
          sendSuccessResponse(res,200,true,"No admin found matching the search criteria")
        } else {
          const result = await Promise.all(
            users.map(async (user) => {
              const org_id = user.role_specific_details.organization_id;
              const org_name = await OrganizationModel.findById(org_id).exec();

              return {
                _id: user._id,
                username: user.username,
                email: user.email,
                contact_number: user.contact_number,
                address: user.address,
                role_id: user.role_id,
                role_specific_details: {
                  organization_id: user.role_specific_details.organization_id,
                  organization_name: org_name?.org_name,
                  approval_status: user.role_specific_details.approval_status,
                },
              };
            })
          );
          sendSuccessResponse(res,200,true,"data",result)
        }
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "Error searching admin approval :",
        error
      );
    }
  };

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
      } else {
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
          role_id: ADMIN_ID,
          "role_specific_details.approval_status": "pending",
          isActive: true,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const newdata = await this.addOrganizationName(approvalRequests);

        sendSuccessResponse(
          res,
          200,
          true,
          "All pending admin approval",
          newdata,
          {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          }
        );
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "Error fetching Approval Requests",
        error
      );
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
      } else {
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
          isActive: true,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const newdata = await this.addOrganizationName(approvalRequests);

        sendSuccessResponse(
          res,
          200,
          true,
          "All Approved admin approval",
          newdata,
          {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          }
        );
      }
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
      } else {
        const approvalRequests = await UserModel.find({
          role_id: ADMIN_ID, //admin
          "role_specific_details.approval_status": "rejected",
          isActive: true,
        })
          .skip(skip)
          .limit(limit)
          .exec();

        const totalItems = await UserModel.countDocuments({
          role_id: ADMIN_ID,
          "role_specific_details.approval_status": "rejected",
          isActive: true,
        });

        const totalPages = Math.ceil(totalItems / limit);

        const newdata = await this.addOrganizationName(approvalRequests);

        sendSuccessResponse(res, 200, true, "All rejected admin", newdata, {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        });
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error fetching Approval requests");
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
        } else {
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

          sendSuccessResponse(res, 200, true, "", newdata, {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          });
        }
      } else {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
          res
            .status(400)
            .json({ message: "Page and limit must be positive integers" });
        } else {
          admins = await UserModel.find({ role_id: ADMIN_ID })
            .skip(skip)
            .limit(limit)
            .exec();

          const totalItems = await UserModel.countDocuments({
            role_id: ADMIN_ID,
          });

          const totalPages = Math.ceil(totalItems / limit);

          const newdata = await this.addOrganizationName(admins); //to display org name in res

          sendSuccessResponse(res, 200, true, "", newdata, {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          });
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "error", error);
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
        sendErrorResponse(res, 404, false, "Approval Request not found");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error Approval Request", error);
    }
  };

  public approveAdminRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);

      if (user?.isActive == false || !user) {
        sendErrorResponse(
          res,
          401,
          true,
          "Unauthorized or invalid user details."
        );
      } else {
        const admin_id = req.params.admin_id;
        const result = await UserModel.updateOne(
          { _id: admin_id, isActive: true },
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
            sendErrorResponse(
              res,
              404,
              false,
              "Location of admin has no match on respective organization"
            );
          }
          if (result.modifiedCount === 0) {
            sendErrorResponse(
              res,
              404,
              false,
              "Approval request not found or already updated."
            );
          } else {
            sendSuccessResponse(
              res,
              200,
              true,
              "Approval request aprrove successfully.",
              result
            );
          }
        }
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "An error occurred while rejecting the request.",
        error
      );
    }
  };

  public rejectApprovalRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);

      if (user?.isActive == false || !user) {
        sendErrorResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const admin_id = req.params.admin_id;
        const { rejection_reason } = req.body;

        const result = await UserModel.updateOne(
          { _id: admin_id, isActive: true },
          {
            $set: {
              "role_specific_details.approval_status": "rejected",
              "role_specific_details.rejection_reason": rejection_reason,
            },
          }
        );

        if (result.modifiedCount === 0) {
          sendErrorResponse(
            res,
            404,
            false,
            "Approval request not found or already updated."
          );
        } else {
          sendSuccessResponse(
            res,
            200,
            true,
            "Approval request rejected successfully.",
            result
          );
        }
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "Error rejecting approval request",
        error
      );
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

  public getWeeklyRequest = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user?.isActive == false || !user) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const status = req.query.status;
        const year = parseInt(req.query.year as string);
        const startOfYear = moment().year(year).startOf("year").toDate();
        const endOfYear = moment().year(year).endOf("year").toDate();
        let requests;
        let data;
        if (status && year) {
          requests = await UserModel.aggregate([
            {
              $match: {
                role_id: ADMIN_ID,
                "role_specific_details.approval_status": status,
                created_at: {
                  $gte: startOfYear,
                  $lt: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  week: { $week: "$created_at" }, // Group by week number
                  year: { $year: "$created_at" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.week": 1,
              },
            },
          ]);
        } else {
          requests = await UserModel.aggregate([
            {
              $match: {
                role_id: ADMIN_ID,
                created_at: {
                  $gte: startOfYear,
                  $lt: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  week: { $week: "$created_at" }, // Group by week number
                  year: { $year: "$created_at" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.week": 1,
              },
            },
          ]);
        }
        if (requests) {
          data = requests.map((item) => {
            const startOfWeek = moment()
              .year(item._id.year)
              .isoWeek(item._id.week + 1)
              .startOf("isoWeek")
              .format("MMM Do YY");

            const endOfWeek = moment()
              .year(item._id.year)
              .isoWeek(item._id.week + 1)
              .endOf("isoWeek")
              .format("MMM Do YY");

            return {
              startOfWeek: startOfWeek,
              endOfWeek: endOfWeek,
              requestcount: item.count,
            };
          });
          res.status(200).json({ statuscode: 200, data: data });
        } else
          res
            .status(404)
            .json({ statuscode: 404, message: "request not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: `internal server error ${error}` });
    }
  };

  public getMonthlylyRequest = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user?.isActive == false || !user) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const status = req.query.status;
        const year = parseInt(req.query.year as string);
        const startOfYear = moment().year(year).startOf("year").toDate();
        const endOfYear = moment().year(year).endOf("year").toDate();
        let requests;
        let data;
        if (status && year) {
          requests = await UserModel.aggregate([
            {
              $match: {
                role_id: ADMIN_ID,
                "role_specific_details.approval_status": status,
                created_at: {
                  $gte: startOfYear,
                  $lte: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$created_at" },
                  month: { $month: "$created_at" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
          ]);
        } else {
          requests = await UserModel.aggregate([
            {
              $match: {
                role_id: ADMIN_ID,
                created_at: {
                  $gte: startOfYear,
                  $lte: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$created_at" },
                  month: { $month: "$created_at" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
          ]);
        }
        if (requests) {
          data = requests.map((item) => {
            const startOfmonth = moment()
              .month(item._id.month - 1)
              .format("YYYY-MM");

            //  const endOfWeek = startOfWeek.clone().endOf('isoWeek');
            return { month: startOfmonth, requestcount: item.count };
          });
          res.status(200).json({ statuscode: 200, data: data });
        } else
          res
            .status(404)
            .json({ statuscode: 404, message: "orders not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: `internal server error ${error}` });
    }
  };
}
