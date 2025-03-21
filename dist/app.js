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
exports.TeacherSockets = exports.server = exports.io = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http"); // Import for creating an HTTP server
const socket_io_1 = require("socket.io");
const ConnectDB_1 = __importDefault(require("./config/ConnectDB"));
const Student_1 = __importDefault(require("./Models/Student"));
const Teacher_1 = __importDefault(require("./Models/Teacher"));
const ClassRoute_1 = __importDefault(require("./Routes/ClassRoute"));
const NotificationRoute_1 = __importDefault(require("./Routes/NotificationRoute"));
const StudentRoutes_1 = __importDefault(require("./Routes/StudentRoutes"));
const TeacherRoutes_1 = __importDefault(require("./Routes/TeacherRoutes"));
const RequestRoute_1 = __importDefault(require("./Routes/RequestRoute"));
const Authentication_1 = require("./Utils/Authentication");
dotenv_1.default.config(); // Load environment variables
const PORT = process.env.PORT || 5000;
// Initialize Express App
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["https://attendance-system-txfn.onrender.com", "http://192.168.0.192:5173/", "http://localhost:5173", process.env.FRONTEND],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use((0, cookie_parser_1.default)());
// Connect to MongoDB
(0, ConnectDB_1.default)();
// setupGoogleCredentials();
// Create HTTP Server for Socket.IO
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://192.168.0.192:5173/",
            "https://attendance-system-txfn.onrender.com",
            process.env.FRONTEND
        ],
        credentials: true,
    },
});
exports.io = io;
const StudentSockets = new Map();
const TeacherSockets = new Map();
exports.TeacherSockets = TeacherSockets;
// Socket.IO Connection
io.on("connection", (socket) => {
    console.log(`⚡ New Client Connected: ${socket.id}`);
    // Store student erno when they join
    socket.on("register-student", (erno) => {
        StudentSockets.set(erno, socket.id);
        console.log(`Student Registered: ${erno} -> ${socket.id}`);
    });
    socket.on("register-teacher", (name) => {
        TeacherSockets.set(name, socket.id);
        console.log(`Teacher Registered: ${name} -> ${socket.id}`);
    });
    // Handle class going live
    socket.on("start-class", (students, classDetails, classID) => {
        students.forEach(erno => {
            const studentSocketId = StudentSockets.get(erno);
            if (studentSocketId) {
                io.to(studentSocketId).emit("class-live", classDetails, classID);
                console.log(`📢 Class Live Notification sent to: ${erno}`);
            }
            if (socket) {
                io.to(socket.id).emit("class-live", classDetails);
            }
        });
    });
    socket.on("attendance_approved", (upperHeadding, description) => {
        io.to(socket.id).emit("Notification_of_attendance", upperHeadding, description);
    });
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
// Routes
app.get("/", (req, res) => {
    res.send("Hello World from Vercel!👋🏻");
});
app.use("/student", StudentRoutes_1.default);
app.use("/teacher", TeacherRoutes_1.default);
app.use("/class", ClassRoute_1.default);
app.use("/notification", NotificationRoute_1.default);
app.use("/request", RequestRoute_1.default);
app.get("/getuser", Authentication_1.GetUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let model = null;
        if (req.type === "Student") {
            model = Student_1.default;
        }
        else if (req.type === "Teacher") {
            model = Teacher_1.default;
        }
        if (!model || !req.Id) {
            res.status(400).json({ message: "Invalid user type or ID" });
            return;
        }
        const user = yield model.findById(req.Id).exec();
        if (!user) {
            res.status(404).json({ message: `${req.type} not found` });
            return;
        }
        res.json({ success: true, type: req.type, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}));
// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
