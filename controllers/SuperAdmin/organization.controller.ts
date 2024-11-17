import { Request, Response } from "express";
import { Organization, OrganizationModel } from "../../model/organizationModel";
import { User, UserModel } from "../../model/userModel";

// interface Params {
//     id: string; // Assuming you are using "id" as the parameter name
// }

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

  public searchOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.query;  // Accept a generic query parameter

      console.log('Received query parameter:', query);
  
      if (!query) {
        res.status(400).json({
          statuscode: 400,
          message: "Query parameter is required and must be a string."
        });
        
      }else{
        
      const searchFields = ['org_name','org_location.loc']; // Customize as needed

      let organizations: Organization[] = [];

      for(let field of searchFields){
        organizations = await OrganizationModel.find({
          isActive:true,
          [field]: query,
        }).exec();

        if(organizations.length > 0){
          break;
        }

      }
  
      if (organizations.length === 0) {
        res.status(404).json({
          statuscode: 404,
          message: "No organizations found matching the search criteria"
        });
        
      }else{
        res.status(200).json({
          statuscode: 200,
          data: organizations,
        });
      }
  
    }
  
      
    } catch (error) {
      console.error('Error searching organizations:', error);
      res.status(500).json({
        statuscode: 500,
        message: "Error searching organizations",
        error,
      });
    }
  };
  
  
  public getAllOrganizations = async (req: Request, res: Response) =>{
    try {
    const status = req.query.status || 'true';  
    console.log(status);
    const page = parseInt(req.query.page as string) || 1; 
    let limit;
    if(status == 'true'){
       limit = parseInt(req.query.limit as string) || 10;
       console.log(status);
       console.log(limit);
    }else{
      limit = await OrganizationModel.countDocuments({isActive:true});
    }
   
    console.log(limit);
    if(page < 1 || limit < 1){
      res.status(400).json({ message: "Page and limit must be positive integers" });
      //return;
      
    }else{
      const skip = (page - 1) * limit;

      const organizations = await OrganizationModel.find({isActive:true})
      .skip(skip)
      .limit(limit);

      const totalItems = await OrganizationModel.countDocuments({
        isActive : true
      })

      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({ 
        statuscode: 200, 
        data: organizations,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    }

  } catch (error) {
      res.status(500).json({
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
      if (organization?.isActive==false || !organization) {
        res
          .status(404)
          .json({ statuscode: 404, message: "Organization not found" });
      }else{
        res.status(200).json({ data: organization, statuscode: 200 });
      }
    } catch (error) {
      res.status(500).json({
        statuscode: 500,
        message: "Error fetching organization",
        error,
      });
    }
  };

  //delete org (By id)
  public deleteOrganization = async (
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const deletedOrg = await OrganizationModel.findByIdAndUpdate({_id:id},{
        isActive:false
      });
      const deleteEmployees = await UserModel.updateMany({
        "role_specific_details.organization_id": id
      },{ $set: { isActive: false } });
      if (!deletedOrg) {
        res
          .status(404)
          .json({ statuscode: 404, message: "Organization not found" });
      }
      res.status(200).json({
        statuscode: 200,
        message: "Organization deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
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
    
    try {
      const _id = req.params.id;


    const {...organization } = req.body;
    const org = await OrganizationModel.findById(_id);
    if(org?.isActive==true){

      // Update the organization
      const result = await OrganizationModel.updateOne({ _id }, organization);

      // Check if the update was successful
      if (result.modifiedCount === 0) {
        res.status(404).json({
          statuscode: 404,
          message: "Organization not found or no changes made",
        });
      }

      res
        .status(200)
        .json({
          statuscode: 200,
          message: "Organization updated successfully",
        });}
        else{
          res
          .status(404)
          .json({
            statuscode: 404,
            message: "Organization not found ",
          });
        }
    } catch (error) {
      res.status(500).json({
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

  public uploadOrganizationImage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const org_id = req.params.orgid;
      const cloudinaryUrl = req.body.cloudinaryUrl;
      console.log("cloudinaryUrl:", cloudinaryUrl);

      if (!cloudinaryUrl) {
        console.error("No Cloudinary URLs found.");
        res.status(500).send("Internal Server Error");
      } else {
        const org = await OrganizationModel.findByIdAndUpdate(
          org_id,
          { org_image_url: cloudinaryUrl },
          { new: true, runValidators: true }
        );

        if (org) {
          res.status(200).json({
            statuscode: 200,
            data: org,
          });
        } else {
          res.status(404).json({ statuscode: 404, message: "org not found" });
        }
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}
