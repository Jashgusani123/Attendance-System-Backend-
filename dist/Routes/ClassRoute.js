"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ClassControll_1 = require("../Controllers/ClassControll");
const Authentication_1 = require("../Utils/Authentication");
const app = (0, express_1.default)();
app.post("/create", Authentication_1.GetUser, ClassControll_1.CreateClass);
app.post("/getAll", ClassControll_1.GetAll);
app.post("/getliveclasses", ClassControll_1.GetLiveClass);
app.post("/getupcomingclasses", ClassControll_1.GetUpcomingClass);
app.post("/accept", Authentication_1.GetUser, ClassControll_1.Accept);
exports.default = app;
