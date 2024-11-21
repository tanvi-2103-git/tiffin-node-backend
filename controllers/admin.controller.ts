import { Request, Response } from "express";
import { User, UserModel } from "../model/userModel";
import jwt from "jsonwebtoken";
import { RETAILER_ID } from "../utils/constants";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responsesUtils";
import { getDefaultResultOrder } from "dns/promises";

export const Admin = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome Admin" });
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

// search
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
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const status = req.query.status;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        let totalItems;
        let totalPages;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );    } else {
          const skip = (page - 1) * limit;
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
            })
              .skip(skip)
              .limit(limit)
              .exec();

            totalItems = await UserModel.countDocuments({
              role_id: RETAILER_ID, //retailer:roleid
              isActive: true,
              "role_specific_details.approval": {
                $elemMatch: {
                  approval_status: status,
                  organization_id: user?.role_specific_details.organization_id,
                },
              },
            });
            totalPages = Math.ceil(totalItems / limit);

             sendSuccessResponse(
            res,
            200,
            true,
            `All retailer requests: ${status}`,
            result,{
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
              },
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
            })
              .skip(skip)
              .limit(limit)
              .exec();

            totalItems = await UserModel.countDocuments({
              role_id: RETAILER_ID, //retailer:roleid
              isActive: true,
              "role_specific_details.approval": {
                $elemMatch: {
                  organization_id: user?.role_specific_details.organization_id,
                },
              },
            });
            totalPages = Math.ceil(totalItems / limit);

            sendSuccessResponse(res, 200, true, "All retailer requests", result,
               {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
              },
           );
          }
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  //pagination -done
  public pendingApprovalRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          ); } else {
          const skip = (page - 1) * limit;
          const result = await UserModel.find({
            role_id: RETAILER_ID,
            isActive: true,
            "role_specific_details.approval": {
              $elemMatch: {
                approval_status: "pending",
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          })
            .skip(skip)
            .limit(limit)
            .exec();

          const totalItems = await UserModel.countDocuments({
            role_id: RETAILER_ID, // retailer role ID
            "role_specific_details.approval": {
              $elemMatch: {
                approval_status: "pending",
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          });

          const totalPages = Math.ceil(totalItems / limit);
          
        sendSuccessResponse(
          res,
          200,
          true,
          "All retailer approval requests",
          result,{
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalItems,
            },
          );
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  //pagination
  public getApprovedRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );

      } else {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );    } else {
          const skip = (page - 1) * limit;
          const result = await UserModel.find({
            role_id: RETAILER_ID,
            isActive: true,
            "role_specific_details.approval": {
              $elemMatch: {
                approval_status: "approved",
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          })
            .skip(skip)
            .limit(limit)
            .exec();

          const totalItems = await UserModel.countDocuments({
            role_id: RETAILER_ID, // retailer role ID
            isActive: true,
            "role_specific_details.approval": {
              $elemMatch: {
                approval_status: "approved",
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          });

          const totalPages = Math.ceil(totalItems / limit);

          sendSuccessResponse(
            res,
            200,
            true,
            "All the approved retailers",
            result,{
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalItems,
            },
          );
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  //pagination -done
  public getRejectedRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );    } else {
          const skip = (page - 1) * limit;
          const result = await UserModel.find({
            role_id: RETAILER_ID, //retailer:roleid
            isActive: true,
            "role_specific_details.approval": {
              $elemMatch: {
                approval_status: "rejected",
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          })
            .skip(skip)
            .limit(limit)
            .exec();

          const totalItems = await UserModel.countDocuments({
            role_id: RETAILER_ID, // retailer role ID
            isActive: true,
            "role_specific_details.approval": {
              $elemMatch: {
                approval_status: "rejected",
                organization_id: user?.role_specific_details.organization_id,
              },
            },
          });

          const totalPages = Math.ceil(totalItems / limit);

          sendSuccessResponse(res, 200, true, "All rejected Retailers", getDefaultResultOrder
            ,{
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalItems,
            },
          );
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error ${error}`);
    }
  };

  //check search
  public searchRetailers = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { query, approval_status } = req.query;

      if (!query) throw "Query parameter is required and must be a string Or Unauthorized or invalid user details."
       else {
        const searchFields = ["username", "email", "contact_number", "address"];

        let retailers: User[] = [];

        for (let field of searchFields) {
          retailers = await UserModel.find({
            //role_id: "6723475f74b32cfe39e5d0a2", //retailer id
            "role_specific_details.approval.approval_status": approval_status,
            //  [field] : query,
            [field]: { $regex: query, $options: "i" },
          }).exec();

          if (retailers.length > 0) {
            break;
          }
        }
        if (retailers.length === 0) {
          sendSuccessResponse(res,200,true,"No retailers found matching the search criteria")
        } else {
          sendSuccessResponse(res,200,true,"data",retailers)
        }
      }
    } catch (error) {
      
      sendErrorResponse(
        res,
        500,
        false,
        "Error searching retailer:",
        error
      );
    }
  };

  public approveRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const retailer_id = req.params.retailer_id;

        const organization_id = user?.role_specific_details.organization_id;
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
          sendSuccessResponse(
            res,
            200,
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
        sendSuccessResponse(res, 200, true, "approved", result);

      }
    } catch (error) {
      console.error("Error approving retailer:", error);
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error: ${error}` });
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
        sendSuccessResponse(
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
          //retailer
          isActive: true,

          "role_specific_details.approval": {
            $elemMatch: {
              // approval_status: "pending",
              organization_id: organization_id,
            },
          },
        }).exec();
        if (!retailer) {
          sendSuccessResponse(
            res,
            200,
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

        sendSuccessResponse(res, 200, true, "rejected", result);
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
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const retailer_id = req.params.retailer_id;

        const organization_id = user?.role_specific_details.organization_id;
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
        // res.json(retailer)
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
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const admin_id = req.params.admin_id;
        const result = await UserModel.updateOne(
          { _id: admin_id, isActive: true },
          { $set: { "role_specific_details.approval_status": "pending" } }
        );

        if (result.modifiedCount === 0) {
          sendSuccessResponse(
            res,
            200,
            true,
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
