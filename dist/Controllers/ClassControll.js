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
exports.Accept = exports.GetUpcomingClass = exports.GetLiveClass = exports.GetAll = exports.CreateClass = void 0;
const error_1 = require("../Middlewares/error");
const Class_1 = __importDefault(require("../Models/Class"));
const Teacher_1 = __importDefault(require("../Models/Teacher"));
const ErrorHandling_1 = require("../Utils/ErrorHandling");
const app_1 = require("../app");
const moment_1 = __importDefault(require("moment"));
const Student_1 = __importDefault(require("../Models/Student"));
exports.CreateClass = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { departmentName, ending, semester, starting, subjectName, location, teacherName } = req.body;
    const teacher = yield Teacher_1.default.findById(req.Id);
    Number(semester);
    const allStudents = yield Student_1.default.find({
        collegeName: { $eq: teacher === null || teacher === void 0 ? void 0 : teacher.collegeName },
        departmentName: { $eq: departmentName },
        semester: Number(semester)
    }).collation({ locale: "en", strength: 2 }) // Case-insensitive matching
        .select("enrollmentNumber");
    const allStudent = allStudents.map(student => student.enrollmentNumber);
    let newClass = yield Class_1.default.create({
        collegeName: teacher === null || teacher === void 0 ? void 0 : teacher.collegeName, departmentName, ending, semester, starting, subjectName, allStudent, location, createdBy: req.Id, teacherName
    });
    res.status(200).json({
        success: true,
        newClass
    });
}));
exports.GetAll = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { enrollmentNumber } = req.body;
    if (!enrollmentNumber) {
        return (0, ErrorHandling_1.ErrorHandler)(res, "EnrollmentNumber NotFound", 400);
    }
    const Classes = yield Class_1.default.find({ allStudent: { $in: [enrollmentNumber] } });
    res.status(200).json({
        success: true,
        Classes
    });
}));
exports.GetLiveClass = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { enrollmentNumber } = req.body;
    const classes = yield Class_1.default.find({ allStudent: { $in: [enrollmentNumber] } });
    const currentTime = (0, moment_1.default)().toDate().toString();
    const date = new Date(currentTime);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const LiveClasses = [];
    classes.map((i) => {
        if (time > i.starting && i.ending > time) {
            LiveClasses.push(i);
        }
    });
    res.status(200).json({
        success: true,
        LiveClasses
    });
}));
exports.GetUpcomingClass = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { enrollmentNumber } = req.body;
    const classes = yield Class_1.default.find({ allStudent: { $in: [enrollmentNumber] } });
    const currentTime = (0, moment_1.default)().toDate().toString();
    const date = new Date(currentTime);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const LiveClasses = [];
    classes.map((i) => {
        if (time < i.starting) {
            LiveClasses.push(i);
        }
    });
    res.status(200).json({
        success: true,
        LiveClasses
    });
}));
exports.Accept = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { classID, StudentErNo } = req.body;
    if (!classID || !StudentErNo) {
        console.error("Data Not Found At 110");
        return res.status(400).json({ success: false, message: "Invalid Data" });
    }
    const GetedClass = yield Class_1.default.findById(classID);
    if (!GetedClass) {
        return res.status(404).json({ success: false, message: "Class Not Found" });
    }
    const IsThisIsInAllStudent = GetedClass.allStudent.some(i => i === StudentErNo);
    const IsThisIsInPresentArray = GetedClass.presentStudent.some(i => i === StudentErNo);
    if (IsThisIsInAllStudent && !IsThisIsInPresentArray) {
        GetedClass.presentStudent.push(StudentErNo);
        yield GetedClass.save(); // Don't forget to save the changes in MongoDB!
        const teacher = yield Teacher_1.default.findById(GetedClass.createdBy);
        if (!teacher)
            return res.status(404).json({ success: false, message: "Teacher not found" });
        const teacherSocketId = app_1.TeacherSockets.get(teacher.fullName); // Use Map.get() method
        const student = yield Student_1.default.findOne({ enrollmentNumber: StudentErNo });
        if (!student)
            return res.status(404).json({ success: false, message: "Student not found" });
        if (teacherSocketId) {
            app_1.io.to(teacherSocketId).emit("approval", {
                erno: StudentErNo,
                name: student.fullName,
                isPresent: true
            });
        }
        else {
            console.log("Teacher socket ID not found!");
        }
        const obj = {
            subjectName: GetedClass.subjectName,
            teacherName: teacher.fullName,
            isPresent: true
        };
        return res.status(202).json({ success: true, data: obj });
    }
    if (!IsThisIsInAllStudent) {
        return res.status(404).json({ success: false, message: "That is Not In This Class!!" });
    }
    if (IsThisIsInPresentArray) {
        return res.status(400).json({ success: false, message: "Your Attendance Already Approved !!" });
    }
}));
