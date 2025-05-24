import { NextFunction, Request, Response } from "express";

type ControllerType = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response>;
  

export const TryCatch = (func: ControllerType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await func(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  };