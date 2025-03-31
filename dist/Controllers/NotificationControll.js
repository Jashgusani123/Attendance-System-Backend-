"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserNotifications = exports.CreateNotification = void 0;
const error_1 = require("../Middlewares/error");
const Notification_1 = __importDefault(require("../Models/Notification"));
const ErrorHandling_1 = require("../Utils/ErrorHandling");
exports.CreateNotification = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, allStudent, upperHeadding, description, to, pandingId } = req.body;
    let userType = "";
    if (req.type === "Teacher") {
        userType = "Teacher";
    }
    else if (req.type === "Admin" || req.type === "Panding") {
        userType = "Admin";
    }
    if (type === process.env.CLASSCREATION && allStudent) {
        if (!upperHeadding || !description) {
            (0, ErrorHandling_1.ErrorHandler)(res, "Give Title and Description For that!!");
        }
        else {
            const notification = yield Notification_1.default.create({
                type,
                allStudent,
                upperHeadding,
                description,
                userType
            });
            res.status(200).json({
                sucess: true,
                message: "Notificatoin Created ",
                notification
            });
        }
    }
    else if (type === process.env.WELLCOME && to) {
        const notification = yield Notification_1.default.create({
            type,
            upperHeadding,
            description,
            userType,
            to
        });
        res.status(200).json({
            sucess: true,
            message: "Notificatoin Created ",
            notification
        });
    }
    else if (type === "request" && to && pandingId) {
        const notification = yield Notification_1.default.create({
            type,
            upperHeadding,
            description,
            userType,
            to,
            pandingId
        });
        res.status(200).json({
            sucess: true,
            message: "Notificatoin Created ",
            notification
        });
    }
    else {
        res.status(404).json({
            success: false,
            message: "Notification not Created !!"
        });
    }
}));
exports.GetUserNotifications = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { erno, id } = req.body;
    if (!erno && !id) {
        return (0, ErrorHandling_1.ErrorHandler)(res, "Enter Your Enrollment Number Or Id...", 404);
    }
    let allNotification;
    if (erno && !id) {
        allNotification = yield Notification_1.default.find({
            $or: [
                { to: erno },
                { allStudent: { $in: [erno] } }
            ]
        }).select("upperHeadding description type");
        res.status(200).json({ success: true, notifications: allNotification });
    }
    else if (id && !erno) {
        allNotification = yield Notification_1.default.find({
            to: id
        }).select("upperHeadding description type");
        res.status(200).json({ success: true, notifications: allNotification });
    }
}));
