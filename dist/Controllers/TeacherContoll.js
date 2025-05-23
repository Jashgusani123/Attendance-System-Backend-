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
exports.SendNotification = exports.GenerateExcel = exports.GetLastsClasses = exports.GetOverview = exports.GetAllAttendance = exports.GetTeacher = exports.GetClasses = exports.Logout = exports.login = exports.Register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const googleapis_1 = require("googleapis");
const moment_1 = __importDefault(require("moment"));
const error_1 = require("../Middlewares/error");
const Class_1 = __importDefault(require("../Models/Class"));
const Student_1 = __importDefault(require("../Models/Student"));
const Teacher_1 = __importDefault(require("../Models/Teacher"));
const CookieSender_1 = __importDefault(require("../Utils/CookieSender"));
const ErrorHandling_1 = require("../Utils/ErrorHandling");
const Hod_1 = __importDefault(require("../Models/Hod"));
const Notification_1 = __importDefault(require("../Models/Notification"));
exports.Register = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password, departmentName, collegeName, gender } = req.body;
    console.log(password);
    if (fullName && email && password && departmentName && gender && collegeName && password.length >= 6) {
        const isTeacher = yield Teacher_1.default.find({ email: email });
        if (isTeacher.length > 0) {
            return (0, ErrorHandling_1.ErrorHandler)(res, "This Account Allready Created!! ");
        }
        const teacher = yield Teacher_1.default.create({
            fullName,
            email,
            password,
            departmentName,
            collegeName,
            gender
        });
        (0, CookieSender_1.default)(res, teacher._id.toString(), "Teacher");
        res.status(201).json({
            success: true,
            message: `Register Commpleted !! ${teacher.fullName}`,
            user: teacher,
        });
    }
    else if (password.length < 6) {
        (0, ErrorHandling_1.ErrorHandler)(res, "Password Should be 6 length", 411);
    }
    else {
        (0, ErrorHandling_1.ErrorHandler)(res, "Required AllFileds!!", 400);
    }
}));
exports.login = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    if (fullName && email && password) {
        const teacher = yield Teacher_1.default.findOne({ email: email });
        const truePassword = yield bcryptjs_1.default.compare(password, teacher === null || teacher === void 0 ? void 0 : teacher.password);
        if (truePassword) {
            (0, CookieSender_1.default)(res, teacher._id.toString(), "Teacher");
            return res.status(202).json({
                success: true,
                message: "WellCome " + (teacher === null || teacher === void 0 ? void 0 : teacher.fullName),
                user: teacher
            });
        }
        else {
            (0, ErrorHandling_1.ErrorHandler)(res, "Email or Password Should be Wrong !!", 401);
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
    res.cookie("Teacher", "", cookieOptions);
    res.status(200).json({
        success: true,
        message: "Logout Done!!",
    });
}));
exports.GetClasses = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Classes = yield Class_1.default.find({ createdBy: req.Id });
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
exports.GetTeacher = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = yield Teacher_1.default.findById(req.Id);
    res.status(200).json({
        success: true,
        teacher
    });
}));
exports.GetAllAttendance = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { classID } = req.body;
    if (!classID) {
        return res.status(404).json({ success: false, message: "I am Not Get ClassID" });
    }
    const GettedClass = yield Class_1.default.findById(classID);
    if (!GettedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
    }
    // Combining both present and absent students in a structured way
    const allAttendance = [
        ...GettedClass.presentStudent.map((student, index) => ({
            id: index + 1,
            erno: student,
            isPresent: true
        })),
        ...GettedClass.absentStudent.map((student, index) => ({
            id: GettedClass.presentStudent.length + index + 1,
            erno: student,
            status: false
        }))
    ];
    return res.status(200).json({
        success: true,
        allAttendance
    });
}));
exports.GetOverview = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.type === "Teacher" && req.Id) {
        const teacher = yield Teacher_1.default.findById(req.Id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
        const last7DaysData = [];
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 1; i <= 7; i++) { // Looping for the last 7 days
            const date = new Date();
            date.setUTCDate(date.getUTCDate() - i);
            const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
            const allClasses = yield Class_1.default.find({ createdAt: { $gte: startOfDay, $lt: endOfDay }, createdBy: req.Id });
            const totalClasses = allClasses.length;
            const studentsAttended = allClasses.reduce((count, classs) => count + (classs.presentStudent.length | 0), 0);
            const totalStudents = allClasses.reduce((count, classs) => count + (classs.allStudent.length | 0), 0);
            const day = days[startOfDay.getUTCDay()];
            last7DaysData.push({
                date: day,
                totalClass: totalClasses,
                studentsAttended: studentsAttended,
                totalStudents: totalStudents
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
exports.GetLastsClasses = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.type === "Teacher" && req.Id) {
        const today = new Date();
        const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
        const allClasses = yield Class_1.default.find({
            createdBy: req.Id,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        })
            .select("subjectName starting ending"); // Populate 'starting' and 'ending' fields
        if (!allClasses || allClasses.length === 0) {
            return (0, ErrorHandling_1.ErrorHandler)(res, "Classes Not Found!!");
        }
        res.status(200).json({
            success: true,
            allClasses
        });
    }
    else {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }
}));
exports.GenerateExcel = (0, error_1.TryCatch)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    let { sheetName = "Sheet1", fileName, spreadsheetId } = req.body;
    if (req.type !== "Teacher" || !req.Id) {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
    const allClasses = yield Class_1.default.find({ createdAt: { $gte: startOfDay, $lt: endOfDay }, createdBy: req.Id });
    const teacher = yield Teacher_1.default.findById(req.Id);
    const fields = [];
    for (const classes of allClasses) {
        for (const studentId of classes.allStudent) {
            const student = yield Student_1.default.findOne({ enrollmentNumber: studentId });
            if (!student)
                continue;
            const isPresent = classes.presentStudent.includes(student.enrollmentNumber);
            fields.push([
                formattedDate,
                classes.subjectName,
                (teacher === null || teacher === void 0 ? void 0 : teacher.fullName) || "Unknown",
                student.fullName,
                student.enrollmentNumber,
                isPresent ? "Present" : "Absent",
                classes.semester,
            ]);
        }
    }
    if (fields.length === 0) {
        return res.status(404).json({ success: false, message: "No data available to add to Excel." });
    }
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: "/opt/render/project/src/src/gcp-credentials.json", // Just pass the file path
        scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"],
    });
    const drive = googleapis_1.google.drive({ version: "v3", auth });
    const sheets = googleapis_1.google.sheets({ version: "v4", auth });
    let finalSpreadsheetId = spreadsheetId;
    let sheetId;
    if (!spreadsheetId) {
        const spreadsheet = yield sheets.spreadsheets.create({
            requestBody: {
                properties: { title: fileName || `Attendance_Report_${formattedDate}` },
                sheets: [{ properties: { title: sheetName } }],
            },
        });
        finalSpreadsheetId = spreadsheet.data.spreadsheetId;
        sheetId = (_c = (_b = (_a = spreadsheet.data.sheets) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.properties) === null || _c === void 0 ? void 0 : _c.sheetId;
        const headers = [["Date", "Subject", "Teacher", "Student", "Enrollment", "Status", "Semester"]];
        yield sheets.spreadsheets.values.update({
            spreadsheetId: finalSpreadsheetId,
            range: `${sheetName}!A1:G1`,
            valueInputOption: "RAW",
            requestBody: { values: headers },
        });
    }
    else {
        const sheetInfo = yield sheets.spreadsheets.get({ spreadsheetId });
        const fetchedFileName = (_d = sheetInfo.data.properties) === null || _d === void 0 ? void 0 : _d.title;
        const sheet = (_e = sheetInfo.data.sheets) === null || _e === void 0 ? void 0 : _e[0];
        sheetId = (_f = sheet === null || sheet === void 0 ? void 0 : sheet.properties) === null || _f === void 0 ? void 0 : _f.sheetId;
        const fetchedSheetName = (_g = sheet === null || sheet === void 0 ? void 0 : sheet.properties) === null || _g === void 0 ? void 0 : _g.title;
        if (!fetchedSheetName) {
            return res.status(400).json({ success: false, message: `No sheets found in the spreadsheet.` });
        }
        sheetName = sheetName || fetchedSheetName;
    }
    const existingData = yield sheets.spreadsheets.values.get({
        spreadsheetId: finalSpreadsheetId,
        range: `${sheetName}!A:A`,
    });
    const startRow = existingData.data.values ? existingData.data.values.length + 1 : 2;
    yield sheets.spreadsheets.batchUpdate({
        spreadsheetId: finalSpreadsheetId,
        requestBody: {
            requests: [
                // Make the first row (headers) bold and black
                {
                    repeatCell: {
                        range: { sheetId: sheetId, startRowIndex: 0, endRowIndex: 1 },
                        cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } } } },
                        fields: "userEnteredFormat"
                    }
                },
                // Apply Green color for "Present"
                {
                    addConditionalFormatRule: {
                        rule: {
                            ranges: [{
                                    sheetId: sheetId,
                                    startRowIndex: startRow - 1, // Data rows only
                                    endRowIndex: startRow - 1 + fields.length,
                                    startColumnIndex: 5, // "Status" column index
                                    endColumnIndex: 6
                                }],
                            booleanRule: {
                                condition: {
                                    type: "TEXT_EQ",
                                    values: [{ userEnteredValue: "Present" }]
                                },
                                format: {
                                    textFormat: { foregroundColor: { red: 0, green: 1, blue: 0 } } // Green
                                }
                            }
                        },
                        index: 0
                    }
                },
                // Apply Red color for "Absent"
                {
                    addConditionalFormatRule: {
                        rule: {
                            ranges: [{
                                    sheetId: sheetId,
                                    startRowIndex: startRow - 1, // Data rows only
                                    endRowIndex: startRow - 1 + fields.length,
                                    startColumnIndex: 5, // "Status" column index
                                    endColumnIndex: 6
                                }],
                            booleanRule: {
                                condition: {
                                    type: "TEXT_EQ",
                                    values: [{ userEnteredValue: "Absent" }]
                                },
                                format: {
                                    textFormat: { foregroundColor: { red: 1, green: 0, blue: 0 } } // Red
                                }
                            }
                        },
                        index: 1
                    }
                }
            ]
        }
    });
    yield sheets.spreadsheets.values.update({
        spreadsheetId: finalSpreadsheetId,
        range: `${sheetName}!A${startRow}:G`,
        valueInputOption: "RAW",
        requestBody: { values: fields },
    });
    yield drive.permissions.create({
        fileId: finalSpreadsheetId,
        requestBody: {
            type: "user",
            role: "writer",
            emailAddress: teacher === null || teacher === void 0 ? void 0 : teacher.email,
        },
    });
    res.status(200).json({
        success: true,
        message: `Google Sheet '${fileName || "Attendance Report"}' updated and shared successfully!`,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${finalSpreadsheetId}`,
    });
}));
exports.SendNotification = (0, error_1.TryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    if (!message)
        return (0, ErrorHandling_1.ErrorHandler)(res, "Server Can't Get Proper Data (408)", 404);
    const isTeacher = yield Teacher_1.default.findById(req.Id);
    if (!isTeacher)
        return (0, ErrorHandling_1.ErrorHandler)(res, "Something went wrong(412) !!", 404);
    const isHod = yield Hod_1.default.findOne({ collegeName: isTeacher === null || isTeacher === void 0 ? void 0 : isTeacher.collegeName, departmentName: isTeacher === null || isTeacher === void 0 ? void 0 : isTeacher.departmentName });
    if (!isHod)
        return (0, ErrorHandling_1.ErrorHandler)(res, "Something went Wrong(415) !!", 404);
    const newNotification = yield Notification_1.default.create({
        to: isHod._id,
        upperHeadding: `${isTeacher.fullName} Replay to You ...`,
        description: message,
        userType: "Hod",
        type: "message"
    });
    res.status(200).json({
        success: true,
        message: "Send !!"
    });
}));
