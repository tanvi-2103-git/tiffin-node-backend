import { Request, Response } from "express";
import { TiffinItem, TiffinItemModel } from "../model/tiffinItemModel";
import { ObjectId } from "mongodb";
import { UserModel } from "../model/userModel";

export class TiffinItemController {
  public addTiffinItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const tiffinItemData: TiffinItem = req.body;
      const newTiffinItem = await TiffinItemModel.create(tiffinItemData);
      res.status(201).json({ message: "Added Tiffin Item", newTiffinItem });
    } catch (error) {
      res.status(500).json({ message: "Error creating Tiffin Item", error });
    }
  };

  // public getAllTiffinItems = async (
  //   req: Request,
  //   res: Response
  // ): Promise<void> => {
  //   try {
  //     const tiffinItems = await TiffinItemModel.find();
  //     res.status(200).json(tiffinItems);
  //   } catch (error) {
  //     res.status(500).json({ message: "Error fetching Tiffin Items", error });
  //   }
  // };



public getAllTiffinItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
   
    const page = parseInt(req.query.page as string) || 1; 
    const limit = parseInt(req.query.limit as string) || 10; 

    if(page < 1 || limit < 1){
      res.status(400).json({ message: "Page and limit must be positive integers" });
      return;
      
    }
   
    const skip = (page - 1) * limit;

    
    const tiffinItems = await TiffinItemModel.find()
      .skip(skip) 
      .limit(limit); 

    
    const totalItems = await TiffinItemModel.countDocuments();
    
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: tiffinItems,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching Tiffin Items", error });
  }
};

  public getTiffinItemById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    console.log(req.params.tiffinid);

    const _id = new ObjectId(req.params.tiffinid);
    try {
      const TiffinItem = await TiffinItemModel.findOne(_id);
      // console.log(TiffinItem);

      if (!TiffinItem) {
        res.status(404).json({ message: "Tiffin Item not found" });
        //error handle: server crashes if i input a wrong value purposely
        return;
      }
      res.status(200).json(TiffinItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching Tiffin Item", error });
    }
  };




  public deleteTiffinItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { tiffinid } = req.params;
    try {
      const deleteTiffin = await TiffinItemModel.findByIdAndDelete(tiffinid);
      if (!deleteTiffin) {
        res.status(404).json({ message: "Tiffin Item not found" });
      }
      res.status(200).json({ message: "Tiffin Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting Tiffin Item", error });
    }
  };

  public updateTiffinItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { tiffinid } = req.params;
      const tiffinItemData: TiffinItem = req.body;
      const updatedTiffinItem = await TiffinItemModel.findByIdAndUpdate(
        tiffinid,
        tiffinItemData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedTiffinItem) {
        res.status(404).json({ message: "Tiffin Item not found" });
        return;
      }

      res.status(200).json({ message: "Tiffin Item updated successfully" , updatedTiffinItem});
    } catch (error) {
      res.status(500).json({ message: "Error updating Tiffin Item", error });
    }
  };

  public updateTiffinQuantityAvailability = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const tiffin_id = req.params.tiffinid;
      console.log("tiffin_id",tiffin_id);
      
      const {tiffin_available_quantity,tiffin_isavailable} = req.body;
      const updatedTiffinItem = await TiffinItemModel.findByIdAndUpdate(
        {_id:tiffin_id},
        {tiffin_available_quantity:tiffin_available_quantity,tiffin_isavailable:tiffin_isavailable},
        {
          new: true,
          runValidators: true,
        }
      );

      // if (!updatedTiffinItem) {
      //   res.status(404).json({ message: "Tiffin Item not found" });
      //   return;
      // }
      console.log(updatedTiffinItem);
      
      res.status(200).json({ message: "Tiffin Item updated successfully" , updatedTiffinItem});
    } catch (error) {
      res.status(500).json({ message: "Error updating Tiffin Item", error });
    }
  };
}


// export class TiffinItemController{
//     // public addTiffinItem = async (req: Request, res: Response):Promise<void> => {
//     //     try{const tiffinItemData: TiffinItem  = req.body;
//     //     const newTiffinItem = await TiffinItemModel.create(tiffinItemData);
//     //     res.status(201).json(newTiffinItem);}
//     //     catch(error){
//     //         res.status(500).json({ message: "Error creating Tiffin Item", error });
//     //     }
//     // }

//     public addTiffinItem = async (req: Request, res: Response):Promise<void> => {
//         try{const tiffinItemData: TiffinItem  = req.body;
//         console.log(tiffinItemData.retailer_id);
//         const retailerId = tiffinItemData.retailer_id;

//         // const TiffinItem = await TiffinItemModel.findOne(_id);
//         const id = await UserModel.findOne({_id:retailerId});
//         console.log(id);
        
        
//         const newTiffinItem = await TiffinItemModel.create(tiffinItemData);
//         res.status(201).json(newTiffinItem);}
//         catch(error){
//             res.status(500).json({ message: "Error creating Tiffin Item", error });
//         }
//     }


//     public getAllTiffinItems = async (req: Request, res: Response):Promise<void> =>{
//         try{
//             const tiffinItems = await TiffinItemModel.find();
//             res.status(200).json(tiffinItems);
//         }catch(error){
//             res.status(500).json({ message: 'Error fetching Tiffin Items', error });

//         }
//     }

//     public getTiffinItemById = async (req: Request, res: Response):Promise<void> => {
//         console.log(req.params.id);
        
//         const  _id  =new ObjectId( req.params.id);
//         try{
//             const TiffinItem = await TiffinItemModel.findOne(_id);
//             // console.log(TiffinItem);
            
//             if(!TiffinItem){
//                 res.status(404).json( { message: 'Tiffin Item not found' });
//                 //error handle: server crashes if i input a wrong value purposely
//                 return;
//             }
//             res.status(200).json(TiffinItem);
//         }catch(error){
//             res.status(500).json({ message: 'Error fetching Tiffin Item', error });
//         }
//     }

//     public deleteTiffinItem = async (req: Request, res: Response):Promise<void> => {
//         const { id } = req.params;
//         try{
//             const deleteTiffin = await TiffinItemModel.findByIdAndDelete(id);
//             if(!deleteTiffin){
//                 res.status(404).json({ message: 'Tiffin Item not found' });
//             }
//             res.status(200).json({ message: 'Tiffin Item deleted successfully' });
//         }catch(error){
//             res.status(500).json({ message: 'Error deleting Tiffin Item', error });
//         }
//     }

// }