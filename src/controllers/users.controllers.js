import { User } from "../models/users.models.js"
import bcrypt from "bcryptjs" ;
import generateToken from "../utils/utils.js";
import cloudinary from "../lib/cloudinary.js";
import OTP from "../models/mail.models.js";
import {  sendVerificationEmail } from "../mail/nodemailer.js";

const signUp = async(req,res) => {
    const {email,userName,password} = req.body
    try {
        if (
            [ email , userName , password].some((field)=> field?.trim() === "")
        ) {
            return res.status(400).json({meassage : "All feilds are required"})
        }

        if(password.length < 6) {
            return res.status(400).json({meassage : "Password must be at least 6 characters"})
        }

        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message : "Email aleady exits "})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            email,
            userName,
            password : hashedPassword
        })

        if(newUser){                                                        // jdi akta new user create hoi tyle akta jwt token create hoiboo and idare aiber browser a padon lgbo 
            generateToken(newUser._id,res)
            await newUser.save()

            res.status(201).json({
                _id : newUser._id,
                userName : newUser.userName,
                email : newUser.email,
                profilePic : newUser.profilePic
            })

        }else{
            res.status(400).json({message : "Invaild user data"})

        }

    } catch (error) {
        console.log("Error in signup controller ", error.meassage)
        res.status(500).json({message : "Error in signup controller"})
        
    }
}

const retryAttempts = {};

const logIn = async (req, res) => {
    const { email, password } = req.body;
    const maxAttempts = 3;

    try {
        if (!retryAttempts[email]) retryAttempts[email] = 0;
        if (retryAttempts[email] >= maxAttempts) {
            return res.status(429).json({
                message: "Too many failed attempts. Please try again later.",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            retryAttempts[email]++;
            return res.status(401).json({
                message: `Password is incorrect. Attempts left: ${
                    maxAttempts - retryAttempts[email]
                }`,
            });
        }

        delete retryAttempts[email];

        generateToken(user._id, res);
        return res.status(200).json({
            _id: user._id,
            userName: user.userName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        return res.status(500).json({ message: "Error in login controller" });
    }
};


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const otp = generateOTP(); 
        const expiresAt = Date.now() +   60 * 1000; 

        const updatedOTP = await OTP.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        if (updatedOTP.otp !== otp) {
            console.error("Mismatch in OTP stored and generated");
            return res.status(500).json({ message: "Error generating OTP" });
        }

        await sendVerificationEmail(email, otp);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const record = await OTP.findOne({ email });
        if (!record) {
            return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
        }

        const { otp: storedOtp, expiresAt } = record;

        if (Date.now() > expiresAt) {
            await OTP.deleteOne({ email });
            return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
        }

        if (storedOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        const token = generateToken(user._id ,res);

        await OTP.deleteOne({ email });

        return res.status(200).json({
            message: "OTP verified successfully",
            _id: user._id,
            userName: user.userName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const logOut = (req, res) => {
    try {

        res.cookie("jwt", "", {maxAge : 0})  
        res.status(200).json({message : "Logout successfully"})
    } catch (error) {
        console.log("Error in logout controller ", error.meassage)
        res.status(500).json({message : "Error in logout controller"})
    }
    
}



const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updateUser);
    } catch (error) {
        console.log("Error in updateProfile controller: ", error.message);
        res.status(500).json({ message: "Error in updateProfile controller" });
    }
};



const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller ", error.meassage)
        res.status(500).json({message : "Error in checkAuth controller"})
    }
};





export {signUp  , logIn , logOut , updateProfile , checkAuth , forgotPassword ,verifyOTP }