import express, { Router } from "express"
import { check, createBook, getHotelBook, getUserBook, Payment, verify } from "../controllers/bookct.js"
import { protect } from "../middlewares/auth.js"

 
const bookingRouter =Router()

bookingRouter.post("/check-availability",check)
bookingRouter.post('/book',protect,createBook)
bookingRouter.get("/user", protect,getUserBook)
bookingRouter.get("/hotel",protect,getHotelBook)
bookingRouter.post('/paystack-payment',protect,Payment)
bookingRouter.post('/verify',protect,verify)
export default bookingRouter