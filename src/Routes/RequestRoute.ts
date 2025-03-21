import express from 'express'
import { CreateRequest } from '../Controllers/RequestControll';

const app = express();

app.post("/create" , CreateRequest);

export default app;
