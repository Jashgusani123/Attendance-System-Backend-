import express from 'express'
import { Register, login, Logout, GetAllStudents , GetAllTeachers, GetTeacherInfoFromId , GetPersentagesOFPresentAbsentIn7Days, Get7DaysData, Present_Absent_cards} from '../Controllers/AdminControll'
import { GetUser } from '../Utils/Authentication'
const app = express()

app.post("/register" , Register)
app.post("/login" , login)
app.get("/logout" , Logout)
app.get("/getallstudent" , GetUser ,GetAllStudents )
app.get("/getallteacher" , GetUser ,GetAllTeachers )
app.post("/teacherinfo"  ,GetTeacherInfoFromId )
app.post("/absent_present_data"  ,GetPersentagesOFPresentAbsentIn7Days )
app.post("/last7daysoverview"  ,Get7DaysData )
app.post("/getapcard"  ,Present_Absent_cards )

export default app