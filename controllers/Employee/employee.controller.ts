import { Request, Response } from "express";
import { User, UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";
import { TiffinItem, TiffinItemModel } from "../../model/tiffinItemModel";
import { OrderModel } from "../../model/orderModel";
import { RETAILER_ID } from "../../utils/constants";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responsesUtils";
import { RetailerController } from "../retailer.controller";
const retailerController = new RetailerController();

export class EmployeeController {
  public getAllTrendyRetailers = async (req: Request, res: Response) => {
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

          const TrendyRetailers = await UserModel.find({
            role_id: RETAILER_ID, // retailer role ID
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
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public getAllRetailersofOrg = async (req: Request, res: Response) => {
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

        let page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;

        if (page < 1 || limit < 1) {
          sendSuccessResponse(
            res,
            400,
            false,
            "Page and limit must be positive integers"
          );
        } else {
          const skip = (page - 1) * limit;

          const Retailers = await UserModel.find({
            role_id: RETAILER_ID, // retailer role ID
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

          sendSuccessResponse(res, 200, true, "Retailers", Retailers, {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
          });
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public searchRetailersOfOrg = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      const { query, approval_status } = req.query;

      if (!query || !user || !user.role_specific_details.organization_id) {
        sendErrorResponse(res,400,false, "Query parameter is required and must be a string Or Unauthorized or invalid user details.")
   
      } else {
        const organizationId = user.role_specific_details.organization_id;
        const searchFields = ["username", "email", "contact_number", "address"];

        let retailers: User[] = [];
        for (let field of searchFields) {
          retailers = await UserModel.find({
            //role_id:RETAILER_ID, //retailer id//retailer id matching is not working
            "role_specific_details.approval": {
              $elemMatch: {
                organization_id: organizationId,
                approval_status: approval_status || { $exists: true },
              },
            },
            isActive: true,
            // [field]: query,
            [field]: { $regex: query, $options: "i" },
          }).exec();

          if (retailers.length > 0) {
            break;
          }
        }
        if (retailers.length === 0) {
          sendSuccessResponse(res,200,true,"No retailers found matching the search criteria",retailers)
          
        } else {
          sendSuccessResponse(res,200,true,"retailers",retailers)

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
          const Retailers = await UserModel.find({
            role_id: RETAILER_ID, // retailer role ID
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
              "No retailers found for the given organization.",Retailers
            );
          } else {
            const retailerIds = Retailers.map((retailer) => retailer._id);

            const skip = (page - 1) * limit;

            const Tiffins = await TiffinItemModel.find({
              retailer_id: { $in: retailerIds },
            })
              .skip(skip)
              .limit(limit)
              .exec();

            const totalTiffins = await TiffinItemModel.countDocuments({
              retailer_id: { $in: retailerIds },
            });

            const totalPages = Math.ceil(totalTiffins / limit);

            sendSuccessResponse(
              res,
              200,
              true,
              "All tiffins of organization.",
              Tiffins,
              {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalTiffins,
              }
            );
          }
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public getAllRetailersWithTiffin = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req); // Assuming getUserFromToken retrieves the user from token
  
      // Step 1: Check for valid user & organization
      if (
        !user ||
        user.isActive === false ||
        !user.role_specific_details ||
        !user.role_specific_details.organization_id
      ) {
         sendSuccessResponse(res, 401, false, "Unauthorized or invalid user details.");
         return;
      }
  
      const organizationId = user.role_specific_details.organization_id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      if (page < 1 || limit < 1) {
         res.status(400).json({
          statuscode: 400,
          message: "Page and limit must be positive integers.",
        });
        return;
      }
  
      // Step 2: Fetch retailers linked to the organization
      const retailers = await UserModel.find({
        role_id: RETAILER_ID, // Assuming you have a constant or string for retailer role
        "role_specific_details.approval": {
          $elemMatch: {
            organization_id: organizationId,
          },
        },
      }).exec();
  
      if (retailers.length === 0) {
         sendSuccessResponse(res, 200, true, "No retailers found for the given organization.",retailers);
         return;
      }
  
      const retailerIds = retailers.map((retailer) => retailer._id); // Extract retailer IDs
  
      // Step 3: Fetch tiffins with retailer details populated
      const skip = (page - 1) * limit;
  
      const tiffins = (await TiffinItemModel.find({
        retailer_id: { $in: retailerIds },
      })
        .skip(skip)
        .limit(limit)
        .populate("retailer_id", "username") // Populate retailer's name from the User model
        .exec()) as TiffinItem[];
  
      const totalTiffins = await TiffinItemModel.countDocuments({
        retailer_id: { $in: retailerIds },
      });
  
      const totalPages = Math.ceil(totalTiffins / limit);
  
      const groupedTiffins = tiffins.reduce((group: { retailerName: string; tiffins: TiffinItem[] }[], tiffin: TiffinItem) => {
  
        const retailerName = (tiffin.retailer_id as unknown as User).username;
        // Find the existing group for this retailer
        let retailerGroup = group.find((g) => g.retailerName === retailerName);
      
        if (!retailerGroup) {
          // If not found, create a new group
          retailerGroup = { retailerName, tiffins: [] };
          group.push(retailerGroup);
        }
      
        // Add the current tiffin to the group's tiffins array
        retailerGroup.tiffins.push(tiffin);
      
        return group;
      }, []);
      
      // Step 5: Send the grouped tiffins response with pagination
      sendSuccessResponse(
        res,
        200,
        true,
        "Tiffins grouped by retailer.",
        groupedTiffins,
        {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalTiffins,
        }
      );
      return;
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
        } else {
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
          role_id: RETAILER_ID, // retailer role ID
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


          sendSuccessResponse(res, 200, true, "Tiffin", Tiffin);
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

          const orders = await OrderModel.find({
            "cart.customer_id": user._id,
            delivery_status: "delivered",
          }).sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

          const totalOrders = await OrderModel.countDocuments({
            "cart.customer_id": user._id,
            delivery_status: "delivered",
          });
          const totalPages = Math.ceil(totalOrders / limit);

          if (orders.length > 0)
            sendSuccessResponse(res, 200, true, "orders", orders, {
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalOrders,
            });
          else sendSuccessResponse(res, 200, true, "orders not found",orders);
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

  public getPendingOrders = async (req: Request, res: Response) => {
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
          const orders = await OrderModel.find({
            "cart.customer_id": user._id,
            delivery_status: "pending",
          })
            .skip(skip)
            .limit(limit)
            .exec();

          const totalOrders = await OrderModel.countDocuments({
            "cart.customer_id": user._id,
            delivery_status: "pending",
          });
          const totalPages = Math.ceil(totalOrders / limit);

          if (orders.length > 0)
            sendSuccessResponse(res, 200, true, "orders", orders, {
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalOrders,
            });
          else sendSuccessResponse(res, 200, true, "orders not found",orders);
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
      const order = await OrderModel.findOne({_id:orderId, 'cart.customer_id':user._id});
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
      }}
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
              "cart.customer_id": user._id,
              delivery_status: status,
            })
              .skip(skip)
              .limit(limit)
              .exec();

            totalItems = await OrderModel.countDocuments({
              "cart.customer_id": user._id,
              delivery_status: status,
            });

            totalPages = Math.ceil(totalItems / limit);

            newdata = await retailerController.addUserName(orders);
          } else {
            orders = await OrderModel.find({ "cart.customer_id": user._id })
              .skip(skip)
              .limit(limit)
              .exec();

            totalItems = await OrderModel.countDocuments({
              "cart.customer_id": user._id,
            });

            totalPages = Math.ceil(totalItems / limit);
            newdata = await retailerController.addUserName(orders);
          }
          if (orders.length > 0)
            sendSuccessResponse(res, 200, true, "all orders", newdata, {
              currentPage: page,
              totalPages: totalPages,
              totalItems: totalItems,
            });
          else
          sendSuccessResponse(res, 200, true, "orders not found",orders);
          
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };
}
