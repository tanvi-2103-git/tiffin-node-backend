import { Request, Response } from "express";
import { UserModel } from "../../model/userModel";
import { getUserFromToken } from "../admin.controller";
import { TiffinItemModel } from "../../model/tiffinItemModel";


export class EmployeeController {

   
    public getAllTrendyRetailers = async  (req: Request, res: Response)=> {
        try {
            const user = await getUserFromToken(req);
            console.log(user, "user");
    
            if(user?.isActive==false || !user || !user.role_specific_details || !user.role_specific_details.organization_id ){
                res.status(401).json({
                    statuscode: 401,
                    message: "Unauthorized or invalid user details.",
                });
            } else {
                    const organizationId = user.role_specific_details.organization_id;
                    const page = parseInt(req.query.page as string) || 1;  
                    const limit = parseInt(req.query.limit as string) || 10;  

                    if(page < 1 || limit < 1){
                        res.status(400).json({ message: "Page and limit must be positive integers" });
                        
                    }else{
                        const skip = (page - 1) * limit;  

                        const TrendyRetailers = await UserModel.find({
                            role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
                            "role_specific_details.approval": {
                                $elemMatch: {
                                    organization_id: organizationId,
                                    istrendy: true
                                }
                            }
                        }).skip(skip).limit(limit).exec();

                        const totalItems = await UserModel.countDocuments({
                            role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
                            "role_specific_details.approval": {
                                $elemMatch: {
                                    organization_id: organizationId,
                                    istrendy: true
                                }
                            }
                        });

                    const totalPages = Math.ceil(totalItems / limit);
        
                    console.log(`Organization ID: ${organizationId}`);
                    res.status(200).json({ statuscode: 200, 
                                    data: TrendyRetailers,
                                    pagination: {
                                        currentPage: page,
                                        totalPages: totalPages,
                                        totalItems: totalItems,
                                    },
                                });
                    }
                }

               
        } catch (error) {
            console.error("Error fetching trendy retailers:", error);
            res.status(500).json({ statuscode: 500, message: "An error occurred while processing your request." });
        }
    };
    
    public getAllRetailersofOrg = async  (req: Request, res: Response) =>{
        try {
            const user = await getUserFromToken(req);
            console.log(user, "user");
    
            if (user?.isActive==false || !user || !user.role_specific_details || !user.role_specific_details.organization_id ) {
                res.status(401).json({
                    statuscode: 401,
                    message: "Unauthorized or invalid user details.",
                });
            } else {
                const organizationId = user.role_specific_details.organization_id;

                let page = parseInt(req.query.page as string) || 1;  
                let limit = parseInt(req.query.limit as string) || 10;

                if(page < 1 || limit < 1){
                    res.status(400).json({ message: "Page and limit must be positive integers" });
                    
                }else{
                    const skip = (page - 1) * limit;

                    const Retailers = await UserModel.find({
                        role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
                        "role_specific_details.approval": {
                            $elemMatch: {
                                organization_id: organizationId
                            }
                        }
                    }).skip(skip).limit(limit).exec();

                    const totalItems = await UserModel.countDocuments({
                        role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
                        "role_specific_details.approval": {
                            $elemMatch: {
                                organization_id: organizationId
                            }
                        }
                    });
    
                    const totalPages = Math.ceil(totalItems / limit);

                console.log(`Organization ID: ${organizationId}`);
                    res.status(200).json({ statuscode: 200, 
                        data: Retailers,
                        pagination: {
                            currentPage: page,
                            totalPages: totalPages,
                            totalItems: totalItems,
                        },
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching trendy retailers:", error);
            res.status(500).json({ statuscode: 500, message: "An error occurred while processing your request." });
        }
    };


   
    public getAllTiffinofOrg = async  (req: Request, res: Response) =>{
        try {
            const user = await getUserFromToken(req);
            console.log(user, "user");
    
            if ( user?.isActive==false || !user || !user.role_specific_details || !user.role_specific_details.organization_id) {
                res.status(401).json({
                    statuscode: 401,
                    message: "Unauthorized or invalid user details.",
                });
            } else {
                const organizationId = user.role_specific_details.organization_id;
    
                
                const Retailers = await UserModel.find({
                    role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
                    "role_specific_details.approval": {
                        $elemMatch: {
                            organization_id: organizationId
                        }
                    }
                }).exec();
    
                if (Retailers.length === 0) {
                    res.status(404).json({ statuscode: 404, message: "No retailers found for the given organization." });
                } else {
                    const retailerIds = Retailers.map(retailer => retailer._id);
    
                    const Tiffins = await TiffinItemModel.find({
                        retailer_id: { $in: retailerIds }
                    }).exec();
    
                    console.log(`Organization ID: ${organizationId}`);
                    console.log(`Found Tiffin items: ${Tiffins.length}`);
    
                    res.status(200).json({ statuscode: 200, data: Tiffins });
                }
            }
        } catch (error) {
            console.error("Error fetching tiffin items:", error);
            res.status(500).json({ statuscode: 500, message: "An error occurred while processing your request." });
        }
    };
    

    
    public getAllTiffinsByRetailer = async  (req: Request, res: Response) =>{
        try {
            const retailerId = req.params.retailerid;
            const user = await getUserFromToken(req);
            console.log(user, "user");
    
            if ( user?.isActive==false || !user || !user.role_specific_details || !user.role_specific_details.organization_id) {
                res.status(401).json({
                    statuscode: 401,
                    message: "Unauthorized or invalid user details.",
                });
            } else {
               
        
                const organizationId = user.role_specific_details.organization_id;
                const page = parseInt(req.query.page as string) || 1; 
                const limit = parseInt(req.query.limit as string) || 10; 
                const skip = (page - 1) * limit; 

                if(page < 1 || limit < 1){
                    res.status(400).json({ message: "Page and limit must be positive integers" });
                    
                }else{
                    const Tiffins = await TiffinItemModel.find({
                        retailer_id: retailerId
                    }).skip(skip).limit(limit).exec();
    
                    const totalItems = await TiffinItemModel.countDocuments({
                        retailer_id: retailerId
                    });
    
                    const totalPages = Math.ceil(totalItems / limit);

                        res.status(200).json({ statuscode: 200, 
                            data: Tiffins,
                            pagination: {
                                currentPage: page,
                                totalPages: totalPages,
                                totalItems: totalItems,
                            },
                        });
                }
    
            }
        } catch (error) {
            console.error("Error fetching tiffin items:", error);
            res.status(500).json({ statuscode: 500, message: "An error occurred while processing your request." });
        }
    };



    public getTiffinofOrgById = async  (req: Request, res: Response)=> {
        try {
            const tifinId = req.params.tifinid
            const user = await getUserFromToken(req);
            console.log(user, "user");
    
            if ( user?.isActive==false || !user || !user.role_specific_details || !user.role_specific_details.organization_id) {
                res.status(401).json({
                    statuscode: 401,
                    message: "Unauthorized or invalid user details.",
                });
            } else {
                const organizationId = user.role_specific_details.organization_id;
    
                const Retailers = await UserModel.find({

                    role_id: "6723475f74b32cfe39e5d0a2", // retailer role ID
                    "role_specific_details.approval": {
                        $elemMatch: {
                            organization_id: organizationId
                        }
                    }
                }).exec();
    
                if (Retailers.length === 0) {
                    res.status(404).json({ statuscode: 404, message: "No retailers found for the given organization." });
                } else {
                    const retailerIds = Retailers.map(retailer => retailer._id);
    
                    const Tiffin = await TiffinItemModel.find({
                        id:tifinId,
                        retailer_id: { $in: retailerIds }
                    }).exec();
    
                    console.log(`Organization ID: ${organizationId}`);
                  
    
                    res.status(200).json({ statuscode: 200, data: Tiffin });
                }
            }
        } catch (error) {
            console.error("Error fetching tiffin items:", error);
            res.status(500).json({ statuscode: 500, message: "An error occurred while processing your request." });
        }
    };
    

}
