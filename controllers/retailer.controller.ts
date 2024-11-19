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
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const status = req.query.status;
        const page = parseInt(req.query.page as string) || 1;  
        const limit = parseInt(req.query.limit as string) || 10;  

        if(page < 1 || limit < 1){
          res.status(400).json({ message: "Page and limit must be positive integers" });
          
        }else{
        const skip = (page - 1) * limit;  
        let orders;
        let totalItems;
        let totalPages;
        let newdata;

        if (status) {
          orders = await OrderModel.find({
            "cart.retailer_id": user._id,
            delivery_status: status,
          }).skip(skip).limit(limit).exec();

            totalItems = await OrderModel.countDocuments({
            "cart.retailer_id": user._id,
            delivery_status: status,
          });

           totalPages = Math.ceil(totalItems / limit);

            newdata = await this.addUserName(orders);

        } else {
          orders = await OrderModel.find({ "cart.retailer_id": user._id })
          .skip(skip).limit(limit).exec();
        
            totalItems = await OrderModel.countDocuments({
            "cart.retailer_id": user._id,
          });

           totalPages = Math.ceil(totalItems / limit);
            newdata = await this.addUserName(orders);
          
        }
        if (orders.length > 0)
          res.status(200).json({ statuscode: 200, data: newdata,
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalItems,
          },
        });
        else
          res
            .status(404)
            .json({ statuscode: 404, message: "orders not found" });
      }
    }

       
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: `internal server error ${error}` });
    }
  };

  public addUserName = async (orders: Order[]) => {
    const newdata = await Promise.all(
      orders.map(async (order) => {
        let updatedOrder;
        const retailer_id = order.cart.retailer_id;
        const customer_id = order.cart.customer_id;
        const tiffinitems  = order.cart.items;
        
        const tiffindata = await Promise.all( 
          tiffinitems.map(async(tiffinitem)=>{
          const tiffin_id = tiffinitem.tiffin_id;
        

          const tiffin = await TiffinItemModel.findById(tiffin_id).exec();

          const tiffin_name = tiffin?.tiffin_name;
          const tiffin_type = tiffin?.tiffin_type;
          updatedOrder = (order as Document).toObject(); 
          const tiffinItem= (tiffinitem as Document).toObject();
          tiffinItem.tiffin_name=tiffin_name;
          tiffinItem.tiffin_type=tiffin_type;
          
          return tiffinItem
        }));
       
     
        const retailer = await UserModel.findById(retailer_id).exec();
        const retailer_name = retailer?.username; 
  
       
       const customer = await UserModel.findById(customer_id).exec();
       const customer_name = customer?.username;
       

         updatedOrder = (order as Document).toObject(); 
        
         updatedOrder.cart.retailer_name = retailer_name;
         updatedOrder.cart.customer_name = customer_name;
         updatedOrder.cart.items = tiffindata;
       
         return updatedOrder;
      })
    );
   // console.log(newdata);
    return newdata;
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
