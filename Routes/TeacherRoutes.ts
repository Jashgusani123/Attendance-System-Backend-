import express from "express";
import { GenerateExcel, GetAllAttendance, GetClasses, GetLastsClasses, GetOverview, getTeacher, login, Logout, Register } from "../Controllers/TeacherContoll";
import { GetUser } from '../Utils/Authentication';

const app = express();

app.post("/register", Register);
app.post("/login", login);
app.get("/logout" , GetUser , Logout)
app.get("/getclasses" , GetUser , GetClasses)
app.get("/getteacher" , GetUser , getTeacher)
app.post("/attendance"  , GetAllAttendance)
app.get("/overview" , GetUser , GetOverview)
app.get("/lastclasses" , GetUser , GetLastsClasses)
app.post("/excelsheet" , GetUser , GenerateExcel)

export default app;
