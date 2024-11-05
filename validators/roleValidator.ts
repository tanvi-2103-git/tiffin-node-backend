
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

//schema for permission validation
const permissionSchema = Joi.object({
    request: Joi.string().required(),
    url: Joi.string().required(),
});

//validation for role
export const validateRole = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
        role_name: Joi.string().required(),
        role_permission: Joi.array().items(Joi.string()).required(), 
        role_specific_details: Joi.array().items(Joi.object()).required(), 
    }).unknown();

    
    const { error } = schema.validate(req.body);
    
    if (error) {
        console.log(error);
        res.status(400).json({ error: error.details[0].message });
    } else {
        next(); 
    }
};

module.exports = { validateRole };
