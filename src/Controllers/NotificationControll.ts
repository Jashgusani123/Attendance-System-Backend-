import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { TryCatch } from "../Middlewares/error";
import Hod from "../Models/Hod";
import Notification from "../Models/Notification";
import Student from "../Models/Student";
import Teacher from "../Models/Teacher";
import { AuthRequest } from "../Utils/Authentication";
import { ErrorHandler } from "../Utils/ErrorHandling";


export const CreateNotification = TryCatch(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    type,
    allStudent,
    upperHeadding,
    description,
    to,
    pendingId,
  }: {
    type: string;
    allStudent: string;
    upperHeadding: string;
    description: string;
    to: string;
    pendingId: string;
  } = req.body;

  let userType = "";
  if (req.type === "Teacher") {
    userType = "Teacher";
  } else if (req.type === "Hod" || req.type === "Pending") {
    userType = "Hod";
  } else {
    userType = "Admin";
  }

  if (type === process.env.CLASSCREATION && allStudent) {
    if (!upperHeadding || !description) {
      res.status(400).json({ success: false, message: "Provide Title and Description!" });
      return;
    }

    const notification = await Notification.create({
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
  } else if (type === process.env.WELLCOME && to) {
    const notification = await Notification.create({
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
  } else if (type === "request" && to && pendingId) {
    const notification = await Notification.create({
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
  } else if (userType === "Admin" && type === "adminmessage") {
    if (to === "All") {
      const [Students, Teachers, Hods] = await Promise.all([
        Student.find().select("_id"),
        Teacher.find().select("_id"),
        Hod.find().select("_id"),
      ]);

      const allUsers = [
        ...Students.map((s) => s._id),
        ...Teachers.map((t) => t._id),
        ...Hods.map((h) => h._id),
      ];

      await Notification.create({
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
    } else if (mongoose.Types.ObjectId.isValid(to)) {
      await Notification.create({
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
    } else {
      const clganddepart = to.split("-").map((s) => s.trim());

      if (clganddepart[1] === "All") {
        const [Students, Teachers, Hods] = await Promise.all([
          Student.find({ collegeName: clganddepart[0] }).select("_id"),
          Teacher.find({ collegeName: clganddepart[0] }).select("_id"),
          Hod.find({ collegeName: clganddepart[0] }).select("_id"),
        ]);
        const allUsers = [
          ...Students.map((s) => s._id),
          ...Teachers.map((t) => t._id),
          ...Hods.map((h) => h._id),
        ];
        await Notification.create({
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
      } else if (clganddepart[1] === "Students") {
        const Students = await Student.find({
          collegeName: clganddepart[0]
        }).select("_id");
        const allUsers = Students.map((s) => s._id);
        await Notification.create({
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
      } else if (clganddepart[1] === "Teachers") {
        const Teachers = await Teacher.find({
          collegeName: clganddepart[0],
        }).select("_id");
        const allUsers = Teachers.map((t) => t._id);
        await Notification.create({
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
      } else if (clganddepart[1] === "Hods") {
        const Hods = await Hod.find({
          collegeName: clganddepart[0],
        }).select("_id");
        const allUsers = Hods.map((h) => h._id);
        await Notification.create({
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
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid Department Specified",
        });
      }
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Notification Not Created",
    });
  }
});


export const GetUserNotifications = TryCatch(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { erno, id } = req.body;

    if (!erno && !id) {
        return ErrorHandler(res, "Enter Your Enrollment Number Or Id...", 404);
    }
    let allNotification;
    if (erno && !id) {
        allNotification = await Notification.find({
            $or: [
                { to: erno },
                { allStudent: { $in: [erno] } }
            ]
        }).select("upperHeadding description type");
        res.status(200).json({ success: true, notifications: allNotification });
    } else if (id && !erno) {
        
        allNotification = await Notification.find({
          $or: [
            { to: id },
            { allUsers: id } // Match if user's ID is in the allUsers array
          ]
        }).select("upperHeadding description type");
      
        res.status(200).json({ success: true, notifications: allNotification });
      }
      


});

