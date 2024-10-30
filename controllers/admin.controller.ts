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
      return undefined; // Return undefined if no token
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
    };
    const user = (await UserModel.findOne({ _id: decoded.id }).exec()) as User;

    if (!user) {
      console.error("User not found");
      return undefined; // Return undefined if no user found
    }

    return user; // Return the user if found
  } catch (error) {
    console.error("Invalid token", error);
    return undefined; // Return undefined on error
  }
};

export class AdminController {
  public getUser = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };
        // console.log(decoded.id);

        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;
        res.json(user);
      }
    } catch (err) {
      console.log(err);
    }
  };

  public pendingApprovalRetailer = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };
        console.log(decoded.id);

        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;
        // console.log(user);

        if (!user) {
          res.status(404).json({ message: "User not found" }); // Ensure the function exits if user is not found
        }

        const result = await UserModel.find({
          role: "Retailer",
          "role_specific_details.retailer.approval": {
            $elemMatch: {
              approval_status: "pending",
              organization_id:
                user.role_specific_details.subadmin.organization_id,
            },
          },
        }).exec();
        console.log(result);

        res.status(200).json(result);
      } else {
        res.status(401).json({ message: "Authorization token is missing" });
      }
    } catch (error) {
      console.error("Error fetching pending approval retailers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  public approveRetailer = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);

      if (
        !user ||
        !user.role_specific_details ||
        !user.role_specific_details.subadmin
      ) {
         res
          .status(403)
          .json({ message: "Unauthorized or invalid user details." });
      }

      const retailer_id = req.params.retailer_id;
      console.log("retailer_id",retailer_id);

      
      const organization_id =
        user?.role_specific_details.subadmin.organization_id;
        console.log("organization_id",organization_id);
      // Step 1: Find the retailer with a pending approval status for the subadmin's organization
      // const retailer = await UserModel.findById(retailer_id)
      const retailer = await UserModel.findOne({
        _id: retailer_id,
        role: "Retailer",
        
        "role_specific_details.retailer.approval": {
          $elemMatch: {
            // approval_status: "pending",
            organization_id: organization_id,
          },
        },
      }).exec();
      console.log("retailer", retailer);
      // res.json(retailer)
      if (!retailer) {
         res
          .status(404)
          .json({
            message:
              "Retailer not found or no pending approval for this organization.",
          });
      }

      const result = await UserModel.updateOne(
        { _id: retailer_id },
        {
          $set: {
            "role_specific_details.retailer.approval.$[elem].approval_status":
              "approved",
          },
        },
        {
          arrayFilters: [{ "elem.organization_id": organization_id }],
        }
      );
      console.log(result);
      
      // if (result.modifiedCount === 0) {
      //    res
      //     .status(400)
      //     .json({ message: "Failed to update approval status." });
      // }

       res
        .status(200)
        .json(result);
    } catch (error) {
      console.error("Error approving retailer:", error);
       res.status(500).json({ message: "Internal server error" });
    }
  };

  // public approveRetailer = async (req: Request, res: Response) => {
  // const user =  getUserFromToken;
  // console.log(user,"user");
  // const retailer_id = new ObjectId(req.params._id)
  // const result = await UserModel.find({
  //   role: 'Retailer',
  //   "role_specific_details.retailer.approval": {
  //     $elemMatch: {
  //       approval_status: "pending",
  //       organization_id: user.role_specific_details.subadmin.organization_id
  //     }
  //   }
  // }).exec();
  // const data = await UserModel.updateOne(
  //   { _id: retailer_id, "role_specific_details.retailer.approval.organization_id": user.role_specific_details.subadmin.organization_id},
  //   {  $set: {
  //     "role_specific_details.retailer.approval": {
  //       approval_status: "pending",
  //       organization_id: organization_id
  //     }
  //   }}
  // );

  // const data = await UserModel.updateOne(
  //   { _id: decoded.id},
  //   { $set: { "role_specific_details.retailer.approval.0.approval_status": "pending", "role_specific_details.retailer.approval.0.organization_id": organization_id } }
  // );
  // }

  public addRequest = async (req: Request, res: Response) => {
    try {
      const organization_id = new ObjectId(req.params.id);

      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };
        console.log(decoded.id);

        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as User;
        console.log(user);

        if (!user) {
          res.status(404).json({ message: "User not found" }); // Ensure the function exits if user is not found
        }

        const data = await UserModel.updateOne(
          { _id: decoded.id },
          {
            $push: {
              "role_specific_details.retailer.approval": {
                approval_status: "pending",
                organization_id: organization_id,
              },
            },
          }
        );
        res.json(data);
        //  const result = await UserModel.find({
        //   role: 'Retailer',
        //   "role_specific_details.retailer.approval": {
        //     $elemMatch: {
        //       approval_status: "pending",
        //       organization_id: user.role_specific_details.subadmin.organization_id
        //     }
        //   }
        // }).exec();
      }
    } catch (err) {
      res.json(err);
    }
  };
}
