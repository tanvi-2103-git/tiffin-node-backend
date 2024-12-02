import { Request, Response } from "express";
import { OrganizationModel, Organization } from "../model/organizationModel";
import { UserModel, User } from "../model/userModel";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { Document } from "mongodb";
import { getUserFromToken } from "./admin.controller";
import { Order, OrderModel } from "../model/orderModel";
import moment from "moment";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responsesUtils";
import { TiffinItemModel } from "../model/tiffinItemModel";

export class RetailerController {
  public addRequest = async (req: Request, res: Response) => {
    try {
      const organization_id = req.params.organization_id;
      const orgloc = req.query.org_location;
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };

        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;

        if (!user) throw "User not found";

        const data = await UserModel.updateOne(
          { _id: decoded.id },
          {
            $push: {
              "role_specific_details.approval": {
                approval_status: "pending",
                organization_id: organization_id,
                org_loc: orgloc,
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

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );
        } else {
          const skip = (page - 1) * limit;
          let orders;
          let totalItems;
          let totalPages;
          let newdata;

          if (status) {
            orders = await OrderModel.find({
              "cart.retailer_id": user._id,
              delivery_status: status,
            })
            .sort({ updated_at: -1 })
              .skip(skip)
              .limit(limit)
              .exec();

            totalItems = await OrderModel.countDocuments({
              "cart.retailer_id": user._id,
              delivery_status: status,
            });

            totalPages = Math.ceil(totalItems / limit);

            newdata = await this.addUserName(orders);
          } else {
            orders = await OrderModel.find({ "cart.retailer_id": user._id })
            .sort({ updated_at: -1 })
              .skip(skip)
              .limit(limit)
              .exec();

            totalItems = await OrderModel.countDocuments({
              "cart.retailer_id": user._id,
            });

            totalPages = Math.ceil(totalItems / limit);
            newdata = await this.addUserName(orders);
          }
          if (orders.length >= 0)
            sendSuccessResponse(res, 200, true, "all orders", newdata, {
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalItems,
            });
          else sendSuccessResponse(res, 200, true, "orders not found", newdata) ;
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };

  public searchOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      let retailer = await getUserFromToken(req);
      let newdata: any;
      const user = await getUserFromToken(req);
      //  console.log(user);
      const { query } = req.query;
      if (!query && !user) throw "Query parameter is required ";
      else {
        const searchFields = [
          "cart.retailer_id",
          "cart.customer_id",
          "cart.items.tiffin_id",
        ];
        let orders: Order[] = [];
        const user = await UserModel.find({
          username: { $regex: query, $options: "i" },
        });
        const userIds = user.map((user) => user._id);
        console.log("userIds", userIds);

        const tiffin = await TiffinItemModel.find({
          $or: [
            { tiffin_name: { $regex: query, $options: "i" } },
            { tiffin_type: { $regex: query, $options: "i" } },
          ],
        });

        const tiffinIds = tiffin.map((tiffin) => tiffin._id);

        for (let field of searchFields) {
          if (user.length > 0) {
            orders = await OrderModel.find({
              "cart.retailer_id": retailer?._id,
              [field]: { $in: userIds }
            }).exec();

          } else if (tiffin.length > 0) {
            orders = await OrderModel.find({
              "cart.retailer_id": retailer?._id,
              [field]: { $in: tiffinIds },
            }).exec();
          } else {
            orders = await OrderModel.find({ "cart.retailer_id": retailer?._id,_id: query });
          }
          newdata = await this.addUserName(orders);

          if (orders.length > 0) {
            break;
          }
        }

        if (orders.length === 0) {
          sendSuccessResponse(
            res,
            200,
            true,
            "No orders found matching the search criteria"
          );
        } else {
          sendSuccessResponse(res, 200, true, "data", newdata);
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };

  public addUserName = async (orders: Order[]) => {
    const newdata = await Promise.all(
      orders.map(async (order) => {
        let updatedOrder;
        const retailer_id = order.cart.retailer_id;
        const customer_id = order.cart.customer_id;
        const tiffinitems = order.cart.items;

        const tiffindata = await Promise.all(
          tiffinitems.map(async (tiffinitem) => {
            const tiffin_id = tiffinitem.tiffin_id;

            const tiffin = await TiffinItemModel.findById(tiffin_id).exec();

            const tiffin_name = tiffin?.tiffin_name;
            const tiffin_type = tiffin?.tiffin_type;
            updatedOrder = (order as Document).toObject();
            const tiffinItem = (tiffinitem as Document).toObject();
            tiffinItem.tiffin_name = tiffin_name;
            tiffinItem.tiffin_type = tiffin_type;

            return tiffinItem;
          })
        );

        const retailer = await UserModel.findById(retailer_id).exec();
        const retailer_name = retailer?.username;

        const customer = await UserModel.findById(customer_id).exec();
        const customer_name = customer?.username;
        const customer_contact = customer?.contact_number;
        const customer_email = customer?.email;
        updatedOrder = (order as Document).toObject();

        updatedOrder.cart.retailer_name = retailer_name;
        updatedOrder.cart.customer_name = customer_name;
        updatedOrder.cart.customer_contact = customer_contact;
        updatedOrder.cart.customer_email = customer_email;
        updatedOrder.cart.items = tiffindata;

        return updatedOrder;
      })
    );
    // console.log(newdata);
    return newdata;
  };

  public getOrderCount = async (req: Request, res: Response) => {
    try{
      const user = await getUserFromToken(req);
      if (user?.isActive == false || !user) {
        sendSuccessResponse(
          res,
          401,
          false,
          "Unauthorized or invalid user details."
        );
      } else {
        const userId = user._id;
  const totalItems = await OrderModel.aggregate([
        {
          $match: {
            'cart.retailer_id':userId,
            // role_id: new ObjectId(ADMIN_ID),
            isActive: true
          }
        },
        {
          $group: {
            _id: "$delivery_status",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            delivery_status: "$_id",
            count: 1
          }
        }
      ]);
      
      if(totalItems)
      sendSuccessResponse(res, 200, true, "count of order", totalItems)
      else throw "error in fetching count"
}
    }catch(error){
      sendErrorResponse(res, 500, false, "error", error);

    }
  }
  public getWeeklyOrders = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user?.isActive == false || !user)
        throw "Unauthorized or invalid user details.";
      else {
        const status = req.query.status;
        const year = parseInt(req.query.year as string);
        const startOfYear = moment().year(year).startOf("year").toDate();
        const endOfYear = moment().year(year).endOf("year").toDate();
        let orders;
        let data;
        if (status) {
          orders = await OrderModel.aggregate([
            {
              $match: {
                delivery_status: status,
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
          sendSuccessResponse(res, 200, true, "weeklydata", data);
        } else sendSuccessResponse(res, 200, true,"weeklydata not found", data) ;
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };

  public getMonthlylyOrders = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user?.isActive == false || !user)
        throw "Unauthorized or invalid user details.";
      else {
        const status = req.query.status;
        const year = parseInt(req.query.year as string);
        const startOfYear = moment().year(year).startOf("year").toDate();
        const endOfYear = moment().year(year).endOf("year").toDate();
        console.log(
          "year",
          year,
          "status",
          status,
          "startOfYear",
          startOfYear,
          "endOfYear",
          endOfYear
        );

        let orders;
        let data;
        if (status) {
          orders = await OrderModel.aggregate([
            {
              $match: {
                delivery_status: status,
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
          console.log(orders);
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
          sendSuccessResponse(res, 200, true, "monthlydata", data);

          // res.status(200).json({ statuscode: 200, data: data });
        } else sendSuccessResponse(res, 200, true, "monthlydata not found", data);
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };

  public getMonthlyWeeklyOrders = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user?.isActive == false || !user)
        throw "Unauthorized or invalid user details.";
      else {
        const status = req.query.status;
        const year = parseInt(req.query.year as string);
        const filter = req.query.filter as string;
        if (!filter) throw "Add Monthly or Weekly filter";
        const startOfYear = moment().year(year).startOf("year").toDate();
        const endOfYear = moment().year(year).endOf("year").toDate();
        const orders = await OrderModel.aggregate([
          {
            $match: {
              created_at: {
                $gte: startOfYear,
                $lte: endOfYear,
              },
              ...(status && { delivery_status: status }),
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$created_at" },
                ...(filter.toLowerCase() === "month" && {
                  month: { $month: "$created_at" },
                }),
                ...(filter.toLowerCase() === "week" && {
                  week: { $week: "$created_at" },
                }),
              },
              totalOrders: { $sum: 1 },
              totalAmount: { $sum: "$cart.total_amount" },
            },
          },
          {
            $sort: {
              "_id.year": 1,
              ...(filter.toLowerCase() === "week" && { "_id.week": 1 }),
              ...(filter.toLowerCase() === "month" && { "_id.month": 1 }),
            },
          },
        ]);
        if (orders) {
          const data = orders.map((item) => {
            const startOfmonth = moment()
              .month(item._id.month - 1)
              .format("YYYY-MM");
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

            //  const endOfWeek = startOfWeek.clone().endOf('isoWeek');

            if (filter.toLowerCase() === "week") {
              return {
                startOfWeek: startOfWeek,
                endOfWeek: endOfWeek,
                totalOrders: item.totalOrders,
                totalAmount: item.totalAmount,
              };
            } else {
              return {
                month: startOfmonth,
                totalOrders: item.totalOrders,
                totalAmount: item.totalAmount,
              };
            }
          });

          sendSuccessResponse(res, 200, true, `${filter}ly orders`, data);
        } else  sendSuccessResponse(res, 200, true, `${filter}ly orders not found`);
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error`, error);
    }
  };

  public cancelOrder = async (req: Request, res: Response) => {
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
        const orderId = req.params.orderid;
        const order = await OrderModel.findOne({
          _id: orderId,
          "cart.retailer_id": user._id,
        });
        if (order) {
          if (order.delivery_status == "pending") {
            const order = await OrderModel.findByIdAndUpdate(orderId, {
              delivery_status: "cancelled",
            });
            if (order)
              sendSuccessResponse(res, 200, true, "order updated successful");
          } else if (order.delivery_status == "delivered") {
            sendSuccessResponse(
              res,
              200,
              true,
              "order is already delivered cannot be modified"
            );
          } else {
            sendSuccessResponse(
              res,
              200,
              true,
              "order is already cancelled cannot be modified"
            );
          }
        } else {
          sendSuccessResponse(res, 200, true, "order not found");
        }
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
}
