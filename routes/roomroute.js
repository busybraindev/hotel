import express, { Router } from "express"
import upload from "../middlewares/upload.js"
import{protect} from "../middlewares/auth.js"
import { createRoom, getOwnerRooms, getRoom, toogleRoom } from "../controllers/roomcontroller.js"

const roomRouter = Router()
roomRouter.post("/", upload.array("images",4),protect,createRoom)
roomRouter.get("/", getRoom)
roomRouter.get("/owner", protect, getOwnerRooms)
roomRouter.post("/toogle-availability",protect, toogleRoom)
export default roomRouter