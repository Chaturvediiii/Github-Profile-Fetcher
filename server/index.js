import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log('Connected to MongoDb')
}).catch((err)=>{
    console.log(err);
})

const app = express();
const PORT = process.env.PORT

app.listen(PORT,(req,res)=>{
    console.log(`Server is running on PORT ${PORT}`);
})