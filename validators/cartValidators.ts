
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';




export const validateCart = (req: Request, res: Response, next: NextFunction): void => {
    const itemSchema = Joi.object({
        quantity : Joi.number().integer().min(0).required(), 
        tiffin_price: Joi.number().positive().optional(), 
               
    });

    const schema = Joi.object({
        items : Joi.array().items(itemSchema).optional(),
        total_amount : Joi.number().positive().optional(),
        created_at: Joi.date().optional(),
        isActive: Joi.boolean().optional(),   
    }).unknown();

    const { error } = schema.validate(req.body);
    
    if (error) {
        console.log(error);
        res.status(400).json({ error: error.details[0].message });
    } else {
        next();
    }
};

module.exports = { validateCart };