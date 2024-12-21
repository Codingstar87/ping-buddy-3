import { Router } from "express";
import protectRoute from "../middleware/auth.middleware.js";
import  {getUserForSidebar, getmessages, sendmessage } from "../controllers/message.controllers.js";

const router =  Router()

router.get("/users",protectRoute, getUserForSidebar)

router.get("/:id" , protectRoute , getmessages)

router.post("/send/:id",protectRoute, sendmessage)



export default router ;