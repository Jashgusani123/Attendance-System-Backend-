"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NotificationControll_1 = require("../Controllers/NotificationControll");
const Authentication_1 = require("../Utils/Authentication");
const app = (0, express_1.default)();
app.post("/create", Authentication_1.GetUser, NotificationControll_1.CreateNotification);
app.post("/get", Authentication_1.GetUser, NotificationControll_1.GetUserNotifications);
exports.default = app;
