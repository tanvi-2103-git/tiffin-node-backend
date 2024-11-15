import { Request, Response } from "express";
import { User, UserModel } from "../model/userModel";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { RETAILER_ID } from "../utils/constants";

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

export class AdminController {
  public getallRetailerRequest = async (req: Request, res: Response) => {
    try{
      const user = await getUserFromToken(req);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const status = req.query.status;
        if(status){
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

        res.status(200).json({ statuscode: 200, data: result });
      }
      else{
        const result = await UserModel.find({
          role_id: RETAILER_ID, //retailer:roleid
          isActive: true,
          "role_specific_details.approval": {
            $elemMatch: {
              
              organization_id: user?.role_specific_details.organization_id,
            },
          },
        }).exec();
        // console.log(result);

        res.status(200).json({ statuscode: 200, data: result });
      }
      }

    }catch(error){
      res
      .status(500)
      .json({ statuscode: 500, message: `Internal server error ${error}` });
  
    }
  }

  
  public pendingApprovalRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      console.log("org", user?.role_specific_details.organization_id);

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const result = await UserModel.find({
          role_id: RETAILER_ID,
          isActive: true,
          // "role_specific_details.approval": {
          //   $elemMatch: {
          //     approval_status: "pending",
          //     organization_id: user?.role_specific_details.organization_id,
          //   },
          // },
        }).exec();
        console.log(result);

        res.status(200).json({ statuscode: 200, data: result });
      }
    } catch (error) {
      console.error("Error fetching pending approval retailers:", error);
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error ${error}` });
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
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
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

        res.status(200).json({ statuscode: 200, data: result });
      }
    } catch (error) {
      console.error("Error fetching pending approval retailers:", error);
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error ${error}` });
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
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
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
        console.log(result);

        res.status(200).json({ statuscode: 200, data: result });
      }
    } catch (error) {
      console.error("Error fetching rejected approval retailers:", error);
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error ${error}` });
    }
  };


  public searchRetailers = async(req: Request,res: Response) : Promise<void> =>{
    try{
       
       const { query ,approval_status} = req.query;
       console.log(approval_status);
 
       if(!query  || typeof query !== 'string'){
         res.status(400).json({
           statuscode: 400,
           message: "Query parameter is required and must be a string."
         });
       }else{
         const searchFields = ['username','email','contact_number','address'];
 
         let retailers : User[] = [];
 
         for(let field of searchFields){
           retailers = await UserModel.find({
             role_id:"6723475f74b32cfe39e5d0a2", //retailer id
             "role_specific_details.approval.approval_status":approval_status,
            //  [field] : query,
            [field]: { $regex: query, $options: "i" }
           }).exec();

           if(retailers.length > 0){
             break;
           }
         }
         if(retailers.length === 0){
           res.status(404).json({
             statuscode: 404,
             message: "No retailers found matching the search criteria" 
           })
         }else{
           res.status(200).json({
             statuscode: 200,
             data: retailers,
           });
         }
       }
    }catch(error){
     console.error('Error searching retailer:', error);
     res.status(500).json({
       statuscode: 500,
       message: "Error searching retailer",
       error,
     });
    }
   }
 

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
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
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
        console.log("retailer", retailer);
        // res.json(retailer)
        if (!retailer) {
          res.status(404).json({
            statuscode: 404,
            message:
              "Retailer not found or no pending approval for this organization.",
          });
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
        console.log(result);

        res.status(200).json({ statuscode: 403, data: result });
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
      console.log(user, "user");

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {

        const retailer_id = req.params.retailer_id;
        const {rejection_reason} = req.body;
        console.log("retailer_id", retailer_id);

        const organization_id = user?.role_specific_details.organization_id;
        console.log("organization_id", organization_id);
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
        console.log("retailer", retailer);
        // res.json(retailer)
        if (!retailer) {
          res.status(404).json({
            statuscode: 404,
            message:
              "Retailer not found or no pending approval for this organization.",
          });
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
        console.log(result);

        res.status(200).json({ statuscode: 403, data: result });
      }
    } catch (error) {
      console.error("Error approving retailer:", error);
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error: ${error}` });
    }
  };

  public makeRetailerTrendy = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (
        user?.isActive == false ||
        user?.role_specific_details.approval_status != "approved" ||
        !user ||
        !user.role_specific_details
      ) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
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
        console.log("retailer", retailer);
        // res.json(retailer)
        if (!retailer) {
          res.status(404).json({
            statuscode: 404,
            message:
              "Retailer not found or no pending approval for this organization.",
          });
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
        console.log(result);

        res.status(200).json({ statuscode: 403, data: result });
      }
    } catch (error) {
      console.error("Error approving retailer:", error);
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error: ${error}` });
    }
  };


  public ReApply = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (user?.isActive==false || !user) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const admin_id = req.params.admin_id;
        console.log("admin_id", admin_id);
        const result = await UserModel.updateOne(
          { _id: admin_id , isActive:true },
          { $set: { "role_specific_details.approval_status": "pending" } }
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

  // public rejectRetailer = async (req: Request, res: Response) => {
  //   try {
  //     const user = await getUserFromToken(req);

  //     if (
  //       !user ||
  //       !user.role_specific_details ||
  //       !user.role_specific_details.subadmin
  //     ) {
  //       res
  //         .status(401)
  //         .json({
  //           statuscode: 401,
  //           message: "Unauthorized or invalid user details.",
  //         });
  //     }

  //     const retailer_id = req.params.retailer_id;
  //     console.log("retailer_id", retailer_id);

  //     const organization_id =
  //     user?.role_specific_details.approval.organization_id;
  //     console.log("organization_id", organization_id);
  //     // const retailer = await UserModel.findOne({
  //     //   _id: retailer_id,
  //     //   role: "Retailer",

  //     //   "role_specific_details.approval": {
  //     //     $elemMatch: {
  //     //       // approval_status: "pending",
  //     //       organization_id: organization_id,
  //     //     },
  //     //   },
  //     // }).exec();
  //     // console.log("retailer", retailer);
  //     // res.json(retailer)
  //     // if (!retailer) {
  //     //   res
  //     //     .status(404)
  //     //     .json({ statuscode: 404, message: "Retailer not found " });
  //     // }

  //     const result = await UserModel.updateOne(
  //       { _id: retailer_id },
  //       {
  //         $set: {
  //           "role_specific_details.retailer.approval.$[elem].approval_status":
  //             "rejected",
  //         },
  //       },
  //       {
  //         arrayFilters: [{ "elem.organization_id": organization_id }],
  //       }
  //     );
  //     console.log(result);

  //     // if (result.modifiedCount === 0) {
  //     //    res
  //     //     .status(400)
  //     //     .json({ message: "Failed to update approval status." });
  //     // }

  //     res.status(200).json({ statuscode: 200, result });
  //   } catch (error) {
  //     console.error("Error approving retailer:", error);
  //     res
  //       .status(500)
  //       .json({ statuscode: 500, message: `Internal server error: ${error}` });
  //   }
  // };

  //ADD TO RETAILER
}
