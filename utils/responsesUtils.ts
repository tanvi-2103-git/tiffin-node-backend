import { Response } from "express";

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
  refreshToken?: string
) => {
  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    token,
    refreshToken,
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
