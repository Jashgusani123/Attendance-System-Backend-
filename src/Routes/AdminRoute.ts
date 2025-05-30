import express from 'express'
import { allUsers, bySearchCollege, CardDataGoted, CreateCollege, Departments, FirstTable, GetAllCollege, getAllFromClgAndDept, GetClasses, GetCollege, GetRequests } from '../Controllers/AdminControll';
import { upload } from '../Utils/Multer';

const Route = express();

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



export default Route