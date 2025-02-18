import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../Middlewares/error";
import Class from "../Models/Class";
import Student from "../Models/Student";
import Teacher from "../Models/Teacher";
import { AuthRequest } from '../Utils/Authentication';
import { ErrorHandler } from "../Utils/ErrorHandling";

export const CreateClass = TryCatch(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const {  departmentName, ending, semester, starting, subjectName, location } = req.body;
    
    // console.log(req.Id);
    
    const teacher = await Teacher.findById(req.Id);


    const allStudents = await Student.find({
        collegeName: { $regex: new RegExp(`^${teacher?.collegeName}$`, "i") },
        departmentName: { $regex: new RegExp(`^${departmentName}$`, "i") },
        semester
    }).select("enrollmentNumber");

    const allStudent = allStudents.map(student => student.enrollmentNumber);

    const newClass = await Class.create({
        collegeName:teacher?.collegeName, departmentName, ending, semester, starting, subjectName, allStudent, location, createdBy:req.Id
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
})
