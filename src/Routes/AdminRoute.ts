import express from 'express'
import { allUsers, bySearchCollege, CardDataGoted, CreateCollege, DeleteNotification, Departments, FirstTable, GetAllCollege, getAllFromClgAndDept, GetAllNotifications, GetClasses, GetCollege, GetRequests, handleFingerprintLogin, handleRegistation, login, Logout, Registraction } from '../Controllers/AdminControll';
import { upload } from '../Utils/Multer';
import { GetUser } from '../Utils/Authentication';

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
Route.put("/register-credential" , GetUser ,handleRegistation);
Route.put("/login-fingerprint", handleFingerprintLogin);




export default Route