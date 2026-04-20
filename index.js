import express from "express"
import "dotenv/config"
import cors from "cors"
import connectDb from "./config/Db.js"
import { clerkMiddleware, getAuth } from '@clerk/express'
import cw from "./controllers/Cwebhook.js"
import userRouter from "./routes/userRoutes.js"
import hotelRouter from "./routes/Hotelroutes.js"
import connectD from "./config/cloud.js"
import roomRouter from "./routes/roomroute.js"
import bookingRouter from "./routes/bookRt.js"

//  const { userId } = getAuth(req)
connectDb()
connectD()
const app=express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(clerkMiddleware())

app.use('/api/clerk', express.raw({ type: 'application/json' }), cw)

app.use(express.json())
app.use("/api/user",userRouter)
app.use("/api/hotels",hotelRouter)
app.use("/api/room",roomRouter)
app.use('/api/bookings', bookingRouter)


const PORT =process.env.PORT || 4000
app.listen(PORT, ()=>{
    console.log(`Sever running on port ${PORT}`);
    
})