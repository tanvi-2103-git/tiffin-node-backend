

import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Custom function to validate ID based on type
const validateIdByType = (idType: string) => {
    switch (idType) {
        case 'tiffinid':
            return Joi.string().regex(/^[a-fA-F0-9]{24}$/).required();  
        case 'retailerid':
            return Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(); 
        case 'retailer_id':
                return Joi.string().regex(/^[a-fA-F0-9]{24}$/).required();     
        case 'id':
                return Joi.string().regex(/^[a-fA-F0-9]{24}$/).required();    
        default:
            return Joi.string().regex(/^[a-fA-F0-9]{24}$/).required();  
    }
};

export const validateGetRequest = (options: { isPagination?: boolean, isIdRequired?: boolean, idType?: string }) => {
    return (req: Request, res: Response, next: NextFunction): void => {

        const schema = Joi.object({
            params: Joi.object({
                [options.idType || 'id']: options.isIdRequired
                    ? validateIdByType(options.idType || 'default')  // Use dynamic ID validation based on type
                    : validateIdByType(options.idType || 'default').optional()  // Optional if ID is not required
            }),

            query: options.isPagination
                ? Joi.object({
                    page: Joi.number().integer().min(1).default(1),
                    limit: Joi.number().integer().min(1).default(10),
                })
                : Joi.object({})  // If pagination is not present, skip validation
        });

        const { error, value } = schema.validate({
            params: req.params,
            query: req.query
        });

        if (error) {
            res.status(400).json({
                statuscode: 400,
                message: "Invalid parameters.",
                details: error.details
            });
            return;
        }

        req.query = value.query;
        next();
    };
};