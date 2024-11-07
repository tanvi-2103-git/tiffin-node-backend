import mongoose, { ObjectId } from 'mongoose';

export interface CartItem {
    tiffin_id: string;  //add ref            
    quantity: number;                
    price: number;                   
}

export interface Cart extends Document {
    retailer_id: string;        //add ref         
    user_id: string;        //add ref 
    items: CartItem[];               
    total_amount: number;                                   
    created_at: Date;
    isActive: boolean;     
}

const CartSchema = new mongoose.Schema({
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true }, 
    customer_id: { type: mongoose.Schema.Types.ObjectId , ref: 'User', required: true },    
    items: [
        {
            tiffin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tiffin', required: true }, 
            quantity: { type: Number, required: true, min: 1 },         
            price: { type: Number, required: true },
        }
    ],

    total_amount: { type: Number, default: 0 },                      
    created_at: { type: Date, default: Date.now },
    isActive: { type: Boolean, required: true, default: true }                   
});

export const CartModel = mongoose.model<Cart>('Cart', CartSchema);
