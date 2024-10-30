import mongoose from "mongoose";

import dotenv from 'dotenv';
dotenv.config();

if(process.env.MONGODB_URL)
mongoose
  .connect(process.env.MONGODB_URL)
  .then((success) => {
    console.log("connected,connected.....");
  })
  .catch((err) => console.log(err));
