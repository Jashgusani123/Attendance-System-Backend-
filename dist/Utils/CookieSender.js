"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookieSender = (res, Id, type) => {
    const token = jsonwebtoken_1.default.sign({ _id: Id }, process.env.JWT_SECRET);
    const cookieOptions = {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: "none", // Type assertion to literal type
        httpOnly: true,
        secure: true, // Use secure cookies in production
    };
    if (type && type === "Teacher") {
        res.status(200).cookie("Teacher", token, cookieOptions);
    }
    else if (type && type === "Student") {
        res.status(200).cookie("Student", token, cookieOptions);
    }
    else if (type && type === "Hod") {
        res.status(200).cookie("Hod", token, cookieOptions);
    }
    else if (type && type === "Admin") {
        res.status(200).cookie("Admin", token, cookieOptions);
    }
    else {
        res.status(200).cookie("Panding", token, cookieOptions);
    }
};
exports.default = cookieSender;
