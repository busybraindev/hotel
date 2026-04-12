import express, { Router } from "express"
import {protect} from "../middlewares/auth.js"
import { reg } from "../controllers/Hotelcontroller.js"

const hotelRouter =Router()
hotelRouter.post("/",protect,reg)
export default hotelRouter;
