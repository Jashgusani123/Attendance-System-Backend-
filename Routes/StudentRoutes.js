"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var StudentControll_1 = require("../Controllers/StudentControll");
var Authentication_1 = require("../Utils/Authentication");
var app = (0, express_1.default)();
app.post("/register", StudentControll_1.Register);
app.post("/login", StudentControll_1.login);
app.get("/logout", Authentication_1.GetUser, StudentControll_1.Logout);
// app.get("/f" , IsLoggedin , f)
app.get("/getstudent", Authentication_1.GetUser, StudentControll_1.getStudent);
exports.default = app;
