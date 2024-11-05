import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRegisterUser = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
        username: Joi.string().pattern(/^[a-zA-Z0-9.\-_$@*!]+$/).min(3).max(20).required(),
        email: Joi.string().email().required(),
        contact_number: Joi.string().pattern(/^[0-9]{10}$/).required(), 
        address: Joi.string().min(5).max(50).required(),
        password: Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
            .min(8)
            .max(20)
            .required(),
        role_id : Joi.string().required(),   
    }).unknown();

    const { error } = schema.validate(req.body);
    if (error) {
        console.log(error);
        res.status(400).json({ error: error.details[0].message });
    }
    next();
};

export const validateLoginUser = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
        email: Joi.string().email().max(50).required(),
        password: Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
            .min(8)
            .max(20)
            .required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.log(error);
        res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = { validateRegisterUser, validateLoginUser };