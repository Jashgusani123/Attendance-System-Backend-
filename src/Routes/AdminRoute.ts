import express from 'express'
import { Register, login, Logout, GetAllStudents , GetAllTeachers, GetTeacherInfoFromId} from '../Controllers/AdminControll'
import { GetUser } from '../Utils/Authentication'
const app = express()

app.post("/register" , Register)
app.post("/login" , login)
app.get("/logout" , Logout)
app.get("/getallstudent" , GetUser ,GetAllStudents )
app.get("/getallteacher" , GetUser ,GetAllTeachers )
app.post("/teacherinfo"  ,GetTeacherInfoFromId )

export default app