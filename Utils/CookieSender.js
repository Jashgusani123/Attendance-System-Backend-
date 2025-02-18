"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var cookieSender = function (res, Id, type) {
    var token = jsonwebtoken_1.default.sign({ _id: Id }, process.env.JWT_SECRET);
    var cookieOptions = {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: "lax", // Type assertion to literal type
        httpOnly: true,
        secure: true, // Use secure cookies in production
    };
    if (type && type === "Teacher") {
        res.status(200).cookie("Teacher", token, cookieOptions);
    }
    else if (type && type === "Student") {
        res.status(200).cookie("Student", token, cookieOptions);
    }
    else {
        res.status(200).cookie("Admin", token, cookieOptions);
    }
};
exports.default = cookieSender;
