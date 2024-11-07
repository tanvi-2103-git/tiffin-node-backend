import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateGetRequest = (options: { isPagination?: boolean, isIdRequired?: boolean }) => {
    return (req: Request, res: Response, next: NextFunction): void => {

        const schema = Joi.object({
            params: Joi.object({
                id: options.isIdRequired
                    ? Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()  
                    : Joi.string().regex(/^[a-fA-F0-9]{24}$/).optional()  
            }),

            
            query: options.isPagination
                ? Joi.object({
                    page: Joi.number().integer().min(1).default(1),   
                    limit: Joi.number().integer().min(1).default(10), 
                })
                : Joi.object({})  //If pagination is not present then skip
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