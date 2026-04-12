import express, { Router } from "express"
import { check, createBook, getHotelBook, getUserBook } from "../controllers/bookct.js"
import { protect } from "../middlewares/auth.js"
 
const bookingRouter =Router()

bookingRouter.post("/check-availability",check)
bookingRouter.post('/book',protect,createBook)
bookingRouter.get("/user", protect,getUserBook)
bookingRouter.get("/hotel",protect,getHotelBook)
export default bookingRouter