"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
var ErrorHandler = function (res, message, statusCode) {
    if (statusCode === void 0) { statusCode = 500; }
    return res.status(Number(statusCode)).json({
        success: false,
        message: message
    });
};
exports.ErrorHandler = ErrorHandler;
