import { Request, Response } from "express";
import { OrganizationModel, Organization } from "../model/organizationModel";
import { UserModel, User } from "../model/userModel";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getUserFromToken } from "./admin.controller";
import { OrderModel } from "../model/orderModel";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responsesUtils";

export class RetailerController {
  public addRequest = async (req: Request, res: Response) => {
    try {
      const organization_id = req.params.organization_id;

      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };

        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;

        if (!user) {
          sendErrorResponse(res, 404, false, "User not found");
        }

        const data = await UserModel.updateOne(
          { _id: decoded.id },
          {
            $push: {
              "role_specific_details.approval": {
                approval_status: "pending",
                organization_id: organization_id,
              },
            },
          }
        );
        sendSuccessResponse(res, 200, true, "Request added", data);
      }
    } catch (err) {
      sendErrorResponse(res, 500, false, `internal server error ${err}`);
    }
  };

  public getAllOrders = async (req: Request, res: Response) => {
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
        const status = req.query.status;
        let orders;
        if (status) {
          orders = await OrderModel.find({
            "cart.retailer_id": user._id,
            delivery_status: status,
          });
        } else {
          orders = await OrderModel.find({ "cart.retailer_id": user._id });
        }
        if (orders.length > 0) {
          sendSuccessResponse(res, 200, true, "All the orders", orders);
        } else {
          sendErrorResponse(res, 404, false, "orders not found");
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };
}
