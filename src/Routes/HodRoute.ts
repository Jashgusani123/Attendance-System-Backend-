import express from 'express'
import { Get7DaysData, GetAllCards, GetAllStudents, GetAllTeachers, GetAttendaceOverview, GetNotification, GetOverview, GetPersentagesOFPresentAbsentIn7Days, GetTeacherInfoFromId, login, Logout, Present_Absent_cards, Register, SendNotification } from '../Controllers/HodControll'
import { GetUser } from '../Utils/Authentication'
const app = express()

app.post("/register" , Register)
app.post("/login" , login)
app.get("/logout" , Logout)
// Dashboard
app.get("/getallstudent" , GetUser ,GetAllStudents )
app.get("/getallteacher" , GetUser ,GetAllTeachers )
app.get("/getnotification" , GetUser ,GetNotification )
// ManagePage
app.post("/teacherinfo"  ,GetTeacherInfoFromId )
app.post("/sendnotifiction" ,GetUser ,SendNotification )
// AnalysisPage
app.post("/absent_present_data"  ,GetPersentagesOFPresentAbsentIn7Days )
app.post("/last7daysoverview"  ,Get7DaysData )
app.post("/getapcard"  ,Present_Absent_cards )
// ViewPage
app.get("/getallcard"  ,GetAllCards )
app.get("/getoverview"  ,GetOverview )
app.get("/getattendaceoverview"  ,GetAttendaceOverview )

export default app