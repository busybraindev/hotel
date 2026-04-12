import express, { Router } from "express"
import { protect } from "../middlewares/auth.js"
import { getUser, SRs } from "../controllers/userCt.js"

const userRouter =Router()
userRouter.get("/",protect,getUser)
userRouter.post("/store",protect,SRs)

export default userRouter;