import express from 'express'
import { AcceptPandingRequest, CreatePandingRequest, DeletePandingRequest, RejectPandingRequest } from '../Controllers/PandingControll';
import { GetUser } from '../Utils/Authentication';


const app = express();

app.post("/create" , CreatePandingRequest)
app.post("/accept" , AcceptPandingRequest)
app.post("/reject" , RejectPandingRequest)
app.delete("/delete" , GetUser ,DeletePandingRequest)

export default app;