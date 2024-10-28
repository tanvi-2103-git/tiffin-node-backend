
import { Request, Response } from "express";
import { Organization, OrganizationModel } from "../model/organizationModel";

interface Params {
    id: string; // Assuming you are using "id" as the parameter name
}

export  class OrganizationController {
   public addOrganization= async function(req: Request, res: Response) {
    try {
      const organizationData: Organization = req.body;
      const newOrganization = await OrganizationModel.create(organizationData);
      res.status(201).json(newOrganization);
    } catch (error) {
      res.status(500).json({ message: "Error creating organization", error });
    }
  }

  //get all organization
  public getAllOrganizations= async function(req: Request, res: Response){
    try{
        const organizations = await OrganizationModel.find();
        res.status(200).json(organizations);

    } catch(error){
        res.status(500).json({ message: 'Error fetching organizations', error });
    }
  }

  //getting a specific org
  //as of now not required, but banake rakha hai (;
  public getOrganizationById=async function(req: Request, res: Response):Promise<void> {

    const { id } = req.params;
    try {
        const organization = await OrganizationModel.findById(id);
        if (!organization) {
             res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json(organization);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organization', error });
    }
    }

    public getById =async  function(req: Request, res: Response) {
    const { id } = req.params
    return id
}

// async getOrganizationById(req: Request<{ id: string }>, res: Response) {
//     const { id } = req.params;
//     try {
//         const organization = await OrganizationModel.findById(id);
//         if (!organization) {
//             return res.status(404).json({ message: 'Organization not found' });
//         }
//         res.status(200).json(organization);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching organization', error });
//     }
// }

  //delete org (By id)
  public deleteOrganization= async  function(req: Request<{ id: string }>, res: Response):Promise<void> {
    const { id } = req.params;
    try {
        const deletedOrganization = await OrganizationModel.findByIdAndDelete(id);
        if (!deletedOrganization) {
             res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({ message: 'Organization deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting organization', error });
    }
}

// Update org
public updateOrganization=async  function(req: Request<{ id: string }>, res: Response):Promise<void> {


    const { _id, ...organization } = req.body;
    try {
        // Update the organization
        const result = await OrganizationModel.updateOne({ _id }, organization);

        // Check if the update was successful
        if (result.modifiedCount === 0) {
             res.status(404).json({ message: 'Organization not found or no changes made' });
        }

        res.status(200).json({ message: 'Organization updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating organization', error });
    }
}




}

