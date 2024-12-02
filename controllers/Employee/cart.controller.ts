import { Request, Response } from "express";
import { TiffinItem, TiffinItemModel } from "../../model/tiffinItemModel";
import { getUserFromToken } from "../admin.controller";
import { CartModel } from "../../model/cartModel";
import mongoose from "mongoose";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responsesUtils";
import { log } from "console";

export class CartController {
  public addTiffinToCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      const customer_id = user?._id;

      const tiffinId = req.params.tiffinid;

      const { quantity } = req.body;

      const tiffin = (await TiffinItemModel.findById(
        tiffinId
      ).exec()) as TiffinItem;

      if (tiffin.isActive == false || !tiffin) {
        sendSuccessResponse(res, 200, true, "Tiffin item not found");
      } else {
        if (quantity > tiffin.tiffin_available_quantity)
          throw `only ${tiffin.tiffin_available_quantity} tiffins are available`;
        const retailerId = tiffin.retailer_id;
        const tiffin_name = tiffin.tiffin_name;
        const tiffin_image_url = tiffin.tiffin_image_url;
        const price = tiffin.tiffin_price;
        const tiffin_available_quantity = tiffin.tiffin_available_quantity;
        const tiffin_description = tiffin.tiffin_description;
        console.log("retailerId", retailerId);
        console.log("tiffin_name", tiffin_name);
        console.log("tiffin_image_url", tiffin_image_url);
        console.log("price", price);
        console.log("tiffin_description: ", tiffin_description);

        let customerCart = await CartModel.findOne({ customer_id });

        if (
          customerCart &&
          JSON.stringify(customerCart.retailer_id) != JSON.stringify(retailerId)
        ) {
          sendSuccessResponse(
            res,
            400,
            false,
            "You can add tiffin from a single retailer only"
          );
        } else {
          console.log("inside else tiffin_name", tiffin_name);
          console.log("inside else tiffin_name", tiffin_image_url);
          let cart = await CartModel.findOne({
            retailer_id: retailerId,
            customer_id,
          });

          if (!cart) {
            console.log("inside log tiffin_name", tiffin_name);
            console.log("inside log tiffin_name", tiffin_image_url);
            console.log("tiffin_description", tiffin_description);

            cart = new CartModel({
              retailer_id: retailerId,
              customer_id,
              items: [
                {
                  tiffin_id: tiffinId,
                  tiffin_image_url,
                  tiffin_name,
                  quantity,
                  tiffin_available_quantity,
                  price,
                  tiffin_description,
                },
              ],
              total_amount: price * quantity,
            });
          } else {
            const itemIndex = cart.items.findIndex(
              (item) =>
                JSON.stringify(item.tiffin_id) == JSON.stringify(tiffinId)
            );

            if (itemIndex > -1) {
              cart.items[itemIndex].quantity += quantity;
              if (
                cart.items[itemIndex].quantity >
                tiffin.tiffin_available_quantity
              )
                throw `only ${tiffin.tiffin_available_quantity} tiffins are available`;
            } else {
              cart.items.push({
                tiffin_id: new mongoose.Types.ObjectId(tiffinId),
                quantity,
                price,
                tiffin_name,
                tiffin_image_url,
                tiffin_description,
              });
            }

            cart.total_amount = cart.items.reduce(
              (sum, item) => sum + item.quantity * item.price,
              0
            );
          }

          await cart.save();
          sendSuccessResponse(res, 200, true, "Tiffin added to cart", cart);
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  updateQuantity = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      const customer_id = user?._id;
      const tiffinId = req.params.tiffinid;
      const quantity = req.body.quantity;
      if (!quantity) throw "quantity please add quantity";
      const status = req.body.status;
      let cart = await CartModel.findOne({ customer_id: customer_id });
      const tiffin = await TiffinItemModel.findById(tiffinId);

      if (cart && tiffin) {
        const price = tiffin?.tiffin_price;
        const tiffin_name = tiffin?.tiffin_name;
        const tiffin_image_url = tiffin?.tiffin_image_url;
        const tiffin_description = tiffin?.tiffin_description;
        const itemIndex = cart.items.findIndex(
          (item) => JSON.stringify(item.tiffin_id) == JSON.stringify(tiffinId)
        );

        if (itemIndex >= 0) {
          cart.items[itemIndex].quantity = quantity;

          if (cart.items[itemIndex].quantity == 0) {
            cart.items.splice(itemIndex, 1);
          }

          if (cart.items[itemIndex].quantity > tiffin.tiffin_available_quantity)
            throw `only ${tiffin.tiffin_available_quantity} tiffins are available`;
        } else {
          cart.items.push({
            tiffin_id: new mongoose.Types.ObjectId(tiffinId),
            quantity,
            price,
            tiffin_name,
            tiffin_image_url,
            tiffin_description,
          });
        }

        cart.total_amount = cart.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
        console.log(cart);

        await cart.save();
        sendSuccessResponse(res, 200, true, "Tiffin added to cart", cart);
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public removeTiffinFromCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      const customer_id = user?._id;
      const tiffinId = req.params.tiffinid;

      const tiffin = (await TiffinItemModel.findById(
        tiffinId
      ).exec()) as TiffinItem;
      if (tiffin.isActive == false || !tiffin) {
        sendSuccessResponse(res, 200, true, "Tiffin item not found");
      } else {
        const retailerId = tiffin.retailer_id;
        let cart = await CartModel.findOne({
          retailer_id: retailerId,
          customer_id: customer_id,
        });

        if (cart) {
          const itemIndex = cart.items.findIndex(
            (item) => JSON.stringify(item.tiffin_id) == JSON.stringify(tiffinId)
          );

          if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
            cart.total_amount = cart.items.reduce(
              (sum, item) => sum + item.quantity * item.price,
              0
            );

            await cart.save();
            if (cart.items.length === 0) {
              const remove = await CartModel.findByIdAndDelete(cart._id);
            }
            sendSuccessResponse(
              res,
              200,
              true,
              "Tiffin removed from cart",
              cart
            );
          } else {
            sendSuccessResponse(
              res,
              200,
              true,
              "Tiffin item not found in cart"
            );
          }
        } else {
          sendSuccessResponse(
            res,
            200,
            true,
            "Cart not found for this retailer and customer"
          );
        }
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public removeCart = async (req: Request, res: Response) => {
    try {
      const cartId = req.params.cartid;
      const cart = await CartModel.findById(cartId).exec();
      if (cart) {
        const removeCart = await CartModel.deleteOne({ _id: cartId });
        sendSuccessResponse(res, 200, true, "Cart Removed", removeCart);
      } else {
        sendSuccessResponse(res, 200, true, "Cart not found");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public getCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user) {
        const userId = user._id;

        const cart = await CartModel.find({ customer_id: userId });
        if (cart.length > 0) {
          sendSuccessResponse(res, 200, true, "Cart loaded successfully", cart);
        } else {
          sendSuccessResponse(res, 200, true, "Cart not found");
        }
      } else {
        sendSuccessResponse(res, 200, true, "Customer not found");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };
}
