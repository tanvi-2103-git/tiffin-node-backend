import { Request, Response } from "express";
import { OrganizationModel, Organization } from "../model/organizationModel";
import { UserModel, User } from "../model/userModel";
import { TiffinItem, TiffinItemModel } from "../model/tiffinItemModel";
import { ObjectId } from "mongodb";

//Menu crud

//Add menu
export class RetailerController{

    public addTiffinItem = async function(req: Request, res: Response) {
        try{const tiffinItemData: TiffinItem  = req.body;
        const newTiffinItem = await TiffinItemModel.create(tiffinItemData);
        res.status(201).json(newTiffinItem);}
        catch(error){
            res.status(500).json({ message: "Error creating Tiffin Item", error });
        }
    }

    //get all menu items

    public getAllTiffinItems = async function(req: Request, res: Response){
        try{
            const tiffinItems = await TiffinItemModel.find();
            res.status(200).json(tiffinItems);
        }catch(error){
            res.status(500).json({ message: 'Error fetching Tiffin Items', error });

        }
    }

    // public getTiffinItemById = async function (req: Request, res: Response):Promise<void>{
    //     console.log(req.params.id);
        
    //     const  _id  =new ObjectId( req.params.id);
    //     try{
    //         const TiffinItem = await TiffinItemModel.findOne(_id);
    //         // console.log(TiffinItem);
            
    //         if(!TiffinItem){
    //             res.status(404).json( { message: 'Tiffin Item not found' });
    //             //error handle: server crashes if i input a wrong value purposely
    //         }
    //         res.status(200).json(TiffinItem);
    //     }catch(error){
    //         res.status(500).json({ message: 'Error fetching Tiffin Item', error });
    //     }
    // }

    public getTiffinItemById = async (req: Request, res: Response):Promise<void> => {
        console.log(req.params.id);
        
        const  _id  =new ObjectId( req.params.id);
        try{
            const TiffinItem = await TiffinItemModel.findOne(_id);
            // console.log(TiffinItem);
            
            if(!TiffinItem){
                res.status(404).json( { message: 'Tiffin Item not found' });
                //error handle: server crashes if i input a wrong value purposely
                return;
            }
            res.status(200).json(TiffinItem);
        }catch(error){
            res.status(500).json({ message: 'Error fetching Tiffin Item', error });
        }
    }
}


