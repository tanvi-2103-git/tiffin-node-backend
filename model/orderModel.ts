import { ref, required } from "joi";
import mongoose from "mongoose";
import { Cart, CartSchema } from "./cartModel";

export interface Order extends Document {
  // cart_id: mongoose.Schema.Types.ObjectId;
  cart:Cart
  payment_mode: string;
  payment_status: string;
  payment_date: Date;

  delivery_status: string;
  order_created_at: Date;
  order_updated_at: Date;
  isActive: Boolean;
  //add more if kuch yaad aya
}

const OrderSchema = new mongoose.Schema({
  // cart_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Cart",
  //   unique: true,
  //   required: true,
  // }
  cart:{type:CartSchema,required:true},
  payment_mode: { type: String, enum: ["CoD", "UPI"], required: true },
  payment_date: { type: Date},
  payment_status: {
    type: String,
    enum: ["paid", "unpaid"],
    required: true,
    default: "unpaid",
  },
  delivery_status: {
    type: String,
    enum: ["pending", "delivered", "cancelled"],
    required: true,
  },
  created_at: { type: Date, required: true ,default:Date.now},
  updated_at: { type: Date, required: true ,default:Date.now},
  isActive: { type: Boolean, required: true, default: true },
});

export const OrderModel = mongoose.model<Order>("Order", OrderSchema);
