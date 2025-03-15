"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StudentControll_1 = require("../Controllers/StudentControll");
const Authentication_1 = require("../Utils/Authentication");
const app = (0, express_1.default)();
app.post("/register", StudentControll_1.Register);
app.post("/login", StudentControll_1.login);
app.get("/logout", Authentication_1.GetUser, StudentControll_1.Logout);
app.get("/getclasses", Authentication_1.GetUser, StudentControll_1.GetClasses);
app.get("/getstudent", Authentication_1.GetUser, StudentControll_1.getStudent);
app.get("/getlastdata", Authentication_1.GetUser, StudentControll_1.GetLastAttendance);
// app.get("/f" , IsLoggedin , f)
exports.default = app;
