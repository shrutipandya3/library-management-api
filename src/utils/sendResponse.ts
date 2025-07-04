import { Response } from "express";

interface ResponseOptions {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: any;
}

export const sendResponse = ({ res, statusCode = 200, message = "Success", data = null }: ResponseOptions) => {
  return res.status(statusCode).json({
    message,
    data,
  });
};
