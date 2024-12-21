import nodemailer from "nodemailer" ;

const sendVerificationEmail = async (email, otp) => {
    try {
        
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: email, 
            subject: "Your OTP for Password Reset",
            text: `Your OTP for resetting your password is: ${otp}.\n\nThis OTP will expire in 2 minutes. Please do not share it with anyone.`,
            html: `<p>Your OTP for resetting your password is: <b>${otp}</b>.</p><p>This OTP will expire in 2 minutes. Please do not share it with anyone.</p>`,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email");
    }
};



export { sendVerificationEmail };