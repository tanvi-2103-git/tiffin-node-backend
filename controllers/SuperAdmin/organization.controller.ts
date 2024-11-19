import { Request, Response } from "express";
import { Organization, OrganizationModel } from "../../model/organizationModel";
import { User, UserModel } from "../../model/userModel";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responsesUtils";



export class OrganizationController {
  public addOrganization = async (req: Request, res: Response) => {
    try {
      const organizationData: Organization = req.body;
      const newOrganization = await OrganizationModel.create(organizationData);
      sendSuccessResponse(
        res,
        200,
        false,
        "Creating organization",
        newOrganization
      );
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error creating organization", error);
    }
  };

  public searchOrganizations = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { query } = req.query; // Accept a generic query parameter


      if (!query) {
        sendErrorResponse(res,400,false, "Query parameter is required and must be a string Or Unauthorized or invalid user details.")
      } else {
        const searchFields = ["org_name", "org_location.loc"]; // Customize as needed

        let organizations: Organization[] = [];

        for (let field of searchFields) {
          organizations = await OrganizationModel.find({
            isActive: true,
            [field]: { $regex: query, $options: "i" },
            // [field]: query,
          }).exec();

          if (organizations.length > 0) {
            break;
          }
        }

        if (organizations.length === 0) {
          sendSuccessResponse(res,200,true,"No organizations found matching the search criteria")
        } else {
          sendSuccessResponse(res,200,true,"data",organizations)
        }
      }
    } catch (error) {
      console.error("Error searching organizations:", error);
      res.status(500).json({
        statuscode: 500,
        message: "Error searching organizations",
        error,
      });
    }
  };

  public getAllOrganizations = async (req: Request, res: Response) => {
    try {
      const status = req.query.status || "true";
      const page = parseInt(req.query.page as string) || 1;
      let limit;
      if (status == "true") {
        limit = parseInt(req.query.limit as string) || 10;
      } else {
        limit = await OrganizationModel.countDocuments({ isActive: true });
      }

      if (page < 1 || limit < 1) {
        res
          .status(400)
          .json({ message: "Page and limit must be positive integers" });
        //return;
      } else {
        const skip = (page - 1) * limit;

        const organizations = await OrganizationModel.find({ isActive: true })
          .skip(skip)
          .limit(limit);

        const totalItems = await OrganizationModel.countDocuments({
          isActive: true,
        });

        const totalPages = Math.ceil(totalItems / limit);


        sendSuccessResponse(res, 200, false, "All organizations",organizations, {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        });
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error fetching organizations", error);
    }
  };

  //getting a specific org
  //as of now not required, but banake rakha hai (;
  public getOrganizationById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const organization = await OrganizationModel.findById(id);
      if (organization?.isActive == false || !organization) {
        sendErrorResponse(res, 404, false, "Organization not found");
      } else {
        res.status(200).json({ data: organization, statuscode: 200 });
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error fetching organization", error);
    }
  };

  //delete org (By id)
  public deleteOrganization = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const deletedOrg = await OrganizationModel.findByIdAndUpdate(
        { _id: id },
        {
          isActive: false,
        }
      );
      const deleteEmployees = await UserModel.updateMany(
        {
          "role_specific_details.organization_id": id,
        },
        { $set: { isActive: false } }
      );
      if (!deletedOrg) {
        sendErrorResponse(res, 404, false, "Organization not found");
      }
      sendSuccessResponse(res, 200, true, "Organization deleted successfully");
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error deleting organization");
    }
  };

  // Update org
  public updateOrganization = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const _id = req.params.id;

      const { ...organization } = req.body;
      const org = await OrganizationModel.findById(_id);
      if (org?.isActive == true) {
        // Update the organization
        const result = await OrganizationModel.updateOne({ _id }, organization);

        // Check if the update was successful
        if (result.modifiedCount === 0) {
          sendErrorResponse(
            res,
            404,
            false,
            "Organization not found or no changes made"
          );
        }
        sendSuccessResponse(
          res,
          200,
          true,
          "Organization updated successfully"
        );
      } else {
        sendErrorResponse(res, 404, false, "Organization not found ");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error updating organization");
    }
  };

  // to do -> create an api which get all the retailers which are approved by one organization
  public getOrgsOfRetailer = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    const org_id = req.body;

    try {
      const retailers = await UserModel.aggregate([
        {
          $match: {
            approval: "org_id",
          },
        },
      ]);
    } catch (error) {}
  };

  public uploadOrganizationImage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const org_id = req.params.orgid;
      const cloudinaryUrl = req.body.cloudinaryUrl;

      if (!cloudinaryUrl) {
        sendErrorResponse(res, 500, false, "Internal Server Error");
      } else {
        const org = await OrganizationModel.findByIdAndUpdate(
          org_id,
          { org_image_url: cloudinaryUrl },
          { new: true, runValidators: true }
        );

        if (org) {
          sendSuccessResponse(res, 200, true, "image uploaded", org);
        } else {
          sendErrorResponse(res, 404, false, "org not found");
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Error uploading org image");
    }
  };
}
