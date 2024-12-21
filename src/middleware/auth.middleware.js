import jwt, { decode } from "jsonwebtoken" ;
import { User } from "../models/users.models.js";

const protectRoute = async(req,res,next) => {
    try {
        const token = req.cookies.jwt   
        if(!token){
            return res.status(401).json({message : "Unauthorized - No token provided"})
        }

        const checkToken = jwt.verify(token,process.env.JWT_SECRET)
        if(!checkToken){
            return res.status(401).json({message : "Unauthorized - Invalid Token "})
        }

        const user = await User.findById(checkToken.userId).select("-password")
        if(!user){
            return res.status(401).json({message : "user not found "})

        }
        
        req.user = user

        next()
    } catch (error) {
        console.log("Error in protectRoute Middleware ", error.message)
        res.status(500).json({message : "Error in protectRoute middleware"})
    }
}


export default protectRoute ;