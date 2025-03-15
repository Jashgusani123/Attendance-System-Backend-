"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const ErrorHandler = (res, message, statusCode = 500) => {
    return res.status(Number(statusCode)).json({
        success: false,
        message
    });
};
exports.ErrorHandler = ErrorHandler;
