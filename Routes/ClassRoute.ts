import express from "express";
import { CreateClass, GetAll , GetLiveClass, GetUpcomingClass, Accept} from '../Controllers/ClassControll';
import { GetUser } from "../Utils/Authentication";

const app = express();

app.post("/create" ,GetUser ,CreateClass)
app.post("/getAll" , GetAll)
app.post("/getliveclasses" , GetLiveClass)
app.post("/getupcomingclasses" , GetUpcomingClass)
app.post("/accept" , GetUser, Accept)



export default app;
