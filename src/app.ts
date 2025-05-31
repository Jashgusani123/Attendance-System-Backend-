import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from "dotenv";
import express, { Response } from "express";
import { createServer } from "http"; // Import for creating an HTTP server
import { Model } from 'mongoose';
import { Server, Socket } from "socket.io";
import connectDB from "./config/ConnectDB";
import Hod from "./Models/Hod";
import Panding from './Models/Panding';
import Student from "./Models/Student";
import Teacher from "./Models/Teacher";
import ClassRoute from './Routes/ClassRoute';
import HodRoutes from './Routes/HodRoute';
import NotificationRoute from './Routes/NotificationRoute';
import PandingRoute from './Routes/PandingRoute';
import StudetRoutes from './Routes/StudentRoutes';
import SupportedRoutes from './Routes/SupportedRoutes';
import AdminRoute from './Routes/AdminRoute';
import TeacherRoutes from './Routes/TeacherRoutes';
import { AuthRequest, GetUser } from "./Utils/Authentication";
import { setupGoogleCredentials } from './config/setupGCP';
import { cloudinaryConfig } from './config/Cloudinary';
import Admin from './Models/Admin';

dotenv.config(); // Load environment variables
const PORT = process.env.PORT || 5000;

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: ["https://attendance-system-txfn.onrender.com", "http://192.168.0.192:5173/", "http://localhost:5173" , process.env.FRONTEND!],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(cookieParser());

// Connect to MongoDB
connectDB();
setupGoogleCredentials();
cloudinaryConfig();
// Create HTTP Server for Socket.IO


const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.192:5173/",
      "https://attendance-system-txfn.onrender.com",
      process.env.FRONTEND!
    ],
    credentials: true,
  },
});

const StudentSockets = new Map<string, string>();
const TeacherSockets = new Map<string, string>();

// Socket.IO Connection
io.on("connection", (socket: Socket) => {
  console.log(`⚡ New Client Connected: ${socket.id}`);

  // Store student erno when they join
  socket.on("register-student", (erno: string) => {
    StudentSockets.set(erno, socket.id);
    console.log(`Student Registered: ${erno} -> ${socket.id}`);
  });


  socket.on("register-teacher" , (name:string)=>{
    TeacherSockets.set(name, socket.id);
    console.log(`Teacher Registered: ${name} -> ${socket.id}`);
  })

  // Handle class going live
  socket.on("start-class", (students: string[], classDetails: object , classID:String) => {
    students.forEach(erno => {
      const studentSocketId = StudentSockets.get(erno);
      if (studentSocketId) {
        io.to(studentSocketId).emit("class-live", classDetails,classID);
        console.log(`📢 Class Live Notification sent to: ${erno}`);
      }
      if(socket){
        io.to(socket.id).emit("class-live", classDetails)
      }
    });
  });

  socket.on("attendance_approved" , (upperHeadding , description)=>{
    io.to(socket.id).emit("Notification_of_attendance" , upperHeadding , description);
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    StudentSockets.forEach((id, erno) => {
      if (id === socket.id) {
        StudentSockets.delete(erno);
        console.log(`🚪 Student Disconnected: ${erno}`);
      }
    });
  });

  socket.on("disconnect", () => {
    TeacherSockets.forEach((id, name) => {
      if (id === socket.id) {
        TeacherSockets.delete(name);
        console.log(`🚪 Student Disconnected: ${name}`);
      }
    });
  });

});

// Routes - v0
app.get("/", (req, res) => {
  res.send("Hello World from Server!👋🏻");
});
app.use("/student", StudetRoutes);
app.use("/teacher", TeacherRoutes);
app.use("/class" , ClassRoute);
app.use("/notification" , NotificationRoute);
app.use("/hod" , HodRoutes);
app.use("/panding" , PandingRoute);

app.get("/getuser", GetUser, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let model: Model<any> | null = null;
    if (req.type === "Student") {
      model = Student;
    } else if (req.type === "Teacher") {
      model = Teacher;
    } else if (req.type === "Hod"){
      model = Hod;
    }else if (req.type === "Admin"){
      model = Admin;
    } else {
      model = Panding;
    }

    if (!model || !req.Id) {
      res.status(400).json({ message: "Invalid user type or ID" });
      return;
    }

    const user = await model.findById(req.Id).exec();
    
    if (!user) {
      res.status(404).json({ message: `${req.type} not found` });
      return;
    }
    
    res.json({ success: true, type: req.type, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Routes - v1
app.use("/api/v1/supported" , SupportedRoutes);
app.use("/api/v1/admin" , AdminRoute);


// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io, server, TeacherSockets };

