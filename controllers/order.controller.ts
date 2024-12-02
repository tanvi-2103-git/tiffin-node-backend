import { Request, Response } from "express";
import { CartController } from "./Employee/cart.controller";
import { CartModel } from "../model/cartModel";
import { OrderModel } from "../model/orderModel";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responsesUtils";
import { TiffinItemModel } from "../model/tiffinItemModel";

const cartController = new CartController();
export class OrderController {
  public placeOrder = async (req: Request, res: Response) => {
    try {
      const cartId = req.params.cartid;
      const { payment_mode } = req.body;
      let payment_status;
      let delivery_status;
      if (payment_mode == "CoD" || payment_mode == "UPI") {
        if (payment_mode == "CoD") {
          payment_status = "unpaid";
          delivery_status = "pending";
        } else if (payment_mode == "UPI") {
          payment_status = "paid";
          delivery_status = "pending";
        }
        const cart = await CartModel.findById(cartId);
        if (cart) {
          const tiffinQuantityUpdated = await Promise.all(
            cart.items.map(async (item) => {
              return TiffinItemModel.updateOne(
                { _id: item.tiffin_id },
                { $inc: { tiffin_available_quantity: -item.quantity } } 
              );
            })
          );
          

          const order = new OrderModel({
            cart,
            payment_mode,
            payment_status,
            delivery_status,
          });
          await order.save();
          
            const cart_id = cartId;

            const destroyCart = await CartModel.findByIdAndDelete(cart_id);
            
          
          sendSuccessResponse(res, 200, true, "Order placed", order);
        } else {
          sendSuccessResponse(
            res,
            200,
            true,
            "Please add cart or add items to cart"
          );
        }
      } else  sendSuccessResponse(
        res,
        200,
        true, "Add valid payment mode")
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };

  public confirmPayment = async (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderid;
      const order = await OrderModel.findById(orderId).exec();
      if(order?.delivery_status=='cancelled')  sendSuccessResponse(
        res,
        200,
        true, 'order is already cancelled');
     else{ if (order) {
        if (order.payment_mode == "CoD") {
          const updateOrder = await OrderModel.findByIdAndUpdate(orderId, {
            payment_status: "paid",
            delivery_status: "delivered",
          });
          // if (updateOrder) {
          //   const cartId = order.cart._id;

          //   const destroyCart = await CartModel.findByIdAndDelete(cartId);
          //   sendSuccessResponse(res, 200, true, "Payment done");
          // }
        } else {
          //in case of upi it will change after adding razorpay or neccesary payment service
          const updateOrder = await OrderModel.findByIdAndUpdate(orderId, {
            payment_status: "paid",
            delivery_status: "pending",
          });
          if (updateOrder) {
            sendSuccessResponse(res, 200, true, "Payment done");
          }
        }
      } else  sendSuccessResponse(
        res,
        200,
        true, "Order not found")}
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };

  public getOrderById = async (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderid;
      const order = await OrderModel.findById(orderId).exec();
      if (order) {
        sendSuccessResponse(res, 200, true, `order of id: ${orderId}`, order);
      } else {
        sendSuccessResponse(res, 200, false, "Order not found");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `internal server error ${error}`);
    }
  };
}