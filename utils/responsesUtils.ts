import { Response } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  pagination?: any
) => {
  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    data,
    pagination,
  });
};

export const sendSuccessToken = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  token: string,
  refreshToken?: string,
   _id?:mongoose.Schema.Types.ObjectId,
  role_id?:mongoose.Schema.Types.ObjectId,
 
) => {
  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    token,
    refreshToken,
    _id,
    role_id
  });
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  error?: any
) => {
  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    error,
  });
};
