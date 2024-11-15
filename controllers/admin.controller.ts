import { Request, Response } from "express";
import { User, UserModel } from "../model/userModel";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { RETAILER_ID } from "../utils/constants";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responsesUtils";

export const Admin = async (req: Request, res: Response) => {
  sendSuccessResponse(res, 200, true, "Welcome Admin");
};

export const getUserFromToken = async (
  req: Request
): Promise<User | undefined> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.error("No token provided");
      return undefined;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
    };
    const user = (await UserModel.findOne({ _id: decoded.id }).exec()) as User;

    if (!user) {
      console.error("User not found");
      return undefined;
    }

    return user;
  } catch (error) {
    console.error("Invalid token", error);
    return undefined;
  }
};

export class AdminController {
  public getallRetailerRequest = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendErrorResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const status = req.query.status;
        if (status) {
          const result = await UserModel.find({
            role_id: RETAILER_ID, //retailer:roleid
            isActive: true,
            "role_specific_details.approval": {
              $elemMatch: {
                approval_status: status,
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          }).exec();
          // console.log(result);
          sendSuccessResponse(
            res,
            200,
            true,
            `All retailer requests: ${status}`,
            result
          );
        } else {
          const result = await UserModel.find({
            role_id: RETAILER_ID, //retailer:roleid
            isActive: true,
            "role_specific_details.approval": {
              $elemMatch: {
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          }).exec();
          sendSuccessResponse(res, 200, true, "All retailer requests", result);
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  public pendingApprovalRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendErrorResponse(
          res,
          404,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const result = await UserModel.find({
          role_id: RETAILER_ID,
          isActive: true,
          "role_specific_details.approval": {
            $elemMatch: {
              approval_status: "pending",
              organization_id: user?.role_specific_details.organization_id,
            },
          },
        }).exec();

        sendSuccessResponse(
          res,
          200,
          true,
          "All retailer approval requests",
          result
        );
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  public getApprovedRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendErrorResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const result = await UserModel.find({
          role_id: RETAILER_ID,
          isActive: true,
          "role_specific_details.approval": {
            $elemMatch: {
              approval_status: "approved",
              organization_id: user?.role_specific_details.organization_id,
            },
          },
        }).exec();
        console.log(result);
        sendSuccessResponse(
          res,
          200,
          true,
          "All the approved retailers",
          result
        );
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  public getRejectedRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendErrorResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const result = await UserModel.find({
          role_id: RETAILER_ID, //retailer:roleid
          isActive: true,
          "role_specific_details.approval": {
            $elemMatch: {
              approval_status: "rejected",
              organization_id: user?.role_specific_details.organization_id,
            },
          },
        }).exec();
        sendSuccessResponse(res, 200, true, "All rejected Retailers", result);
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  public approveRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendErrorResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const retailer_id = req.params.retailer_id;
        console.log("retailer_id", retailer_id);

        const organization_id = user?.role_specific_details.organization_id;
        console.log("organization_id", organization_id);
        const retailer = await UserModel.findOne({
          _id: retailer_id,
          role_id: RETAILER_ID, //retailer
          isActive: true,

          "role_specific_details.approval": {
            $elemMatch: {
              // approval_status: "pending",
              organization_id: organization_id,
            },
          },
        }).exec();

        if (!retailer) {
          sendErrorResponse(
            res,
            404,
            false,
            "Retailer not found or no pending approval for this organization."
          );
        }

        const result = await UserModel.updateOne(
          { _id: retailer_id, isActive: true },
          {
            $set: {
              "role_specific_details.approval.$[elem].approval_status":
                "approved",
            },
          },
          {
            arrayFilters: [{ "elem.organization_id": organization_id }],
          }
        );

        sendSuccessResponse(res, 200, true, "organizations");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
    }
  };

  public rejectRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendErrorResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const retailer_id = req.params.retailer_id;
        const { rejection_reason } = req.body;

        const organization_id = user?.role_specific_details.organization_id;

        const retailer = await UserModel.findOne({
          _id: retailer_id,
          role_id: RETAILER_ID,
          isActive: true,

          "role_specific_details.approval": {
            $elemMatch: {
              organization_id: organization_id,
            },
          },
        }).exec();

        if (!retailer) {
          sendErrorResponse(
            res,
            404,
            false,
            "Retailer not found or no pending approval for this organization."
          );
        }

        const result = await UserModel.updateOne(
          { _id: retailer_id, isActive: true },
          {
            $set: {
              "role_specific_details.approval.$[elem].approval_status":
                "rejected",
              "role_specific_details.approval.$[elem].rejection_reason":
                rejection_reason,
            },
          },
          {
            arrayFilters: [{ "elem.organization_id": organization_id }],
          }
        );

        sendSuccessResponse(res, 200, true, "retailer rejected", result);
      }
    } catch (error) {
      sendErrorResponse(res, 500, true, `Internal server error: ${error}`);
    }
  };

  public makeRetailerTrendy = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendErrorResponse(
          res,
          401,
          true,
          "Unauthorized or invalid user details."
        );
      } else {
        const retailer_id = req.params.retailer_id;

        const organization_id = user?.role_specific_details.organization_id;

        const retailer = await UserModel.findOne({
          _id: retailer_id,
          role_id: RETAILER_ID,
          isActive: true,
          "role_specific_details.approval": {
            $elemMatch: {
              organization_id: organization_id,
            },
          },
        }).exec();

        if (!retailer) {
          sendSuccessResponse(
            res,
            200,
            false,
            "Retailer not found for this organization."
          );
        }

        const result = await UserModel.updateOne(
          { _id: retailer_id, isActive: true },
          {
            $set: {
              "role_specific_details.approval.$[elem].istrendy": true,
            },
          },
          {
            arrayFilters: [{ "elem.organization_id": organization_id }],
          }
        );
        sendSuccessResponse(res, 200, true, "trendy results", result);
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error approving retailer:", error);
    }
  };

  public ReApply = async (req: Request, res: Response): Promise<void> => {
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
        console.log("admin_id", admin_id);
        const result = await UserModel.updateOne(
          { _id: admin_id, isActive: true },
          { $set: { "role_specific_details.approval_status": "pending" } }
        );
        console.log(result);

        if (result.modifiedCount === 0) {
          sendErrorResponse(
            res,
            500,
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
        "Error rejecting approval request:",
        error
      );
    }
  };
}
