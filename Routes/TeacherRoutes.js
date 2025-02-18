"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var TeacherContoll_1 = require("../Controllers/TeacherContoll");
var Authentication_1 = require("../Utils/Authentication");
var app = (0, express_1.default)();
app.post("/register", TeacherContoll_1.Register);
app.post("/login", TeacherContoll_1.login);
app.get("/logout", Authentication_1.GetUser, TeacherContoll_1.Logout);
app.get("/getclasses", Authentication_1.GetUser, TeacherContoll_1.GetClasses);
app.post("/generate-qr", TeacherContoll_1.GenerateQR);
// app.get("/f" , IsLoggedin , f)
app.get("/getteacher", Authentication_1.GetUser, TeacherContoll_1.getTeacher);
exports.default = app;
