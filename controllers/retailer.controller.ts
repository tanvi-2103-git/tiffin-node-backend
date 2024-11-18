import { Request, Response } from "express";
import { OrganizationModel, Organization } from "../model/organizationModel";
import { UserModel, User } from "../model/userModel";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getUserFromToken } from "./admin.controller";
import { OrderModel } from "../model/orderModel";
import moment from "moment";
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

  //add pagination
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

  public getWeeklyOrders = async (req: Request, res: Response) => {
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
        const year = parseInt(req.query.year as string);
        const startOfYear = moment().year(year).startOf("year").toDate();
        const endOfYear = moment().year(year).endOf("year").toDate();
        let orders;
        let data;
        if (status && year) {
          orders = await OrderModel.aggregate([
            {
              $match: {
                delivery_status: status,
                org_created_at: {
                  $gte: startOfYear,
                  $lt: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  week: { $week: "$org_created_at" }, // Group by week number
                  year: { $year: "$org_created_at" },
                },
                totalOrders: { $sum: 1 },
                totalAmount: { $sum: "$cart.total_amount" },
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
          orders = await OrderModel.aggregate([
            {
              $match: {
                org_created_at: {
                  $gte: startOfYear,
                  $lt: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  week: { $week: "$org_created_at" }, // Group by week number
                  year: { $year: "$org_created_at" },
                },
                totalOrders: { $sum: 1 },
                totalAmount: { $sum: "$cart.total_amount" },
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
        if (orders) {
          data = orders.map((item) => {
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
              totalOrders: item.totalOrders,
              totalAmount: item.totalAmount,
            };
          });
          sendSuccessResponse(res, 200, true, " ", data);
        } else {
          sendErrorResponse(res, 404, false, "orders not found");
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };

  public getMonthlylyOrders = async (req: Request, res: Response) => {
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
        const year = parseInt(req.query.year as string);
        const startOfYear = moment().year(year).startOf("year").toDate();
        const endOfYear = moment().year(year).endOf("year").toDate();
        let orders;
        let data;
        if (status && year) {
          orders = await OrderModel.aggregate([
            {
              $match: {
                delivery_status: status,
                org_created_at: {
                  $gte: startOfYear,
                  $lte: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$org_created_at" },
                  month: { $month: "$org_created_at" },
                },
                totalOrders: { $sum: 1 },
                totalAmount: { $sum: "$cart.total_amount" },
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
          orders = await OrderModel.aggregate([
            {
              $match: {
                org_created_at: {
                  $gte: startOfYear,
                  $lte: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$org_created_at" },
                  month: { $month: "$org_created_at" },
                },
                totalOrders: { $sum: 1 },
                totalAmount: { $sum: "$cart.total_amount" },
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
        if (orders) {
          data = orders.map((item) => {
            const startOfmonth = moment()
              .month(item._id.month - 1)
              .format("YYYY-MM");

            //  const endOfWeek = startOfWeek.clone().endOf('isoWeek');
            return {
              month: startOfmonth,
              totalOrders: item.totalOrders,
              totalAmount: item.totalAmount,
            };
          });
          res.status(200).json({ statuscode: 200, data: data });
        } else {
          sendErrorResponse(res, 404, false, "orders not found");
        }
      }
    } catch (error) {
      sendErrorResponse(res, 404, false, `internal server error ${error}`);
    }
  };
}
