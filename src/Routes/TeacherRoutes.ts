import express from "express";
import { GenerateExcel, GetAllAttendance, GetClasses, GetLastsClasses, GetOverview, GetTeacher, login, Logout, Register, SendNotification } from "../Controllers/TeacherContoll";
import { GetUser } from '../Utils/Authentication';

const app = express();

app.post("/register", Register);
app.post("/login", login);
app.get("/logout" , GetUser , Logout)
app.get("/getclasses" , GetUser , GetClasses)
app.get("/getteacher" , GetUser , GetTeacher)
app.post("/attendance"  , GetAllAttendance)
app.get("/overview" , GetUser , GetOverview)
app.get("/lastclasses" , GetUser , GetLastsClasses)
app.post("/excelsheet" , GetUser , GenerateExcel)
app.post("/sendnotification" , GetUser , SendNotification)

export default app;
