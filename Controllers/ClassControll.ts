import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Class from "../Models/Class";
import Student from "../Models/Student";
import Teacher from "../Models/Teacher";
import { AuthRequest } from '../Utils/Authentication';
import { ErrorHandler } from "../Utils/ErrorHandling";
import { io, TeacherSockets } from "../app";
import moment from "moment";

export const CreateClass = TryCatch(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const {  departmentName, ending, semester, starting, subjectName, location , teacherName } = req.body;
    
    // console.log(req.Id);
    
    const teacher = await Teacher.findById(req.Id);


    const allStudents = await Student.find({
        collegeName: { $regex: new RegExp(`^${teacher?.collegeName}$`, "i") },
        departmentName: { $regex: new RegExp(`^${departmentName}$`, "i") },
        semester
    }).select("enrollmentNumber");

    const allStudent = allStudents.map(student => student.enrollmentNumber);

    let newClass = await Class.create({
        collegeName:teacher?.collegeName, departmentName, ending, semester, starting, subjectName, allStudent, location, createdBy:req.Id, teacherName
    });

    res.status(200).json({
        success: true,
        newClass
    });
});

export const GetAll = TryCatch(async(req:Request , res:Response , next:NextFunction)=>{
    const {enrollmentNumber} = req.body;
    if(!enrollmentNumber){
        return ErrorHandler(res , "EnrollmentNumber NotFound" , 400);
    }
    
    const Classes = await Class.find({ allStudent: { $in: [enrollmentNumber] } });
    
    res.status(200).json({
        success:true,
        Classes
    })
});

export const Accept = TryCatch(async(req: AuthRequest, res: Response, next: NextFunction) => {
    const { classDetails } = req.body;
    if (!classDetails) {
        return ErrorHandler(res, "Something Went Wrong!!", 404);
    }
    if (req.type === "Student") {
        const GetedClass = await Class.findById(classDetails.classID);
        const student = await Student.findById(req.Id!);
        const studentName = student?.fullName;
        
        // Get teacher's socket ID
        const teacherSocketId = TeacherSockets.get(classDetails.teacherName);
        
        if (teacherSocketId) {
            io.to(teacherSocketId).emit("aproval", { name: studentName, erno:student?.enrollmentNumber, isPresent: true });
            GetedClass?.presentStudent.push(req.Id!); //Replace Here Enrollment Number ...
            await GetedClass?.save();
        }

        res.status(200).json({
            success: true,
            message: "Done"
        });
    } else {
        return ErrorHandler(res, "Your Not Student!!", 404);
    }
});

export const GetLiveClass = TryCatch(async(req:Request , res:Response , next:NextFunction)=>{
    const {enrollmentNumber} = req.body;

    const classes = await Class.find({ allStudent: { $in: [enrollmentNumber] } });

    const currentTime = moment().toDate().toString();
    const date = new Date(currentTime);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const LiveClasses:any[] = [];
    

    classes.map((i)=>{
        console.log(time > i.starting , i.ending >= time);
        
        if(time > i.starting && i.ending > time){
            LiveClasses.push(i)
        }
    })
    res.status(200).json({
        success:true ,
        LiveClasses
    })
});

export const GetUpcomingClass = TryCatch(async(req:Request , res:Response , next:NextFunction)=>{
    const {enrollmentNumber} = req.body;

    const classes = await Class.find({ allStudent: { $in: [enrollmentNumber] } });

    const currentTime = moment().toDate().toString();
    const date = new Date(currentTime);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const LiveClasses:any[] = [];
    

    classes.map((i)=>{
        console.log(time > i.starting , i.ending >= time);
        
        if(time < i.starting ){
            
            LiveClasses.push(i)
        }
    })
    res.status(200).json({
        success:true ,
        LiveClasses
    })
})