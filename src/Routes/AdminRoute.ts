import express from 'express';
import { allUsers, bySearchCollege, CardDataGoted, CreateCollege, DeleteNotification, Departments, FirstTable, GetAllCollege, getAllFromClgAndDept, GetAllNotifications, GetClasses, GetCollege, GetRequests, login, loginChallengeForFingerprint, loginFingerVerify, Logout, RegistationPasskey, Registraction, verifyRegistrationPasskey } from '../Controllers/AdminControll';
import { upload } from '../Utils/Multer';

const Route = express();

Route.post("/registraction" , Registraction);
Route.post("/login" , login);
Route.post("/logout" , Logout);

Route.post("/createclg", upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "image", maxCount: 1 },
]), CreateCollege);

Route.get("/getallcolleges" , GetAllCollege);
Route.get("/search" , bySearchCollege);
Route.get("/firstcards" , CardDataGoted);
Route.get("/alluser" , allUsers);
Route.get("/college" , GetCollege);
Route.get("/firsttable" , FirstTable);
Route.get("/getdepartments" , Departments);
Route.get("/getclasses" , GetClasses);
Route.get("/getrequests" , GetRequests);
Route.post("/getnames" , getAllFromClgAndDept);
Route.get("/getnotifications" , GetAllNotifications);
Route.delete("/deletenotification" , DeleteNotification);
Route.post("/register-credential" ,RegistationPasskey);
Route.post("/verify-credential" ,verifyRegistrationPasskey);
Route.post("/login-credential" ,loginChallengeForFingerprint);
Route.post("/login-verify" ,loginFingerVerify);




export default Route