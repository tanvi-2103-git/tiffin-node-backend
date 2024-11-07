import { Request, Response } from "express";
import { TiffinItem, TiffinItemModel } from "../../model/tiffinItemModel";
import { getUserFromToken } from "../admin.controller";
import { CartModel } from "../../model/cartModel";

export class CartController {
   
    
    public addTiffinToCart = async (req: Request, res: Response) => {
        try {
            const user = await getUserFromToken(req);
            const customer_id = user?._id;
    
            const tiffinId = req.params.tiffinid;
            const { quantity } = req.body;
    
            const tiffin = await TiffinItemModel.findById(tiffinId).exec() as TiffinItem;
    
            if (!tiffin) {
                res.status(404).json({ message: 'Tiffin item not found' });
            } else {
                const retailerId = tiffin.retailer_id;
                const price = tiffin.tiffin_price;
    
                let customerCart = await CartModel.findOne({ customer_id });
    
                if (customerCart && customerCart.retailer_id !== retailerId) {
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
                        const itemIndex = cart.items.findIndex(item => item.tiffin_id === tiffinId);
    
                        if (itemIndex > -1) {
                            cart.items[itemIndex].quantity += quantity;
                        } else {
                            cart.items.push({ tiffin_id: tiffinId, quantity, price });
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
    
    public removeTiffinFromCart = async (req: Request, res: Response)=> {
        try {
            const user = await getUserFromToken(req);
            const customer_id = user?._id;
            const tiffinId = req.params.tiffinid;
    
            const tiffin = await TiffinItemModel.findById(tiffinId).exec() as TiffinItem;
            if (!tiffin) {
                res.status(404).json({ message: 'Tiffin item not found' });
            }
    
            const retailerId = tiffin.retailer_id;
            let cart = await CartModel.findOne({ retailer_id: retailerId, customer_id: customer_id });
    
            if (cart) {
                const itemIndex = cart.items.findIndex(item => item.tiffin_id == tiffinId);
            
            if (itemIndex > -1) {
                cart.items.splice(itemIndex, 1);
                cart.total_amount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    
                await cart.save();
                res.status(200).json({ message: 'Tiffin removed from cart', cart });
            } else {
                res.status(404).json({ message: 'Tiffin item not found in cart' });
            }
                
            }else{
                 res.status(404).json({ message: 'Cart not found for this retailer and customer' });

            }
    
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred', error });
        }
    };
    
    public removeCart = async (req: Request, res: Response) => {
        try{
            const cartId = req.params.cartid;
            const cart = await CartModel.findById(cartId).exec();
            if (cart) {
                const removeCart = await CartModel.deleteOne({_id:cartId});
                res.status(200).json({statuscode:200, message: 'Cart Removed', data:removeCart });
                
            }else{
            res.status(404).json({ message: 'Cart not found' });
            }
        }catch(error){
            res.status(500).json({statuscode:500, message: `Internal server error ${error}`});

        }
    }
    

    

}
