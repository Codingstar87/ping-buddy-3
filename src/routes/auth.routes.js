import { Router } from "express";
import { signUp, logIn, logOut, updateProfile, checkAuth, verifyOTP, forgotPassword } from "../controllers/users.controllers.js";
import protectRoute from "../middleware/auth.middleware.js";


const routes = Router()

routes.post("/signup", signUp)
routes.post("/login", logIn)
routes.post("/logout", logOut)

routes.post("/forgot-password", forgotPassword )
routes.post("/verify-otp", verifyOTP )

routes.put("/update-profile", protectRoute, updateProfile);

routes.get("/check-auth", protectRoute, checkAuth)


export default routes ;