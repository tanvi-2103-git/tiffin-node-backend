import mongoose from 'mongoose';

export interface Order extends Document {
    cart_id: string; //add ref
    payment_mode: string;
    payment_status: string;
    payment_date: Date;
    delivery_status: string;
    order_created_at: Date
    order_updated_at:Date,
    isActive: Boolean,
    //add more if kuch yaad aya
}

const OrderSchema = new mongoose.Schema({
    cart_id: { type: String, unique: true, required: true }, // add ref
    payment_mode:{type: String, enum: ['CoD','UPI'],required: true },
    payment_date: { type: Date, required: true },
    delivery_status: { type: String, enum: ['pending','commpleted', 'rejected'],required: true},
    org_created_at: { type: Date, required: true },
    org_updated_at: { type: Date, required: true },
    isActive: { type: Boolean, required: true },
    
})

export const OrderModel = mongoose.model<Order>('Order', OrderSchema);