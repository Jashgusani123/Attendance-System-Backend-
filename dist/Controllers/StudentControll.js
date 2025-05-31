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
exports.GetLastAttendance = exports.GetClasses = exports.getStudent = exports.Logout = exports.login = exports.Register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const moment_1 = __importDefault(require("moment"));
const error_1 = require("../Middlewares/error");
const Class_1 = __importDefault(require("../Models/Class"));
const Student_1 = __importDefault(require("../Models/Student"));
const CookieSender_1 = __importDefault(require("../Utils/CookieSender"));
const ErrorHandling_1 = require("../Utils/ErrorHandling");
exports.Register = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password, semester, departmentName, enrollmentNumber, collegeName, collegeJoiningDate, gender } = req.body;
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!fullName ||
        !email ||
        !password ||
        !semester ||
        !departmentName ||
        !enrollmentNumber ||
        !collegeName ||
        !collegeJoiningDate ||
        !gender) {
        return (0, ErrorHandling_1.ErrorHandler)(res, "All fields are required!", 400);
    }
    if (password.length < 6) {
        return (0, ErrorHandling_1.ErrorHandler)(res, "Password should be at least 6 characters long", 411);
    }
    if (!isValidEmail(email)) {
        return (0, ErrorHandling_1.ErrorHandler)(res, "Invalid email format", 422);
    }
    const student = (yield Student_1.default.create({
        fullName,
        email,
        password,
        semester,
        departmentName,
        enrollmentNumber,
        collegeName,
        collegeJoiningDate,
        gender
    }));
    (0, CookieSender_1.default)(res, student._id.toString(), "Student");
    res.status(201).json({
        success: true,
        message: `Registration Completed!! ${student.fullName}`,
        user: student
    });
}));
exports.login = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password, enrollmentNumber } = req.body;
    if (fullName && email && password && enrollmentNumber) {
        const student = yield Student_1.default.findOne({ email });
        const truePassword = yield bcryptjs_1.default.compare(password, student === null || student === void 0 ? void 0 : student.password);
        const trueEnrollmentNumber = (student === null || student === void 0 ? void 0 : student.enrollmentNumber) === enrollmentNumber;
        if (truePassword && trueEnrollmentNumber) {
            (0, CookieSender_1.default)(res, student._id.toString(), "Student");
            return res.status(202).json({
                success: true,
                message: "WellCome " + (student === null || student === void 0 ? void 0 : student.fullName),
                user: student
            });
        }
        else {
            (0, ErrorHandling_1.ErrorHandler)(res, "Email or Password or EnrollmentNumber Should be Wrong !!", 401);
        }
    }
    else {
        (0, ErrorHandling_1.ErrorHandler)(res, "Required AllFileds!!", 400);
    }
}));
exports.Logout = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cookieOptions = {
        maxAge: 0, // Expire immediately
        sameSite: "none",
        httpOnly: true,
        secure: true,
    };
    res.cookie("Student", "", cookieOptions);
    res.status(200).json({
        success: true,
        message: "Logout Done!!",
    });
}));
exports.getStudent = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield Student_1.default.findById(req.Id);
    res.status(200).json({
        success: true,
        student
    });
}));
exports.GetClasses = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield Student_1.default.findById(req.Id);
    const Classes = yield Class_1.default.find({ allStudent: { $in: [student === null || student === void 0 ? void 0 : student.enrollmentNumber] } });
    const currentDateTime = (0, moment_1.default)(); // Current full timestamp
    let upcomingClasses = [];
    if (Classes) {
        upcomingClasses = Classes.filter((i) => {
            const classEndTime = (0, moment_1.default)(i.ending, "YYYY-MM-DD HH:mm"); // Full date-time
            return classEndTime.isAfter(currentDateTime);
        });
    }
    res.status(200).json({
        success: true,
        upcomingClasses
    });
}));
exports.GetLastAttendance = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.type === "Student" && req.Id) {
        const student = yield Student_1.default.findById(req.Id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        const enrollmentNumber = student.enrollmentNumber;
        const last7DaysData = [];
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 1; i < 8; i++) {
            const date = new Date();
            date.setUTCDate(date.getUTCDate() - i);
            const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
            const totalClasses = yield Class_1.default.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } });
            const yourAttendance = yield Class_1.default.countDocuments({
                createdAt: { $gte: startOfDay, $lt: endOfDay },
                presentStudent: { $in: [enrollmentNumber] }
            });
            let day = days[startOfDay.getDay()];
            last7DaysData.push({
                date: day, // Format as YYYY-MM-DD
                totalClasses,
                yourAttendance
            });
        }
        return res.status(200).json({
            success: true,
            last7DaysData: last7DaysData.reverse()
        });
    }
    else {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }
}));
