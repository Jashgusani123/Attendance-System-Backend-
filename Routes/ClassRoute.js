"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var ClassControll_1 = require("../Controllers/ClassControll");
var Authentication_1 = require("../Utils/Authentication");
var app = (0, express_1.default)();
app.post("/create", Authentication_1.GetUser, ClassControll_1.CreateClass);
app.post("/getAll", ClassControll_1.GetAll);
exports.default = app;
