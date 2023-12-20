import express from 'express'
import connectDb from './config/connectDb.js';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors'

//config dotenv
dotenv.config();

//express instance
const app = express();

//monogDB conncection
connectDb();

//middleware
app.use(express.json())
app.use(cors())
app.use(cookieParser())

//import routes
import appRoute from './routes/appRoute.js'
import { userModel } from './models/userModel.js';

//routes
app.use('/api/v1', appRoute)

// app.get('/user/:id', async(req, resp)=>{
//     const user = await userModel.findById(req.params._id)
//     resp.send({
//         success : true,
//         message : 'Success...',
//         user
//     })
// })


//listen
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server in Running on ${PORT} on ${process.env.NODE_MODE} mode`)
})
