
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';


const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const validateTiffinItem = (req: Request, res: Response, next: NextFunction): void => {
    try{
        const schema = Joi.object({
            //
            // tiffin_image_url: Joi.string().uri().optional(), 
            tiffin_name: Joi.string().required(),
            tiffin_available_quantity: Joi.number().integer().min(0).required(), 
            tiffin_description: Joi.string().min(5).max(255).required(), 
            retailer_id: Joi.string().regex(objectIdRegex).required(), 
            tiffin_type: Joi.string().valid('veg', 'non-veg').required(), 
            tiffin_price: Joi.number().positive().required(), 
            tiffin_rating: Joi.number().min(0).max(5).optional(), 
            tiffin_isavailable: Joi.boolean().required(), 
            // tiffin_created_at: Joi.date().required(), 
            // tiffin_updated_at: Joi.date().required(), 
        }).unknown();
    
        const { error } = schema.validate(req.body);
        
        if (error) {
            console.log(error);
            res.status(400).json({ error: error.details[0].message });
        } else {
            next();
        }
    }catch(error){
        console.error('Unexpected error during validation:', error);
        res.status(500).json({ error: 'Internal server error' }); 
    }
   
};

module.exports = { validateTiffinItem };
