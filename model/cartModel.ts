import mongoose from 'mongoose';

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
    isActice: boolean;     

}

const CartSchema = new mongoose.Schema({
    retailer_id: { type: String, unique: true, required: true }, //add ref
    user_id: { type: String,unique: true, ref: 'User', required: true },    
    items: [
        {
            tiffin_id: { type: String, ref: 'Tiffin', required: true }, // Reference to the tiffin added to the cart
            quantity: { type: Number, required: true, min: 1 },         
            price: { type: Number, required: true },
        }
    ],

    total_amount: { type: Number, default: 0 },                      
    created_at: { type: Date, default: Date.now },
    isActice: { type: Boolean, required: true }                   
});

export const CartModel = mongoose.model<Cart>('Cart', CartSchema);
