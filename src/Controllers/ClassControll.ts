import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Class from "../Models/Class";
import Teacher from "../Models/Teacher";
import { AuthRequest } from '../Utils/Authentication';
import { ErrorHandler } from "../Utils/ErrorHandling";
import { io, TeacherSockets } from "../app";
import moment from "moment";
import Student from "../Models/Student";

export const CreateClass = TryCatch(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { departmentName, ending, semester, starting, subjectName, location, teacherName } = req.body;

    // console.log(req.Id);

    const teacher = await Teacher.findById(req.Id);

    console.log(teacher?.collegeName);
    console.log(departmentName);
    
    Number(semester);
    const allStudents = await Student.find({
        collegeName: { $eq: teacher?.collegeName }, 
        departmentName: { $eq: departmentName }, 
        semester: Number(semester)
    }).collation({ locale: "en", strength: 2 }) // Case-insensitive matching
    .select("enrollmentNumber");
    
    console.log(allStudents);
    console.log(semester);

    
    
    const allStudent = allStudents.map(student => student.enrollmentNumber);

    let newClass = await Class.create({
        collegeName: teacher?.collegeName, departmentName, ending, semester, starting, subjectName, allStudent, location, createdBy: req.Id, teacherName
    });

    res.status(200).json({
        success: true,
        newClass
    });
});

export const GetAll = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { enrollmentNumber } = req.body;
    if (!enrollmentNumber) {
        return ErrorHandler(res, "EnrollmentNumber NotFound", 400);
    }

    const Classes = await Class.find({ allStudent: { $in: [enrollmentNumber] } });

    res.status(200).json({
        success: true,
        Classes
    })
});


export const GetLiveClass = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { enrollmentNumber } = req.body;

    const classes = await Class.find({ allStudent: { $in: [enrollmentNumber] } });

    const currentTime = moment().toDate().toString();
    const date = new Date(currentTime);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const LiveClasses: any[] = [];


    classes.map((i) => {
        console.log(time > i.starting, i.ending >= time);

        if (time > i.starting && i.ending > time) {
            LiveClasses.push(i)
        }
    })
    res.status(200).json({
        success: true,
        LiveClasses
    })
});

export const GetUpcomingClass = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { enrollmentNumber } = req.body;

    const classes = await Class.find({ allStudent: { $in: [enrollmentNumber] } });

    const currentTime = moment().toDate().toString();
    const date = new Date(currentTime);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const LiveClasses: any[] = [];


    classes.map((i) => {
        console.log(time > i.starting, i.ending >= time);

        if (time < i.starting) {

            LiveClasses.push(i)
        }
    })
    res.status(200).json({
        success: true,
        LiveClasses
    })
});
export const Accept = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { classID, StudentErNo } = req.body;

    if (!classID || !StudentErNo) {
        console.error("Data Not Found At 110");
        return res.status(400).json({ success: false, message: "Invalid Data" });
    }

    const GetedClass = await Class.findById(classID);
    if (!GetedClass) {
        return res.status(404).json({ success: false, message: "Class Not Found" });
    }

    const IsThisIsInAllStudent = GetedClass.allStudent.some(i => i === StudentErNo);
    const IsThisIsInPresentArray = GetedClass.presentStudent.some(i => i === StudentErNo);

    if (IsThisIsInAllStudent && !IsThisIsInPresentArray) {
        GetedClass.presentStudent.push(StudentErNo);
        await GetedClass.save(); // Don't forget to save the changes in MongoDB!
        const teacher = await Teacher.findById(GetedClass.createdBy);
        if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

        const teacherSocketId = TeacherSockets.get(teacher.fullName); // Use Map.get() method
        const student = await Student.findOne({ enrollmentNumber: StudentErNo });
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        if (teacherSocketId) {
            io.to(teacherSocketId).emit("approval", { 
                erno: StudentErNo,
                name: student.fullName,
                isPresent: true 
            });
        } else {
            console.log("Teacher socket ID not found!");
        }
        const obj = {
            subjectName:GetedClass.subjectName,
            teacherName:teacher.fullName,
            isPresent:true
        }
        return res.status(202).json({ success: true, data:obj });
    }

    if (!IsThisIsInAllStudent) {
        return res.status(404).json({ success: false, message: "That is Not In This Class!!" });
    }

    if (IsThisIsInPresentArray) {
        return res.status(400).json({ success: false, message: "Your Attendance Already Approved !!" });
    }
});
