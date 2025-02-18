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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudent = exports.Logout = exports.f = exports.login = exports.Register = void 0;
var Student_1 = require("../Models/Student");
var error_1 = require("../Middlewares/error");
var ErrorHandling_1 = require("../Utils/ErrorHandling");
var bcryptjs_1 = require("bcryptjs");
var CookieSender_1 = require("../Utils/CookieSender");
exports.Register = (0, error_1.TryCatch)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fullName, email, password, semester, departmentName, enrollmentNumber, collegeName, collegeJoiningDate, student;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, fullName = _a.fullName, email = _a.email, password = _a.password, semester = _a.semester, departmentName = _a.departmentName, enrollmentNumber = _a.enrollmentNumber, collegeName = _a.collegeName, collegeJoiningDate = _a.collegeJoiningDate;
                if (!(fullName && email && password && semester && departmentName && enrollmentNumber && collegeName && collegeJoiningDate && password.length >= 6)) return [3 /*break*/, 2];
                return [4 /*yield*/, Student_1.default.create({
                        fullName: fullName,
                        email: email,
                        password: password,
                        semester: semester,
                        departmentName: departmentName,
                        enrollmentNumber: enrollmentNumber,
                        collegeName: collegeName,
                        collegeJoiningDate: collegeJoiningDate
                    })];
            case 1:
                student = _b.sent();
                (0, CookieSender_1.default)(res, student._id.toString(), "Student");
                res.status(201).json({
                    success: true,
                    message: "Register Commpleted !! ".concat(student.fullName),
                    user: student,
                });
                return [3 /*break*/, 3];
            case 2:
                if (password.length < 6) {
                    (0, ErrorHandling_1.ErrorHandler)(res, "Password Should be 6 length", 411);
                }
                else {
                    (0, ErrorHandling_1.ErrorHandler)(res, "Required AllFileds!!", 400);
                }
                _b.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.login = (0, error_1.TryCatch)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fullName, email, password, enrollmentNumber, student, truePassword, trueEnrollmentNumber;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, fullName = _a.fullName, email = _a.email, password = _a.password, enrollmentNumber = _a.enrollmentNumber;
                if (!(fullName && email && password && enrollmentNumber)) return [3 /*break*/, 3];
                return [4 /*yield*/, Student_1.default.findOne({ email: email })];
            case 1:
                student = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.compare(password, student === null || student === void 0 ? void 0 : student.password)];
            case 2:
                truePassword = _b.sent();
                trueEnrollmentNumber = (student === null || student === void 0 ? void 0 : student.enrollmentNumber) === enrollmentNumber;
                if (truePassword && trueEnrollmentNumber) {
                    (0, CookieSender_1.default)(res, student._id.toString(), "Student");
                    return [2 /*return*/, res.status(202).json({
                            success: true,
                            message: "WellCome " + (student === null || student === void 0 ? void 0 : student.fullName),
                            user: student
                        })];
                }
                else {
                    console.log(trueEnrollmentNumber, truePassword);
                    (0, ErrorHandling_1.ErrorHandler)(res, "Email or Password or EnrollmentNumber Should be Wrong !!", 401);
                }
                return [3 /*break*/, 4];
            case 3:
                (0, ErrorHandling_1.ErrorHandler)(res, "Required AllFileds!!", 400);
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
var f = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.status(200).json({
            message: "Work"
        });
        return [2 /*return*/];
    });
}); };
exports.f = f;
exports.Logout = (0, error_1.TryCatch)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var cookieOptions;
    return __generator(this, function (_a) {
        cookieOptions = {
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
        return [2 /*return*/];
    });
}); });
exports.getStudent = (0, error_1.TryCatch)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var student;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Student_1.default.findById(req.Id)];
            case 1:
                student = _a.sent();
                res.status(200).json({
                    success: true,
                    student: student
                });
                return [2 /*return*/];
        }
    });
}); });
