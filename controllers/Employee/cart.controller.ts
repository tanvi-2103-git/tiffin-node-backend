
import { Request, Response } from "express";
import { TiffinItem, TiffinItemModel } from "../../model/tiffinItemModel";
import { getUserFromToken } from "../admin.controller";
import { CartModel } from "../../model/cartModel";
import mongoose from "mongoose";

export class CartController {
   
    
    public addTiffinToCart = async (req: Request, res: Response) => {
        try {
            const user = await getUserFromToken(req);
            const customer_id = user?._id;
    
            const tiffinId = req.params.tiffinid;
            
            const { quantity } = req.body;
    
            const tiffin = await TiffinItemModel.findById(tiffinId).exec() as TiffinItem;
            
    
            if (tiffin.isActive==false || !tiffin) {
                res.status(404).json({ message: 'Tiffin item not found' });
            } else {
                const retailerId = tiffin.retailer_id;
                console.log("retailerId",retailerId);
                
                const price = tiffin.tiffin_price;
                console.log("retailerId",retailerId);

                
                let customerCart = await CartModel.findOne({ customer_id });
                console.log("customerCart.retailer_id",customerCart?.retailer_id);
                
                if (customerCart && (JSON.stringify(customerCart.retailer_id) != JSON.stringify(retailerId))) {
                    
                    res.status(400).json({
                        statuscode: 400,
                        message: "You can add tiffin from a single retailer only"
                    });
                } else {
                    let cart = await CartModel.findOne({ retailer_id: retailerId, customer_id });
                    
                    if (!cart) {
                        cart = new CartModel({
                            retailer_id: retailerId,
                            customer_id,
                            items: [{ tiffin_id: tiffinId, quantity, price }],
                           total_amount: price * quantity,
                        });
                    } else {
                        // console.log("inelse");
                        // const mapp = cart.items.map(item =>JSON.stringify(item.tiffin_id)== JSON.stringify(tiffinId))
                        // console.log("map", mapp);
                        
                        const itemIndex = cart.items.findIndex(item => JSON.stringify(item.tiffin_id) == JSON.stringify(tiffinId));
                        console.log("itemIndex",itemIndex);
                        
                        if (itemIndex > -1) {
                            cart.items[itemIndex].quantity += quantity;
                        } else {
                            cart.items.push({ tiffin_id: new mongoose.Schema.Types.ObjectId(tiffinId), quantity, price });
                        }
    
                        cart.total_amount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                    }
    
                    await cart.save();
                    res.status(200).json({ message: 'Tiffin added to cart', cart });
                }
            }
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error });
        }
    };
    
    
   

  public removeTiffinFromCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      const customer_id = user?._id;
      const tiffinId = new mongoose.Schema.Types.ObjectId(req.params.tiffinid);

      const tiffin = (await TiffinItemModel.findById(
        tiffinId
      ).exec()) as TiffinItem;
      if (tiffin.isActive == false || !tiffin) {
        res.status(404).json({ message: "Tiffin item not found" });
      }

      const retailerId = tiffin.retailer_id;
      let cart = await CartModel.findOne({
        retailer_id: retailerId,
        customer_id: customer_id,
      });

      if (cart) {
        const itemIndex = cart.items.findIndex(
          (item) => item.tiffin_id == tiffinId
        );

        if (itemIndex > -1) {
          cart.items.splice(itemIndex, 1);
          cart.total_amount = cart.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          );

          await cart.save();
          res.status(200).json({ message: "Tiffin removed from cart", cart });
        } else {
          res.status(404).json({ message: "Tiffin item not found in cart" });
        }
      } else {
        res
          .status(404)
          .json({ message: "Cart not found for this retailer and customer" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred", error });
    }
  };

  public removeCart = async (req: Request, res: Response) => {
    try {
      const cartId = req.params.cartid;
      const cart = await CartModel.findById(cartId).exec();
      if (cart) {
        const removeCart = await CartModel.deleteOne({ _id: cartId });
        res
          .status(200)
          .json({ statuscode: 200, message: "Cart Removed", data: removeCart });
      } else {
        res.status(404).json({ message: "Cart not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error ${error}` });
    }
  };

  public getCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user) {
        const userId = user._id;
        const cart = await CartModel.find({ customer_id: userId });
        if (cart) {
          res.status(200).json({ statuscode: 200, data: cart });
        } else {
          res.status(404).json({ statuscode: 404, message: "Cart not found" });
        }
      } else {
        res
          .status(404)
          .json({ statuscode: 404, message: "Customer not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ statuscode: 500, message: `Internal server error ${error}` });
    }
  };
}
