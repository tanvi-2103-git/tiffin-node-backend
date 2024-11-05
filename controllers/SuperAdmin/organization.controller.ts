
import { Request, Response } from "express";
import { Organization, OrganizationModel } from "../../model/organizationModel";
import { User, UserModel } from "../../model/userModel";

// interface Params {
//     id: string; // Assuming you are using "id" as the parameter name
// }
//ananya
export class OrganizationController {
  public addOrganization = async (req: Request, res: Response) => {
    try {
      const organizationData: Organization = req.body;
      const newOrganization = await OrganizationModel.create(organizationData);
      res.status(201).json({ statuscode: 201, data: newOrganization });
    } catch (error) {
      res.status(500).json({ message: "Error creating organization", error });
    }
  };

  //get all organization
  public getAllOrganizations = async (req: Request, res: Response) =>{
    try {
      const organizations = await OrganizationModel.find();
      res.status(200).json({ statuscode: 200, data: organizations });
    } catch (error) {
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "Error fetching organizations",
          error,
        });
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
      if (!organization) {
        res
          .status(404)
          .json({ statuscode: 404, message: "Organization not found" });
      }
      res.status(200).json({ data: organization, statuscode: 200 });
    } catch (error) {
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "Error fetching organization",
          error,
        });
    }
  };

  //delete org (By id)
  public deleteOrganization = async(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const deletedOrg = await OrganizationModel.findByIdAndDelete(id);
      if (!deletedOrg) {
        res
          .status(404)
          .json({ statuscode: 404, message: "Organization not found" });
      }
      res
        .status(200)
        .json({
          statuscode: 200,
          message: "Organization deleted successfully",
        });
    } catch (error) {
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "Error deleting organization",
          error,
        });
    }
  };

  // Update org
  public updateOrganization = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    // const { _id, ...organization } = req.body;
    const _id = req.params.id;
    const {...organization } = req.body;
    try {
      // Update the organization
      const result = await OrganizationModel.updateOne({ _id }, organization);

      // Check if the update was successful
      if (result.modifiedCount === 0) {
        res
          .status(404)
          .json({
            statuscode: 404,
            message: "Organization not found or no changes made",
          });
      }

      res
        .status(200)
        .json({
          statuscode: 200,
          message: "Organization updated successfully",
        });
    } catch (error) {
      res
        .status(500)
        .json({
          statuscode: 500,
          message: "Error updating organization",
          error,
        });
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
}

