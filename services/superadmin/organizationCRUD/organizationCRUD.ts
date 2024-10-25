import {  Organization, OrganizationModel } from "../../../model/organizationModel";

async function getAllOrganizations() {
  try {
    const result = await OrganizationModel.find({}).exec();
    console.log("result", result);
    return result;
  } catch (error) {
    console.error("Error adding booking:", error);
    throw error;
  }
}

async function addOrganization(organizationDetails: Organization){
    try{
        const newOrganization = new OrganizationModel(organizationDetails);
        const result = await newOrganization.save();
        console.log("Organization added:", result);
        return result;


    }catch{


    }
}

