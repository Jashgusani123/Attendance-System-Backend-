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
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = require("../Middlewares/error");
const Hod_1 = __importDefault(require("../Models/Hod"));
const Notification_1 = __importDefault(require("../Models/Notification"));
const Student_1 = __importDefault(require("../Models/Student"));
const Teacher_1 = __importDefault(require("../Models/Teacher"));
const ErrorHandling_1 = require("../Utils/ErrorHandling");
exports.CreateNotification = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, allStudent, upperHeadding, description, to, pendingId, } = req.body;
    let userType = "";
    if (req.type === "Teacher") {
        userType = "Teacher";
    }
    else if (req.type === "Hod" || req.type === "Pending") {
        userType = "Hod";
    }
    else {
        userType = "Admin";
    }
    if (type === process.env.CLASSCREATION && allStudent) {
        if (!upperHeadding || !description) {
            res.status(400).json({ success: false, message: "Provide Title and Description!" });
            return;
        }
        const notification = yield Notification_1.default.create({
            type,
            allStudent,
            upperHeadding,
            description,
            userType,
        });
        res.status(200).json({
            success: true,
            message: "Notification Created",
            notification,
        });
    }
    else if (type === process.env.WELLCOME && to) {
        const notification = yield Notification_1.default.create({
            type,
            upperHeadding,
            description,
            userType,
            to,
        });
        res.status(200).json({
            success: true,
            message: "Notification Created",
            notification,
        });
    }
    else if (type === "request" && to && pendingId) {
        const notification = yield Notification_1.default.create({
            type,
            upperHeadding,
            description,
            userType,
            to,
            pendingId,
        });
        res.status(200).json({
            success: true,
            message: "Notification Created",
            notification,
        });
    }
    else if (userType === "Admin" && type === "adminmessage") {
        if (to === "All") {
            const [Students, Teachers, Hods] = yield Promise.all([
                Student_1.default.find().select("_id"),
                Teacher_1.default.find().select("_id"),
                Hod_1.default.find().select("_id"),
            ]);
            const allUsers = [
                ...Students.map((s) => s._id),
                ...Teachers.map((t) => t._id),
                ...Hods.map((h) => h._id),
            ];
            yield Notification_1.default.create({
                userType,
                type,
                upperHeadding,
                description,
                allUsers,
            });
            res.status(200).json({
                success: true,
                message: "Sent Message to All Users",
            });
        }
        else if (mongoose_1.default.Types.ObjectId.isValid(to)) {
            yield Notification_1.default.create({
                userType,
                type,
                upperHeadding,
                description,
                to,
            });
            res.status(200).json({
                success: true,
                message: "Sent Message to Specific User",
            });
        }
        else {
            const clganddepart = to.split("-").map((s) => s.trim());
            if (clganddepart[1] === "All") {
                const [Students, Teachers, Hods] = yield Promise.all([
                    Student_1.default.find({ collegeName: clganddepart[0] }).select("_id"),
                    Teacher_1.default.find({ collegeName: clganddepart[0] }).select("_id"),
                    Hod_1.default.find({ collegeName: clganddepart[0] }).select("_id"),
                ]);
                const allUsers = [
                    ...Students.map((s) => s._id),
                    ...Teachers.map((t) => t._id),
                    ...Hods.map((h) => h._id),
                ];
                yield Notification_1.default.create({
                    userType,
                    type,
                    upperHeadding,
                    description,
                    allUsers,
                });
                res.status(200).json({
                    success: true,
                    message: "Sent Message to Entire College",
                });
            }
            else if (clganddepart[1] === "Students") {
                const Students = yield Student_1.default.find({
                    collegeName: clganddepart[0]
                }).select("_id");
                const allUsers = Students.map((s) => s._id);
                yield Notification_1.default.create({
                    userType,
                    type,
                    upperHeadding,
                    description,
                    allUsers,
                });
                res.status(200).json({
                    success: true,
                    message: "Sent Message to Students",
                });
            }
            else if (clganddepart[1] === "Teachers") {
                const Teachers = yield Teacher_1.default.find({
                    collegeName: clganddepart[0],
                }).select("_id");
                const allUsers = Teachers.map((t) => t._id);
                yield Notification_1.default.create({
                    userType,
                    type,
                    upperHeadding,
                    description,
                    allUsers,
                });
                res.status(200).json({
                    success: true,
                    message: "Sent Message to Teachers",
                });
            }
            else if (clganddepart[1] === "Hods") {
                const Hods = yield Hod_1.default.find({
                    collegeName: clganddepart[0],
                }).select("_id");
                const allUsers = Hods.map((h) => h._id);
                yield Notification_1.default.create({
                    userType,
                    type,
                    upperHeadding,
                    description,
                    allUsers,
                });
                res.status(200).json({
                    success: true,
                    message: "Sent Message to Hods",
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "Invalid Department Specified",
                });
            }
        }
    }
    else {
        res.status(404).json({
            success: false,
            message: "Notification Not Created",
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
            $or: [
                { to: id },
                { allUsers: id } // Match if user's ID is in the allUsers array
            ]
        }).select("upperHeadding description type");
        res.status(200).json({ success: true, notifications: allNotification });
    }
}));
