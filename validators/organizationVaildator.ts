
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateOrganization = (req: Request, res: Response, next: NextFunction): void => {
   
    const locationSchema = Joi.object({
        loc: Joi.string().required(),
        address: Joi.string().min(5).max(50).required(),
        // loc_contact: Joi.number().integer().required(),
        loc_contact: Joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).required().messages({
            'number.min': 'Mobile number should be 10 digit.',
            'number.max': 'Mobile number should be 10 digit'
        }),
        loc_email: Joi.string().email().required(),
        admin_id: Joi.string().required(),
    });

    // organization schema
    const schema = Joi.object({
        org_name: Joi.string().min(3).max(50).required(),
        org_location: Joi.array().items(locationSchema).required(), // Array of location objects
        org_created_at: Joi.date().optional(),
        org_updated_at: Joi.date().optional(),
        isActive: Joi.boolean().required(), 
    }).unknown(); 

    const { error } = schema.validate(req.body);
    
    if (error) {
        console.log(error);
        res.status(400).json({ error: error.details[0].message });
    } else {
        next();
    }
};

module.exports = { validateOrganization };
