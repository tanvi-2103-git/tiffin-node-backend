import { Request, Response } from "express";
import { User, UserModel } from "../model/userModel";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

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
  
  public pendingApprovalRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      console.log("org", user?.role_specific_details.organization_id);

      if (
        !user ||
        !user.role_specific_details ||
        user.role_specific_details.approval_status != "approved"
      ) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const result = await UserModel.find({
          role_id: "6723475f74b32cfe39e5d0a2",
          "role_specific_details.approval": {
            $elemMatch: {
              approval_status: "pending",
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

  public getApprovedRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (
        !user ||
        !user.role_specific_details ||
        user.role_specific_details.approval_status != "approved"
      ) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const result = await UserModel.find({
          role_id: "6723475f74b32cfe39e5d0a2",
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
        !user ||
        !user.role_specific_details ||
        user.role_specific_details.approval_status != "approved"
      ) {
        res.status(401).json({
          statuscode: 401,
          message: "Unauthorized or invalid user details.",
        });
      } else {
        const result = await UserModel.find({
          role_id: "6723475f74b32cfe39e5d0a2", //retailer:roleid
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

  public approveRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      console.log(user, "user");

      if (
        !user ||
        !user.role_specific_details ||
        user.role_specific_details.approval_status != "approved"
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
          role_id: "6723475f74b32cfe39e5d0a2", //retailer

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
          { _id: retailer_id },
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
        !user ||
        !user.role_specific_details ||
        user.role_specific_details.approval_status != "approved"
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
          role_id: "6723475f74b32cfe39e5d0a2", //retailer

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
          { _id: retailer_id },
          {
            $set: {
              "role_specific_details.approval.$[elem].approval_status":
                "rejected",
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
        !user ||
        !user.role_specific_details ||
        user.role_specific_details.approval_status != "approved"
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
          role_id: "6723475f74b32cfe39e5d0a2", //retailer

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
          { _id: retailer_id },
          {
            $set: {
              "role_specific_details.approval.$[elem].istrendy":
                true,
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
