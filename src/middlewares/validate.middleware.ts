// src/middlewares/validate.middleware.ts
import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema<any>, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const error: any = new Error(req.__("validation_failed"));
      error.statusCode = 400;
      error.errors = result.error.flatten().fieldErrors;
      return next(error);
    }

    req[source] = result.data;
    next();
  };
