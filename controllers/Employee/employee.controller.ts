import { Request, Response } from "express";
import { UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";
import { TiffinItemModel } from "../../model/tiffinItemModel";
import { OrderModel } from "../../model/orderModel";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responsesUtils";
import { RETAILER_ID } from "../../utils/constants";

export class EmployeeController {
  public getAllTrendyRetailers = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (
        user?.isActive == false ||
        !user ||
        !user.role_specific_details ||
        !user.role_specific_details.organization_id
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const organizationId = user.role_specific_details.organization_id;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );

          return;
        }

        const skip = (page - 1) * limit;

        const TrendyRetailers = await UserModel.find({
          role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
          "role_specific_details.approval": {
            $elemMatch: {
              organization_id: organizationId,
              istrendy: true,
            },
          },
        })
          .skip(skip)
          .limit(limit)
          .exec();

        const totalItems = await UserModel.countDocuments({
          role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
          "role_specific_details.approval": {
            $elemMatch: {
              organization_id: organizationId,
              istrendy: true,
            },
          },
        });

        const totalPages = Math.ceil(totalItems / limit);

        sendSuccessResponse(
          res,
          200,
          false,
          "TrendyRetailers",
          TrendyRetailers,
          {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          }
        );
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public getAllRetailersofOrg = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (
        user?.isActive == false ||
        !user ||
        !user.role_specific_details ||
        !user.role_specific_details.organization_id
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const organizationId = user.role_specific_details.organization_id;

        let page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );
          return;
        }

        const skip = (page - 1) * limit;

        const Retailers = await UserModel.find({
          role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
          "role_specific_details.approval": {
            $elemMatch: {
              organization_id: organizationId,
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
              organization_id: organizationId,
            },
          },
        });

        const totalPages = Math.ceil(totalItems / limit);

        console.log(`Organization ID: ${organizationId}`);

        sendSuccessResponse(res, 200, true, "Retailers", Retailers, {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        });
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public getAllTiffinofOrg = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        !user ||
        !user.role_specific_details ||
        !user.role_specific_details.organization_id
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const organizationId = user.role_specific_details.organization_id;

        const Retailers = await UserModel.find({
          role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
          "role_specific_details.approval": {
            $elemMatch: {
              organization_id: organizationId,
            },
          },
        }).exec();

        if (Retailers.length === 0) {
          sendSuccessResponse(
            res,
            200,
            true,
            "No retailers found for the given organization."
          );
        } else {
          const retailerIds = Retailers.map((retailer) => retailer._id);

          const Tiffins = await TiffinItemModel.find({
            retailer_id: { $in: retailerIds },
          }).exec();

          sendSuccessResponse(
            res,
            200,
            true,
            "All tiffins of organization.",
            Tiffins
          );
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public getAllTiffinsByRetailer = async (req: Request, res: Response) => {
    try {
      const retailerId = req.params.retailerid;
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        !user ||
        !user.role_specific_details ||
        !user.role_specific_details.organization_id
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const organizationId = user.role_specific_details.organization_id;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );
          return;
        }

        const Tiffins = await TiffinItemModel.find({
          retailer_id: retailerId,
        })
          .skip(skip)
          .limit(limit)
          .exec();

        const totalItems = await TiffinItemModel.countDocuments({
          retailer_id: retailerId,
        });

        const totalPages = Math.ceil(totalItems / limit);
        sendSuccessResponse(res, 200, true, "Tiffins", Tiffins, {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        });
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "An error occurred while processing your request.",
        error
      );
    }
  };

  public getTiffinofOrgById = async (req: Request, res: Response) => {
    try {
      const tifinId = req.params.tifinid;
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (
        user?.isActive == false ||
        !user ||
        !user.role_specific_details ||
        !user.role_specific_details.organization_id
      ) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const organizationId = user.role_specific_details.organization_id;

        const Retailers = await UserModel.find({
          role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
          "role_specific_details.approval": {
            $elemMatch: {
              organization_id: organizationId,
            },
          },
        }).exec();

        if (Retailers.length === 0) {
          sendSuccessResponse(
            res,
            200,
            true,
            "No retailers found for the given organization."
          );
          
        } else {
          const retailerIds = Retailers.map((retailer) => retailer._id);

          const Tiffin = await TiffinItemModel.find({
            id: tifinId,
            retailer_id: { $in: retailerIds },
          }).exec();

          console.log(`Organization ID: ${organizationId}`);
          sendSuccessResponse(
            res,
            200,
            true,
            "Tiffin",
            Tiffin
          );
        }
      }
    } catch (error) {
      console.error("Error fetching tiffin items:", error);
      sendErrorResponse(
        res,
        500,
        false,
        "An error occurred while processing your request.",
        error
      );
    }
  };

  public getDeliveredOrders = async (req: Request, res: Response) => {
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
        const orders = await OrderModel.find({
          "cart.customer_id": user._id,
          delivery_status: "delivered",
        });
        if (orders.length > 0)
          sendSuccessResponse(
            res,
            200,
            true,
            "orders",
            orders
          );
          // res.status(200).json({ statuscode: 200, data: orders });
        else
        sendSuccessResponse(
          res,
          200,
          true,
          "orders not found"
        );
          // res
          //   .status(404)
          //   .json({ statuscode: 404, message: "orders not found" });
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "An error occurred while processing your request.",
        error
      );
      // res
      //   .status(500)
      //   .json({ statuscode: 500, message: `internal server error ${error}` });
    }
  };

  public getPendngOrders = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user?.isActive == false || !user) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
        
        // res.status(401).json({
        //   statuscode: 401,
        //   message: "Unauthorized or invalid user details.",
        // });
      } else {
        const orders = await OrderModel.find({
          "cart.customer_id": user._id,
          delivery_status: "pending",
        });
        if (orders.length > 0)
          sendSuccessResponse(
            res,
            200,
            true,
            "orders",
            orders
          );
          // res.status(200).json({ statuscode: 200, data: orders });
        else
        sendSuccessResponse(
          res,
          200,
          true,
          "orders not found"
        );
          // res
          //   .status(404)
          //   .json({ statuscode: 404, message: "orders not found" });
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "An error occurred while processing your request.",
        error
      );
      // res
      //   .status(500)
      //   .json({ statuscode: 500, message: `internal server error ${error}` });
    }
  };

  public cancelOrder = async (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderid;
      const order = await OrderModel.findById(orderId);
      if (order) {
        if (order.delivery_status == "pending") {
          const order = await OrderModel.findByIdAndUpdate(orderId, {
            delivery_status: "cancelled",
          });
          if (order)
            sendSuccessResponse(
              res,
              200,
              true,
              "order updated successful"
            );
            // res
            //   .status(200)
            //   .json({ statuscode: 200, message: "order updated successful" });
        } else if (order.delivery_status == "delivered") {
          sendSuccessResponse(
            res,
            200,
            true,
            "order is already delivered cannot be modified"
          );
          // res.status(409).json({
          //   statuscode: 409,
          //   message: "order is already delivered cannot be modified",
          // });
        } else {
          sendSuccessResponse(
            res,
            200,
            true,
            "order is already cancelled cannot be modified"
          );
          // res
          //   .status(409)
          //   .json({ statuscode: 409, message: "order is already cancelled " });
        }
      } else {
        sendSuccessResponse(
          res,
          200,
          true,
          "order not found"
        );
        // res.status(404).json({ statuscode: 404, message: "order not found" });
      }
    } catch (error) {
      sendErrorResponse(
        res,
        500,
        false,
        "An error occurred while processing your request.",
        error
      );
      // res
      //   .status(500)
      //   .json({ statuscode: 500, message: `internal server error ${error}` });
    }
  };
}
