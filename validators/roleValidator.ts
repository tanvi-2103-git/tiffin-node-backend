
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

//schema for permission validation
const permissionSchema = Joi.object({
    request: Joi.string().required(),
    url: Joi.string().required(),
});

//validation for role
export const validateRole = (req: Request, res: Response, next: NextFunction): void => {
    try{
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
    }catch(error){
        console.error('Unexpected error during validation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
};

module.exports = { validateRole };
