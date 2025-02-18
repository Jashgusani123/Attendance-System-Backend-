import { Response } from 'express';

export const ErrorHandler = (res: Response, message: string, statusCode: number = 500) => {
    return res.status(Number(statusCode)).json({
        success: false,
        message
    });
};